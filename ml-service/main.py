import os
import traceback
from typing import List
from fastapi import FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware

from nlp_pipeline import analyze_resume
from text_extraction import extract_text

ALLOWED_ORIGINS_ENV = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://localhost:5173,http://127.0.0.1:5000,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS_ENV.split(",") if origin.strip()]

app = FastAPI(
    title="Resume Matcher ML Microservice V2",
    description="Classical ML/NLP microservice with TF-IDF match scoring, skill categorization, resume health diagnostics, and batch candidate ranking.",
    version="2.0.0"
)

# Enable CORS for explicit origins (resolves browser wildcard + allow_credentials error)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".txt"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB


def validate_file(filename: str, file_bytes: bytes) -> None:
    """
    Validates uploaded file extension and size before reading text into memory.
    Raises HTTPException(400) on validation failure.
    """
    if not filename or "." not in filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{filename}' has no valid file extension."
        )
    
    ext = "." + filename.rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        allowed_str = ", ".join(sorted(list(ALLOWED_EXTENSIONS)))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}' for file '{filename}'. Allowed types: {allowed_str}"
        )
    
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File '{filename}' exceeds maximum allowed size of {max_mb}MB."
        )


@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "Resume Matcher ML Microservice V2",
        "version": "2.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    """
    Accepts a single resume file (PDF, DOCX, TXT) and a Job Description text string.
    Validates file extension and size, extracts text, cleans text, computes TF-IDF cosine similarity match score, 
    and extracts matched vs missing skills, categorized breakdown, and resume health diagnostics.
    """
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )

    try:
        file_bytes = await file.read()
        if not file_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Uploaded file '{file.filename}' is empty."
            )

        # Validate file format & size
        validate_file(file.filename, file_bytes)

        resume_text = extract_text(file_bytes, file.filename)
        if not resume_text or not resume_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Could not extract text from file '{file.filename}'."
            )

        results = analyze_resume(raw_resume_text=resume_text, raw_jd_text=job_description)
        results["filename"] = file.filename
        results["extracted_resume_text"] = resume_text

        return results

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while analyzing resume: {str(e)}"
        )


@app.post("/analyze-batch")
async def analyze_batch(
    files: List[UploadFile] = File(...),
    job_description: str = Form(...)
):
    """
    Accepts multiple resume files and a single Job Description text string.
    Validates each file gracefully, analyzes all valid candidate resumes, 
    and returns a ranked leaderboard array sorted by match_score descending.
    (Strips extracted_resume_text from candidate objects to reduce batch payload size).
    """
    if not job_description or not job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )

    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload at least one resume file."
        )

    candidates = []
    errors = []

    for file in files:
        try:
            file_bytes = await file.read()
            if not file_bytes:
                errors.append(f"{file.filename}: Uploaded file is empty.")
                continue

            # Validate file format & size per file
            validate_file(file.filename, file_bytes)

            resume_text = extract_text(file_bytes, file.filename)
            if not resume_text or not resume_text.strip():
                errors.append(f"{file.filename}: Could not extract text.")
                continue

            results = analyze_resume(raw_resume_text=resume_text, raw_jd_text=job_description)
            results["filename"] = file.filename
            results["candidate_name"] = file.filename.rsplit('.', 1)[0].replace('_', ' ').replace('-', ' ').title()
            
            # Remove extracted_resume_text from batch candidate payloads to keep payload size lightweight
            results.pop("extracted_resume_text", None)

            candidates.append(results)

        except HTTPException as he:
            errors.append(f"{file.filename}: {he.detail}")
            continue
        except Exception as e:
            errors.append(f"Failed to analyze {file.filename}: {str(e)}")
            continue

    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not process any uploaded resumes. Errors: {'; '.join(errors)}"
        )

    # Sort candidates by match_score descending
    candidates.sort(key=lambda x: x["match_score"], reverse=True)

    # Add candidate ranks (#1 Gold, #2 Silver, #3 Bronze)
    for idx, candidate in enumerate(candidates):
        candidate["rank"] = idx + 1

    return {
        "success": True,
        "total_candidates": len(candidates),
        "candidates": candidates,
        "errors": errors
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

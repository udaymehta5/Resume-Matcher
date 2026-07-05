from fastapi.testclient import TestClient
from main import app, validate_file, HTTPException, MAX_FILE_SIZE_BYTES

client = TestClient(app)

def test_validation():
    print("Testing File Hardening & Validation...")
    
    # 1. Invalid Extension Test
    try:
        validate_file("malicious_script.exe", b"test content")
        print("FAIL: invalid extension allowed!")
    except HTTPException as e:
        print(f"[PASS] Unsupported extension rejected correctly: {e.detail}")
        
    # 2. Oversized File Test
    oversized_bytes = b"0" * (MAX_FILE_SIZE_BYTES + 100)
    try:
        validate_file("resume.txt", oversized_bytes)
        print("FAIL: oversized file allowed!")
    except HTTPException as e:
        print(f"[PASS] Oversized file rejected correctly: {e.detail}")

def test_api_endpoints():
    print("\nTesting FastAPI Hardened Endpoints via TestClient...")
    
    sample_text_bytes = b"Jane Doe Software Engineer Skills: Python, React, FastAPI, Node.js, Docker."
    
    # 1. Test single upload valid (.txt)
    response = client.post(
        "/analyze",
        files={"file": ("resume.txt", sample_text_bytes, "text/plain")},
        data={"job_description": "Looking for Python, React, and FastAPI engineer"}
    )
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    json_data = response.json()
    assert "extracted_resume_text" in json_data, "Single response should retain extracted_resume_text"
    print("[PASS] Single /analyze endpoint returns 200 and retains extracted_resume_text")
    
    # 2. Test batch resilience (2 valid + 1 invalid file)
    response_batch = client.post(
        "/analyze-batch",
        files=[
            ("files", ("candidate1.txt", sample_text_bytes, "text/plain")),
            ("files", ("candidate2.txt", b"Candidate 2 text with Python and React skills", "text/plain")),
            ("files", ("unsupported_image.png", b"png bytes", "image/png"))
        ],
        data={"job_description": "Looking for Python and React developer"}
    )
    assert response_batch.status_code == 200, f"Expected 200 batch response, got {response_batch.status_code}: {response_batch.text}"
    batch_json = response_batch.json()
    
    assert batch_json["total_candidates"] == 2, f"Expected 2 valid candidates, got {batch_json['total_candidates']}"
    assert len(batch_json["errors"]) == 1, "Expected 1 error in batch error list"
    assert "unsupported_image.png" in batch_json["errors"][0], "Error should name invalid file"
    
    # Check payload optimization: extracted_resume_text stripped from batch candidates
    for cand in batch_json["candidates"]:
        assert "extracted_resume_text" not in cand, "Batch candidate object must NOT contain extracted_resume_text"
        
    print("[PASS] Batch endpoint processes valid files, catches invalid files in errors array, and strips extracted_resume_text payload")

if __name__ == "__main__":
    test_validation()
    test_api_endpoints()
    print("\nALL FASTAPI HARDENING TESTS PASSED SUCCESSFULLY!")

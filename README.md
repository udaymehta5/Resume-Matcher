# 📄 Resume Screening Classifier (MERN + Python ML)

A high-performance, full-stack Resume Screening application that matches a candidate's resume (PDF/DOCX) against a job description using classical Machine Learning and Natural Language Processing techniques (TF-IDF vectorization, Cosine Similarity, spaCy entity recognition, and Skill-Relevant Noise Filtering). 

> **Strict Constraint Compliance:** Built without LLM APIs, Deep Learning, RAG, or vector databases. Pure mathematical ML using `scikit-learn` and `spaCy`.

---

## 🏗️ Architecture Overview

```
[ React Frontend (Vite + Tailwind + Recharts) ]
                      │
        Multipart Form Data (File + JD Text)
                      ▼
   [ Express Backend (Node.js + Multer + Mongoose) ] ◄──► [ MongoDB Database ]
                      │
          Forwards File + JD Text
                      ▼
  [ FastAPI ML Microservice (Python + spaCy + scikit-learn) ]
```

---

## ⚡ NLP Pipeline & Noise Reduction Engine

To maximize match score accuracy and eliminate boilerplate noise (addresses, references, filler text):

1. **Skill Keyword Extraction**: Detects technical and soft skills across 150+ canonical domain entries using regex boundary matching and spaCy `noun_chunks`/`ents`.
2. **Skill-Relevant Sentence Filtering**: Filters raw resume and job description text to keep **only lines/sentences containing detected skills**.
3. **spaCy Token Lemmatization**: Lowercases, removes punctuation/stopwords, and lemmatizes root tokens.
4. **TF-IDF Vector Space Model**: Computes bi-gram term-frequency inverse-document-frequency feature matrix.
5. **Cosine Similarity**: Calculates angular vector similarity score on noise-filtered text.

---

## 📁 Repository Structure

```
resume-screener/
├── client/                  # React Frontend (Vite + Tailwind CSS + Recharts)
│   ├── src/
│   │   ├── api/             # Axios instance & API calls
│   │   ├── components/      # UploadForm, ScoreGauge, SkillTags, KeywordChart, ResultsDashboard, HistoryList, Navbar
│   │   ├── App.jsx          # Main application layout & state
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                  # Express Gateway Backend (Node.js)
│   ├── controllers/         # analyzeController.js, historyController.js
│   ├── middleware/          # upload.js (Multer), errorHandler.js
│   ├── models/              # Resume.js, MatchResult.js (Mongoose Schemas)
│   ├── routes/              # analyze.js, history.js
│   ├── .env                 # Environment configuration
│   ├── package.json
│   └── server.js
│
├── ml-service/              # Python FastAPI ML Microservice
│   ├── main.py              # FastAPI endpoints & CORS configuration
│   ├── text_extraction.py   # PDF & DOCX file parsers
│   ├── nlp_pipeline.py      # TF-IDF, Cosine Similarity, Noise Reduction & spaCy skill extractor
│   ├── skills_dictionary.py # Starter list of 150+ tech & soft skills
│   ├── test_service.py      # Standalone pipeline test script
│   └── requirements.txt     # Python dependencies
│
└── README.md
```

---

## ⚡ Quick Start & Local Setup

```bash
# 1. Start Python FastAPI ML Microservice (Port 8000)
cd ml-service
python -m uvicorn main:app --reload --port 8000

# 2. Start Express Backend (Port 5000)
cd server
npm run dev

# 3. Start React Frontend (Port 5173)
cd client
npm run dev
```

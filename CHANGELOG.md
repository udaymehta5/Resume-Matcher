# Changelog

All notable changes to the **Resume Matcher** application will be documented in this file.

---

## [2.3.0] - 2026-07-05

### Fixed
- **TF-IDF Score Compression Capping Fix**: Resolved structural design flaw where raw TF-IDF cosine similarity penalized resumes against repetitive job descriptions, capping 100% hard-skill fit candidates at ~75%.
- **Hybrid Score Rebalancing (Option A)**: Changed default weighting from 70% Skills / 30% TF-IDF to 85% Skills Coverage / 15% TF-IDF Cosine Similarity via global configuration constants `DEFAULT_SKILLS_WEIGHT = 0.85` and `DEFAULT_TFIDF_WEIGHT = 0.15`.
- **Fit-Based Score Floor Guard (Option B)**: Enforced document-asymmetry score floors:
  - Candidates matching **100% of hard skills** are guaranteed a minimum Hybrid Score floor of **85.0%** (`Perfect Match`).
  - Candidates matching **80%+ of hard skills** are guaranteed a minimum Hybrid Score floor of **75.0%** (`Strong Match`).

### Added
- **Test Suite Verification (`test_domain_bias_and_false_positives.py`)**: Added test cases for **Arjun Verma (Data Analyst, 100% hard skill fit -> 87.7% score)** and **Priya Sharma (Digital Marketing, 89.5% hard skill fit -> 75.0%+ score)** verifying score floor behavior.

---

## [2.2.0] - 2026-07-05

### Fixed
- **Soft vs. Hard Skill Separation**: Fixed bug where soft skills (e.g. `"collaboration"`, `"communication"`) were incorrectly grouped under `"Missing Key Job Requirements"` alongside hard technical skills. Soft skills are now extracted and categorized separately.
- **Match Label & Score Threshold Inconsistency**: Resolved threshold contradiction between the top evaluation banner (`"PERFECT MATCH FOR THIS JOB"`) and the gauge badge (`"Moderate Match"`). Created a single canonical source of truth [`client/src/utils/matchScore.js`](file:///c:/Users/udaym/OneDrive/Desktop/Resume%20Matcher/client/src/utils/matchScore.js) (`getMatchLabel`) used across all components.

---

## [2.1.0] - 2026-07-05

### Fixed
- **Domain Bias Bug Fix**: Fixed severe scoring failure on non-tech roles (e.g. Digital Marketing, Sales, Design) where hybrid match scores collapsed to near 0%.
- **False-Positive Skill Extraction**: Fixed issue where generic English words like `"go"` were extracted as programming language skills.
- **Domain-Adaptive Skill Taxonomy (`skills_taxonomy.json`)**: Expanded skills taxonomy beyond software engineering to include Marketing, Sales, UI/UX & Design, Finance, Operations, and Soft Skills.

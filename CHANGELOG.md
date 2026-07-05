# Changelog

All notable changes to the **Resume Matcher** application will be documented in this file.

---

## [2.2.0] - 2026-07-05

### Fixed
- **Soft vs. Hard Skill Separation**: Fixed bug where soft skills (e.g. `"collaboration"`, `"communication"`) were incorrectly grouped under `"Missing Key Job Requirements"` alongside hard technical skills. Soft skills are now extracted and categorized separately and do not unfairly drag down the hard skill coverage score.
- **Match Label & Score Threshold Inconsistency**: Resolved threshold contradiction between the top evaluation banner (`"PERFECT MATCH FOR THIS JOB"`) and the gauge badge (`"Moderate Match"`). Created a single canonical source of truth [`client/src/utils/matchScore.js`](file:///c:/Users/udaym/OneDrive/Desktop/Resume%20Matcher/client/src/utils/matchScore.js) (`getMatchLabel`) used across all components.

### Added
- **Hard Skills Primary Weighting**: Hard skills now account for 90% of the skill coverage score with soft skills providing a 10% informational bonus.
- **Canonical Match Threshold Utility (`getMatchLabel`)**: Standardized score thresholds:
  - `80% - 100%`: Perfect Match (Emerald Green)
  - `60% - 79.99%`: Strong Match (Light Green)
  - `40% - 59.99%`: Moderate Match (Amber / Orange)
  - `0% - 39.99%`: Weak Match (Rose / Red)
- **Unit & Integration Test Updates (`test_domain_bias_and_false_positives.py`)**: Added test cases verifying Priya Sharma soft-skill separation and threshold label consistency.

---

## [2.1.0] - 2026-07-05

### Fixed
- **Domain Bias Bug Fix**: Fixed severe scoring failure on non-tech roles (e.g. Digital Marketing, Sales, Design) where hybrid match scores collapsed to near 0%.
- **False-Positive Skill Extraction**: Fixed issue where generic English words like `"go"` (e.g., in "go to market strategy") and single-letter stopwords like `"a"` were extracted as programming language skills. Capitalized `"Go"` / `"Golang"` or technical context is now strictly required.
- **Low Skill Extraction Reweighting Guard**: Added adaptive dynamic reweighting. If fewer than 5 skills are detected in the Job Description, the scoring model dynamically scales down skill coverage weight and scales up TF-IDF text similarity weight.

### Added
- **Domain-Adaptive Skill Taxonomy (`skills_taxonomy.json`)**: Expanded skills taxonomy beyond software engineering to include Marketing, Sales, UI/UX & Design, Finance, Operations, and Soft Skills.

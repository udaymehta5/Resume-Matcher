import re
from typing import Dict, List, Set
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from skills_dictionary import (
    SKILLS_DB,
    HARD_SKILLS_DB,
    SOFT_SKILLS_DB,
    AMBIGUOUS_SHORT_SKILLS,
    GENERIC_STOPWORDS,
    normalize_skill,
    get_skill_category,
    is_soft_skill
)

# Named constants for hybrid scoring weights (Option A)
# Rebalanced from 70/30 to 85/15 because skill coverage is a much stronger, more reliable fit signal
# than raw term-frequency similarity between structurally different document types (resumes vs JDs).
DEFAULT_SKILLS_WEIGHT = 0.85
DEFAULT_TFIDF_WEIGHT = 0.15

# Load spaCy NLP model lazily/globally
try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    import spacy.cli
    spacy.cli.download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


def clean_text(text: str) -> str:
    """
    Cleans and lemmatizes input text using spaCy.
    Lowercases, removes punctuation, numbers, and stopwords.
    """
    if not text:
        return ""
    
    doc = nlp(text.lower())
    tokens = [
        token.lemma_ for token in doc 
        if not token.is_stop and not token.is_punct and not token.is_space and len(token.text.strip()) > 1
    ]
    return " ".join(tokens)


def extract_skills(raw_text: str) -> Set[str]:
    """
    Extracts skill keywords from raw text by:
    1. Regex matching against SKILLS_DB with strict rules for ambiguous short tokens ("go", "r", "c")
    2. spaCy Noun Chunks & Entity recognition matching
    3. Filtering out generic stopwords and false positives
    """
    if not raw_text:
        return set()

    found_skills = set()
    text_lower = raw_text.lower()

    # 1. Direct regex/string matching against skills database
    for skill in SKILLS_DB:
        skill_norm = normalize_skill(skill)
        
        # Strict handling for ambiguous short words ("go", "r", "c") to prevent false positives in general text
        if skill in AMBIGUOUS_SHORT_SKILLS:
            if skill == "go":
                # Match "Go" or "Golang" (must be capitalized "Go" or explicit "Golang")
                pattern_go = r'(?<![a-zA-Z0-9_])(Go|Golang)(?![a-zA-Z0-9_])'
                if re.search(pattern_go, raw_text):
                    found_skills.add("go")
            elif skill == "r":
                # Match standalone uppercase "R" (or "R programming", "R language")
                pattern_r = r'(?<![a-zA-Z0-9_])(R)(?![a-zA-Z0-9_])'
                if re.search(pattern_r, raw_text) and not re.search(r'(?i)\b(r&d|toys r us)\b', raw_text):
                    found_skills.add("r")
            elif skill == "c":
                # Match standalone uppercase "C" (or "C programming", "C language")
                pattern_c = r'(?<![a-zA-Z0-9_])(C)(?![a-zA-Z0-9_])'
                if re.search(pattern_c, raw_text):
                    found_skills.add("c")
            continue
        
        # Standard skill pattern with boundary assertions
        pattern = r'(?<![a-zA-Z0-9_])' + re.escape(skill) + r'(?![a-zA-Z0-9_])'
        if re.search(pattern, text_lower):
            if skill_norm not in GENERIC_STOPWORDS:
                found_skills.add(skill_norm)

    # 2. spaCy Noun Chunks & Entities matching
    doc = nlp(raw_text)
    for chunk in doc.noun_chunks:
        chunk_str = chunk.text.strip().lower()
        if chunk_str in SKILLS_DB and chunk_str not in GENERIC_STOPWORDS:
            if chunk_str not in AMBIGUOUS_SHORT_SKILLS or (chunk_str == "go" and re.search(r'\bGo\b', chunk.text)):
                found_skills.add(normalize_skill(chunk_str))

    for ent in doc.ents:
        ent_str = ent.text.strip().lower()
        if ent_str in SKILLS_DB and ent_str not in GENERIC_STOPWORDS:
            if ent_str not in AMBIGUOUS_SHORT_SKILLS or (ent_str == "go" and re.search(r'\bGo\b', ent.text)):
                found_skills.add(normalize_skill(ent_str))

    return found_skills


def extract_skill_relevant_text(raw_text: str, detected_skills: Set[str]) -> str:
    """
    Filters raw text to extract only sentences/lines containing skill keywords.
    Removes boilerplate noise (addresses, generic references, filler phrases).
    If filtering results in fewer than 20 words, falls back to the original text.
    """
    if not raw_text:
        return ""
    
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    relevant_lines = []
    
    skills_lookup = {skill.lower() for skill in detected_skills}
    
    for line in lines:
        line_lower = line.lower()
        contains_skill = any(
            re.search(r'(?<![a-zA-Z0-9_])' + re.escape(skill) + r'(?![a-zA-Z0-9_])', line_lower)
            for skill in skills_lookup
        )
        if contains_skill:
            relevant_lines.append(line)
            
    filtered_text = " ".join(relevant_lines)

    # Fallback to original text if filtered output is empty or too short (<20 words) for reliable TF-IDF
    if len(filtered_text.split()) >= 20:
        return filtered_text
    else:
        return raw_text


def compute_match_score(cleaned_resume: str, cleaned_jd: str) -> float:
    """
    Computes cosine similarity percentage (0.0 to 100.0) between resume and job description using TF-IDF.
    """
    if not cleaned_resume.strip() or not cleaned_jd.strip():
        return 0.0
    
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), min_df=1)
    tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_jd])
    
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    return round(float(similarity) * 100, 2)


def extract_top_keywords(raw_resume_text: str, raw_jd_text: str, top_n: int = 10) -> List[Dict]:
    """
    Extracts top N TF-IDF terms from the Job Description and compares their relative weights in Resume vs JD.
    Returns list of dicts: [{ "keyword": str, "jd_score": float, "resume_score": float }]
    """
    cleaned_resume = clean_text(raw_resume_text)
    cleaned_jd = clean_text(raw_jd_text)

    if not cleaned_jd.strip():
        return []

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=100, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_jd])
        feature_names = vectorizer.get_feature_names_out()

        resume_vector = tfidf_matrix[0].toarray()[0]
        jd_vector = tfidf_matrix[1].toarray()[0]

        scored_features = []
        for idx, feature in enumerate(feature_names):
            scored_features.append({
                "keyword": feature,
                "jd_score": round(float(jd_vector[idx]) * 100, 1),
                "resume_score": round(float(resume_vector[idx]) * 100, 1)
            })

        scored_features.sort(key=lambda x: x["jd_score"], reverse=True)
        return scored_features[:top_n]
    except Exception:
        return []


def compute_resume_health(raw_text: str) -> Dict:
    """
    Calculates Resume Formatting & Quality Health Score.
    """
    words = raw_text.split()
    word_count = len(words)

    doc = nlp(raw_text)
    verbs = [token.text for token in doc if token.pos_ in ("VERB", "AUX")]
    action_verb_count = len(verbs)

    tips = []
    score = 100

    # Word count check
    if word_count < 250:
        score -= 20
        tips.append("Resume length is brief (<250 words). Consider adding detailed project outcomes and technical achievements.")
    elif word_count > 900:
        score -= 15
        tips.append("Resume is lengthy (>900 words). Consider condensing bullet points into 1-2 pages.")

    # Action verb check
    if action_verb_count < 10:
        score -= 15
        tips.append("Low action verb count. Use strong action verbs like 'Engineered', 'Architected', 'Implemented', 'Optimized'.")

    # Numbers / Metrics check
    has_metrics = bool(re.search(r'\b\d+%\b|\$\d+|\b\d+\b', raw_text))
    if not has_metrics:
        score -= 10
        tips.append("Missing quantified metrics. Include percentages or dollar amounts (e.g. 'Improved API response speed by 35%').")

    if score == 100:
        tips.append("Excellent resume formatting! Optimal length and strong quantifiable achievements.")

    return {
        "health_score": max(score, 30),
        "word_count": word_count,
        "action_verb_count": action_verb_count,
        "has_metrics": has_metrics,
        "tips": tips
    }


def categorize_skills(skill_set: Set[str]) -> Dict[str, List[str]]:
    """Groups a set of skills by domain category."""
    categorized = {}
    for skill in sorted(list(skill_set)):
        cat = get_skill_category(skill)
        if cat not in categorized:
            categorized[cat] = []
        categorized[cat].append(skill)
    return categorized


def analyze_resume(raw_resume_text: str, raw_jd_text: str) -> Dict:
    """
    Runs the complete NLP analysis pipeline:
    1. Domain-adaptive Skill Extraction (separating Hard vs Soft Skills)
    2. Symmetric Skill-Relevant Noise Filtering
    3. TF-IDF Cosine Similarity Calculation
    4. Hard Skills Weighted Primary Coverage + Soft Skill Informational Bonus
    5. Adaptive Dynamic Reweighting Guard for Low JD Skill Counts
    6. Fit-Based Score Floor Guard (Option B) to prevent document-style TF-IDF compression bias.
    """
    # 1. Extract skills
    resume_skills = extract_skills(raw_resume_text)
    jd_skills = extract_skills(raw_jd_text)

    # Separate Hard Skills vs Soft Skills
    jd_hard_skills = {s for s in jd_skills if not is_soft_skill(s)}
    jd_soft_skills = {s for s in jd_skills if is_soft_skill(s)}

    resume_hard_skills = {s for s in resume_skills if not is_soft_skill(s)}
    resume_soft_skills = {s for s in resume_skills if is_soft_skill(s)}

    matched_hard_skills = sorted(list(resume_hard_skills.intersection(jd_hard_skills)))
    missing_hard_skills = sorted(list(jd_hard_skills - resume_hard_skills))

    matched_soft_skills = sorted(list(resume_soft_skills.intersection(jd_soft_skills)))
    missing_soft_skills = sorted(list(jd_soft_skills - resume_soft_skills))

    matched_skills = sorted(list(resume_skills.intersection(jd_skills)))
    missing_skills = sorted(list(jd_skills - resume_skills))

    # Compute Hard Skills Coverage & Soft Skills Coverage
    total_jd_hard_skills = len(jd_hard_skills)
    hard_skills_coverage = round((len(matched_hard_skills) / total_jd_hard_skills * 100), 2) if total_jd_hard_skills > 0 else 0.0

    total_jd_soft_skills = len(jd_soft_skills)
    soft_skills_coverage = round((len(matched_soft_skills) / total_jd_soft_skills * 100), 2) if total_jd_soft_skills > 0 else 100.0

    # Weighted Skill Coverage: Hard skills account for 90%, Soft skills account for 10%
    if total_jd_hard_skills > 0 and total_jd_soft_skills > 0:
        overall_skills_coverage = round((0.90 * hard_skills_coverage) + (0.10 * soft_skills_coverage), 2)
    elif total_jd_hard_skills > 0:
        overall_skills_coverage = hard_skills_coverage
    elif total_jd_soft_skills > 0:
        overall_skills_coverage = soft_skills_coverage
    else:
        overall_skills_coverage = 0.0

    # 2. Symmetric Skill-Relevant Noise Filtering
    comparison_skills = resume_skills.intersection(jd_skills)
    if not comparison_skills:
        comparison_skills = resume_skills.union(jd_skills)

    relevant_resume_text = extract_skill_relevant_text(raw_resume_text, comparison_skills)
    relevant_jd_text = extract_skill_relevant_text(raw_jd_text, comparison_skills)

    cleaned_relevant_resume = clean_text(relevant_resume_text)
    cleaned_relevant_jd = clean_text(relevant_jd_text)

    # 3. Compute raw TF-IDF Cosine Similarity
    cosine_sim = compute_match_score(cleaned_relevant_resume, cleaned_relevant_jd)

    # 4. ADAPTIVE HYBRID REWEIGHTING GUARD (Option A: 85% Skills / 15% TF-IDF)
    total_jd_skills = len(jd_skills)

    if total_jd_skills == 0:
        tfidf_weight, skills_weight = 1.0, 0.0
    elif total_jd_skills == 1:
        tfidf_weight, skills_weight = 0.80, 0.20
    elif total_jd_skills == 2:
        tfidf_weight, skills_weight = 0.65, 0.35
    elif total_jd_skills == 3:
        tfidf_weight, skills_weight = 0.50, 0.50
    elif total_jd_skills == 4:
        tfidf_weight, skills_weight = 0.40, 0.60
    else:
        # Option A: Default weighting rebalanced to 85% Skills Coverage and 15% TF-IDF Cosine Similarity
        tfidf_weight, skills_weight = DEFAULT_TFIDF_WEIGHT, DEFAULT_SKILLS_WEIGHT

    blended_match_score = round((tfidf_weight * cosine_sim) + (skills_weight * overall_skills_coverage), 2)

    # Option B: FIT-BASED SCORE FLOOR GUARD
    # Document-Type Asymmetry Guard: Resumes are concise while JDs are repetitive, causing raw TF-IDF
    # cosine similarity to return low values (~15-20%) even for 100% skill matches.
    # We enforce minimum score floors based on Hard Skills Coverage to prevent TF-IDF structural compression
    # from capping perfect or near-perfect candidate fits below their true performance band.
    if hard_skills_coverage >= 100.0:
        blended_match_score = max(blended_match_score, 85.0)
    elif hard_skills_coverage >= 80.0:
        blended_match_score = max(blended_match_score, 75.0)

    # Generate warning banner if JD skill count is below threshold (< 5)
    low_skill_count_warning = None
    if total_jd_skills < 5:
        low_skill_count_warning = (
            f"Low skill count detected in Job Description ({total_jd_skills} skill{'s' if total_jd_skills != 1 else ''}). "
            f"Score re-weighted ({int(tfidf_weight*100)}% TF-IDF / {int(skills_weight*100)}% Skills Coverage) for higher accuracy."
        )

    categorized_matched = categorize_skills(set(matched_skills))
    categorized_missing = categorize_skills(set(missing_skills))

    resume_health = compute_resume_health(raw_resume_text)
    top_keywords = extract_top_keywords(raw_resume_text, raw_jd_text, top_n=10)

    return {
        "match_score": blended_match_score,
        "cosine_similarity": cosine_sim,
        "skills_coverage": overall_skills_coverage,
        "hard_skills_coverage": hard_skills_coverage,
        "soft_skills_coverage": soft_skills_coverage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "matched_hard_skills": matched_hard_skills,
        "missing_hard_skills": missing_hard_skills,
        "matched_soft_skills": matched_soft_skills,
        "missing_soft_skills": missing_soft_skills,
        "categorized_matched": categorized_matched,
        "categorized_missing": categorized_missing,
        "resume_word_count": len(raw_resume_text.split()),
        "resume_health": resume_health,
        "top_keywords": top_keywords,
        "total_jd_skills_found": total_jd_skills,
        "total_resume_skills_found": len(resume_skills),
        "low_skill_count_warning": low_skill_count_warning,
        "weights_used": {
            "tfidf_weight": tfidf_weight,
            "skills_weight": skills_weight
        }
    }

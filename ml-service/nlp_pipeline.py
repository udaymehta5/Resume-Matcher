import re
from typing import Dict, List, Set
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from skills_dictionary import SKILLS_DB, normalize_skill, get_skill_category

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
    1. Direct regex matching against SKILLS_DB (using lowercased text)
    2. spaCy Noun Chunks & Entity recognition matching (using original-case text for proper entity detection)
    """
    if not raw_text:
        return set()

    found_skills = set()
    text_lower = raw_text.lower()

    # 1. Direct regex/string matching against pre-defined skills database
    for skill in SKILLS_DB:
        # Use negative lookaround assertions (?<![a-zA-Z0-9_]) and (?![a-zA-Z0-9_]) instead of \b
        # so that skills with special characters (e.g. "c++", "c#", "node.js", ".net", "asp.net") match correctly
        pattern = r'(?<![a-zA-Z0-9_])' + re.escape(skill) + r'(?![a-zA-Z0-9_])'
        if re.search(pattern, text_lower):
            found_skills.add(normalize_skill(skill))

    # 2. spaCy Noun Chunks & Entities matching (uses ORIGINAL-CASE text for capitalization sensitivity)
    doc = nlp(raw_text)
    for chunk in doc.noun_chunks:
        chunk_str = chunk.text.strip().lower()
        if chunk_str in SKILLS_DB:
            found_skills.add(normalize_skill(chunk_str))

    for ent in doc.ents:
        ent_str = ent.text.strip().lower()
        if ent_str in SKILLS_DB:
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
        # Use negative lookarounds instead of \b to match skills with trailing/leading symbols (c++, c#, node.js, asp.net)
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
    Calculates Resume Formatting & Quality Health Score based on:
    - Word count (optimal range 300-800 words)
    - Action verb density (spaCy POS tagging for verbs)
    - Structural suggestions & tips
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
    1. Skill Extraction (Resume & JD using original-case for spaCy NER)
    2. Symmetric Skill-Relevant Noise Filtering (uses intersection of skills)
    3. TF-IDF Cosine Similarity Calculation
    4. Hybrid Blended Match Score Formula: (0.3 * Cosine Similarity) + (0.7 * Skills Coverage)
    5. Skill Categorization & Resume Health Diagnostics
    """
    # 1. Extract skills (using original case for spaCy NER)
    resume_skills = extract_skills(raw_resume_text)
    jd_skills = extract_skills(raw_jd_text)

    matched_skills = sorted(list(resume_skills.intersection(jd_skills)))
    missing_skills = sorted(list(jd_skills - resume_skills))

    # Calculate Skills Coverage Percentage
    total_jd_skills = len(jd_skills)
    skills_coverage = round((len(matched_skills) / total_jd_skills * 100), 2) if total_jd_skills > 0 else 0.0

    # 2. Symmetric Skill-Relevant Noise Filtering
    # Filter BOTH resume and JD using the intersection of skills (skills actually relevant to comparison).
    # If intersection is empty, fall back to union of skills so filtering doesn't return empty text.
    comparison_skills = resume_skills.intersection(jd_skills)
    if not comparison_skills:
        comparison_skills = resume_skills.union(jd_skills)

    relevant_resume_text = extract_skill_relevant_text(raw_resume_text, comparison_skills)
    relevant_jd_text = extract_skill_relevant_text(raw_jd_text, comparison_skills)

    cleaned_relevant_resume = clean_text(relevant_resume_text)
    cleaned_relevant_jd = clean_text(relevant_jd_text)

    # 3. Compute raw TF-IDF Cosine Similarity
    cosine_sim = compute_match_score(cleaned_relevant_resume, cleaned_relevant_jd)

    # 4. HYBRID BLENDED SCORE: 30% Cosine Similarity + 70% Skills Coverage
    if total_jd_skills > 0:
        blended_match_score = round((0.3 * cosine_sim) + (0.7 * skills_coverage), 2)
    else:
        blended_match_score = cosine_sim

    categorized_matched = categorize_skills(set(matched_skills))
    categorized_missing = categorize_skills(set(missing_skills))

    resume_health = compute_resume_health(raw_resume_text)
    top_keywords = extract_top_keywords(raw_resume_text, raw_jd_text, top_n=10)

    return {
        "match_score": blended_match_score,
        "cosine_similarity": cosine_sim,
        "skills_coverage": skills_coverage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "categorized_matched": categorized_matched,
        "categorized_missing": categorized_missing,
        "resume_word_count": len(raw_resume_text.split()),
        "resume_health": resume_health,
        "top_keywords": top_keywords,
        "total_jd_skills_found": len(jd_skills),
        "total_resume_skills_found": len(resume_skills)
    }

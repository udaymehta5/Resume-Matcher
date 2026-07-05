"""
Domain-adaptive skills dictionary loader and canonical skill mapping.
Loads structured taxonomy from skills_taxonomy.json and distinguishes hard vs soft skills.
"""

import json
import os
from typing import Dict, Set

TAXONOMY_FILE = os.path.join(os.path.dirname(__file__), "skills_taxonomy.json")

def _load_taxonomy() -> Dict[str, Set[str]]:
    if not os.path.exists(TAXONOMY_FILE):
        raise FileNotFoundError(f"Taxonomy file not found at {TAXONOMY_FILE}")
    
    with open(TAXONOMY_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    return {category: set(skills) for category, skills in data.items()}

# Categorized skills map
CATEGORIZED_SKILLS: Dict[str, Set[str]] = _load_taxonomy()

# Separate Hard Skills and Soft Skills
SOFT_SKILLS_DB: Set[str] = CATEGORIZED_SKILLS.get("Soft Skills", set())
HARD_SKILLS_DB: Set[str] = set().union(*[skills for cat, skills in CATEGORIZED_SKILLS.items() if cat != "Soft Skills"])

# Complete flattened skills set
SKILLS_DB: Set[str] = HARD_SKILLS_DB.union(SOFT_SKILLS_DB)

# Ambiguous short tokens that require strict case or technical context matching
AMBIGUOUS_SHORT_SKILLS: Set[str] = {"go", "r", "c"}

# Canonical name mappings for normalization (e.g. react.js -> react)
CANONICAL_SKILLS: Dict[str, str] = {
    "react.js": "react",
    "reactjs": "react",
    "vue.js": "vue",
    "vuejs": "vue",
    "next.js": "next.js",
    "nextjs": "next.js",
    "node.js": "node.js",
    "nodejs": "node.js",
    "express.js": "express",
    "nest.js": "nestjs",
    "tailwindcss": "tailwind css", "tailwind": "tailwind css",
    "postgres": "postgresql",
    "scikit-learn": "scikit-learn", "sklearn": "scikit-learn",
    "gcp": "google cloud",
    "amazon web services": "aws",
    "golang": "go",
    "ga4": "google analytics",
    "gtm": "google tag manager",
    "search engine optimization": "seo",
    "pay per click": "ppc"
}

# Generic English stopwords that should NEVER be extracted as hard skills unless in SKILLS_DB
GENERIC_STOPWORDS: Set[str] = {
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "until", "while", "of", "at",
    "by", "for", "with", "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over",
    "under", "again", "further", "then", "once", "here", "there", "when", "where", "why",
    "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "can", "will",
    "just", "should", "now", "go", "going", "went", "gone"
}


def normalize_skill(skill: str) -> str:
    """Returns canonical skill name if present, otherwise trimmed lowercased skill."""
    cleaned = skill.strip().lower()
    return CANONICAL_SKILLS.get(cleaned, cleaned)


def get_skill_category(skill: str) -> str:
    """Finds which category a normalized skill belongs to."""
    skill_lower = skill.lower()
    for category, skills in CATEGORIZED_SKILLS.items():
        if skill_lower in skills or any(normalize_skill(s) == skill_lower for s in skills):
            return category
    return "General / Technical"


def is_soft_skill(skill: str) -> bool:
    """Checks if a skill belongs to the Soft Skills category."""
    norm = normalize_skill(skill)
    return norm in SOFT_SKILLS_DB or get_skill_category(skill) == "Soft Skills"

"""
Starter list of ~150+ common technical and soft skills for resume matching,
organized by category for detailed breakdown analytics.
"""

CATEGORIZED_SKILLS = {
    "Programming Languages": {
        "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go", "rust", "ruby", 
        "php", "swift", "kotlin", "scala", "r", "matlab", "perl", "sql", "bash", "powershell", "html", "css",
        "sass", "less", "solidity", "dart"
    },
    "Frameworks & Web": {
        "react", "react.js", "reactjs", "vue", "vue.js", "vuejs", "angular", "next.js", "nextjs",
        "nuxt.js", "svelte", "ember.js", "tailwind css", "tailwindcss", "bootstrap", "material ui", 
        "chakra ui", "jquery", "webgl", "three.js", "redux", "mobx", "zustand", "vite", "webpack",
        "node.js", "nodejs", "express", "express.js", "fastapi", "django", "flask", "spring", 
        "spring boot", "ruby on rails", "rails", "asp.net", "laravel", "nest.js", "nestjs", 
        "graphql", "rest api", "restful api", "grpc", "websockets", "microservices"
    },
    "Databases & Caching": {
        "mongodb", "postgresql", "postgres", "mysql", "sqlite", "oracle", "sql server", "redis", 
        "elasticsearch", "dynamodb", "cassandra", "neo4j", "firebase", "supabase", "mariadb", 
        "prisma", "sequelize", "mongoose"
    },
    "Cloud & DevOps": {
        "aws", "amazon web services", "azure", "google cloud", "gcp", "docker", "kubernetes", 
        "terraform", "ansible", "jenkins", "github actions", "gitlab ci", "circleci", "nginx", 
        "apache", "linux", "unix", "ci/cd", "prometheus", "grafana", "serverless", "cloudformation"
    },
    "Machine Learning & AI": {
        "machine learning", "deep learning", "nlp", "natural language processing", "data science", 
        "scikit-learn", "sklearn", "tensorflow", "pytorch", "keras", "opencv", "spacy", "nltk", 
        "pandas", "numpy", "scipy", "matplotlib", "seaborn", "data analytics", "data mining", 
        "computer vision", "big data", "spark", "hadoop", "tableau", "power bi", "feature engineering"
    },
    "Tools & Methodology": {
        "git", "github", "gitlab", "bitbucket", "jira", "confluence", "trello", "postman", "swagger", 
        "agile", "scrum", "kanban", "test driven development", "tdd", "unit testing", "jest", 
        "cypress", "selenium", "pytest", "mocha", "chai", "object oriented programming", "oop"
    },
    "Soft Skills": {
        "communication", "leadership", "problem solving", "teamwork", "collaboration", "critical thinking", 
        "time management", "project management", "adaptability", "creativity", "emotional intelligence", 
        "conflict resolution", "decision making", "negotiation", "presentation skills", "stakeholder management", 
        "cross-functional teamwork", "mentorship", "strategic thinking", "analytical skills", "troubleshooting",
        "customer focus", "agile project management", "scrum master", "product management"
    }
}

# Flattened set of all skills
SKILLS_DB = set().union(*CATEGORIZED_SKILLS.values())

# Canonical name mappings for normalization (e.g. react.js -> react)
CANONICAL_SKILLS = {
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
    "amazon web services": "aws"
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
    return "Other Technical"

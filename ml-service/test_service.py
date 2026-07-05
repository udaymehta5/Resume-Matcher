from nlp_pipeline import analyze_resume

sample_resume = """
Jane Developer
Senior Software Engineer
Skills: C++, C#, Node.js, ASP.NET, React.js, Python, MongoDB, Docker, Git, REST API, Communication, Problem Solving.
Experience:
- Architected high-frequency trading backend services using C++ and C#.
- Developed full-stack web applications with Node.js, ASP.NET Core, and React.js.
- Implemented microservices with Python (FastAPI) and Docker on AWS.
"""

sample_jd = """
We are looking for a Principal Engineer skilled in C++, C#, Node.js, ASP.NET, React.js, Python, AWS, and Docker.
Key Responsibilities:
- Build high-performance backend systems in C++ and C#.
- Build web applications using Node.js, ASP.NET, and React.js.
- Strong communication, leadership, and agile project management skills.
"""

if __name__ == "__main__":
    print("Testing Updated NLP Pipeline with Bug Fixes...")
    res = analyze_resume(sample_resume, sample_jd)
    print("\n--- ANALYSIS RESULTS ---")
    print(f"Blended Match Score: {res['match_score']}%")
    print(f"Cosine Similarity: {res['cosine_similarity']}%")
    print(f"Skills Coverage: {res['skills_coverage']}%")
    print(f"Matched Skills ({len(res['matched_skills'])}): {res['matched_skills']}")
    print(f"Missing Skills ({len(res['missing_skills'])}): {res['missing_skills']}")
    print(f"Resume Word Count: {res['resume_word_count']}")
    print("Top Keywords:")
    for kw in res['top_keywords']:
        print(f"  - {kw['keyword']}: JD Score={kw['jd_score']}, Resume Score={kw['resume_score']}")

"""
Unit & Integration Tests for Option A (85/15 Weighting) and Option B (Hard Skill Fit-Based Score Floor).
"""

import unittest
from nlp_pipeline import analyze_resume, extract_skills


class TestTfidfScoreCompressionFixes(unittest.TestCase):

    def test_arjun_verma_data_analyst_perfect_fit(self):
        """
        Test Case 1: Arjun Verma (Data Analyst) vs Finlytics JD.
        100% hard skill coverage (12/12 matched hard skills, 0 missing).
        Asserts match_score >= 85.0% (Perfect Match band) after Option A & B fixes.
        """
        arjun_resume = """
        Arjun Verma - Lead Data Analyst
        Experience & Skills:
        - 5+ years analyzing financial datasets using SQL, Python (Pandas, NumPy), Excel modeling, Tableau, and Power BI.
        - Built automated ETL pipelines in PostgreSQL and MySQL.
        - Conducted statistical analysis, data analytics, forecasting, and data mining to drive business insights.
        - Experience with Git, Postman, and Jira in Agile environments.
        """

        finlytics_jd = """
        Finlytics is hiring a Senior Data Analyst.
        Required Technical Skills:
        Must be proficient in SQL, Python, Pandas, NumPy, Tableau, Power BI, Excel modeling, PostgreSQL, MySQL, Data Analytics, Forecasting, Data Mining.
        """

        res = analyze_resume(arjun_resume, finlytics_jd)

        # Assert 100% hard skill coverage
        self.assertEqual(res["hard_skills_coverage"], 100.0, "Arjun Verma should match 100% of required hard skills!")
        self.assertEqual(len(res["missing_hard_skills"]), 0, "Arjun Verma should have 0 missing hard skills!")

        # Assert score >= 85% (Perfect Match)
        self.assertGreaterEqual(res["match_score"], 85.0, f"Expected match_score >= 85% for 100% hard skill fit, got {res['match_score']}%")

    def test_priya_sharma_digital_marketing_strong_fit(self):
        """
        Test Case 2: Priya Sharma (Marketing) vs Brightloop JD.
        ~89.5% hard skill coverage (17/19 hard skills matched).
        Asserts match_score >= 75.0% (Strong Match band) after Option A & B fixes.
        """
        priya_resume = """
        Priya Sharma - Digital Marketing Manager
        Skills: Digital Marketing, SEO, SEM, Google Ads, Meta Ads, Facebook Ads, Google Analytics, GA4, HubSpot, Content Strategy, Copywriting, Email Marketing, A/B Testing, CAC, ROAS, Performance Marketing, Lead Generation.
        Experience:
        - Managed $500k annual Google Ads and Meta Ads budget, achieving 4.2x ROAS.
        - Executed technical SEO strategies increasing organic traffic by 150%.
        - Developed marketing automation workflows in HubSpot to nurture leads and lower CAC.
        """

        brightloop_jd = """
        Brightloop is looking for a Digital Marketing Manager.
        Requirements:
        - Digital Marketing, Google Ads, Meta Ads, SEO, SEM, Google Analytics, GA4, HubSpot, Content Strategy, Copywriting, Email Marketing, A/B Testing, CAC, ROAS, Performance Marketing, Lead Generation, Market Research.
        - Knowledge of affiliate marketing and direct mail.
        - Excellent collaboration and communication skills.
        """

        res = analyze_resume(priya_resume, brightloop_jd)

        # Assert high hard skill coverage (>= 80%)
        self.assertGreaterEqual(res["hard_skills_coverage"], 80.0)

        # Assert match_score >= 75%
        self.assertGreaterEqual(res["match_score"], 75.0, f"Expected match_score >= 75% for Priya Sharma, got {res['match_score']}%")

    def test_score_floor_100_percent_hard_skills(self):
        """Unit test asserting hard_skills_coverage == 100% enforces a minimum 85% match score floor."""
        resume = "Senior Full Stack Engineer with Python, React, Node.js, Docker, MongoDB."
        jd = "Software Engineer required: Python, React, Node.js, Docker, MongoDB."

        res = analyze_resume(resume, jd)

        self.assertEqual(res["hard_skills_coverage"], 100.0)
        self.assertGreaterEqual(res["match_score"], 85.0, "100% hard skill coverage MUST enforce >= 85% score floor!")

    def test_score_floor_90_percent_hard_skills(self):
        """Unit test asserting hard_skills_coverage >= 90% enforces a minimum 75% match score floor."""
        resume = "Data Scientist with Python, Scikit-Learn, TensorFlow, PyTorch, SQL, Pandas, NumPy, Matplotlib, Seaborn."
        jd = "Data Scientist required: Python, Scikit-Learn, TensorFlow, PyTorch, SQL, Pandas, NumPy, Matplotlib, Seaborn, Tableau."

        res = analyze_resume(resume, jd)

        self.assertGreaterEqual(res["hard_skills_coverage"], 90.0)
        self.assertGreaterEqual(res["match_score"], 75.0, ">= 90% hard skill coverage MUST enforce >= 75% score floor!")


if __name__ == "__main__":
    unittest.main()

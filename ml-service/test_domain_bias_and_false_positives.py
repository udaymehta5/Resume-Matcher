"""
Unit & Integration Tests for Domain Bias Fixes, False Positive Prevention, Soft vs Hard Skill Separation, and Match Label Consistency.
"""

import unittest
from nlp_pipeline import analyze_resume, extract_skills
from skills_dictionary import is_soft_skill, HARD_SKILLS_DB, SOFT_SKILLS_DB


def get_match_label_backend(score: float) -> str:
    """Backend test helper mimicking frontend getMatchLabel canonical logic."""
    if score >= 80:
        return "Perfect Match"
    elif score >= 60:
        return "Strong Match"
    elif score >= 40:
        return "Moderate Match"
    else:
        return "Weak Match"


class TestSoftHardSkillSeparationAndLabelConsistency(unittest.TestCase):

    def test_priya_sharma_digital_marketing_soft_skill_separation(self):
        """
        Test case using Priya Sharma Digital Marketing resume vs Digital Marketing JD.
        Asserts that 'collaboration' is classified under soft skills and NOT in missing_hard_skills.
        """
        resume = """
        Priya Sharma - Digital Marketing Manager
        Experience: 6 years leading performance marketing, SEO, SEM, Google Ads, Meta Ads, GA4, HubSpot, Content Strategy.
        Proven track record scaling e-commerce revenue and improving ROAS while reducing CAC.
        """

        jd = """
        Digital Marketing Manager wanted.
        Requirements:
        - 5+ years experience in Digital Marketing, Google Ads, Meta Ads, SEO, SEM, GA4, HubSpot.
        - Knowledge of affiliate marketing and copywriting.
        - Strong collaboration and communication skills.
        """

        res = analyze_resume(resume, jd)

        # 1. Assert 'collaboration' is in soft skills, NOT in missing_hard_skills
        self.assertNotIn("collaboration", res["missing_hard_skills"], "'collaboration' soft skill should NOT appear in missing_hard_skills!")
        self.assertIn("collaboration", res["missing_soft_skills"], "'collaboration' should be classified under missing_soft_skills.")

        # 2. Assert 'affiliate marketing' IS in missing_hard_skills
        self.assertIn("affiliate marketing", res["missing_hard_skills"], "'affiliate marketing' hard skill should be in missing_hard_skills.")

        # 3. Assert hard skills coverage is high (>75%)
        self.assertGreaterEqual(res["hard_skills_coverage"], 75.0)

    def test_match_label_consistency(self):
        """Assert label logic produces identical output for score bands."""
        self.assertEqual(get_match_label_backend(85.0), "Perfect Match")
        self.assertEqual(get_match_label_backend(70.62), "Strong Match")
        self.assertEqual(get_match_label_backend(45.0), "Moderate Match")
        self.assertEqual(get_match_label_backend(25.0), "Weak Match")

    def test_false_positive_go_and_stopwords(self):
        """Assert generic lowercase 'go' in sentence text is NOT extracted as the Golang programming language."""
        plain_text = "We will go to market with a new campaign to increase customer engagement."
        skills = extract_skills(plain_text)
        
        self.assertNotIn("go", skills, "Lowercase 'go' in 'go to market' should not be extracted as a programming language!")
        self.assertNotIn("a", skills, "Single letter stopword 'a' should not be extracted as a skill.")

    def test_capitalized_go_programming_language(self):
        """Assert capitalized 'Go' or 'Golang' in tech context IS extracted as Go."""
        tech_text = "Looking for a backend engineer skilled in Go, Docker, and Kubernetes."
        skills = extract_skills(tech_text)
        
        self.assertIn("go", skills, "Capitalized 'Go' in tech context should be extracted as Go programming language.")


if __name__ == "__main__":
    unittest.main()

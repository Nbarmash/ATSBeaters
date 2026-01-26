
import json
import logging
import google.generativeai as genai
from config import GOOGLE_API_KEY, logger

class ResumeAnalyzer:
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found in environment")
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def analyze(self, resume_text: str):
        """Analyzes resume text for ATS compatibility and returns structured insights."""
        logger.info("Starting resume analysis...")
        
        prompt = f"""
        Act as an expert ATS (Applicant Tracking System) algorithm and professional recruiter.
        Analyze the following resume content for technical compatibility and competitive strength.
        
        Return the result EXCLUSIVELY in JSON format with the following keys:
        - ats_score: Integer (0-100)
        - critical_issues: List of strings (blocking errors)
        - formatting_problems: List of strings (parsing issues)
        - missing_keywords: List of high-value industry terms missing
        - weak_achievements: List of vague bullet points needing metrics
        - strengths: List of strong professional aspects
        - priority_fixes: Top 3 actions to take immediately
        
        Resume Content:
        {resume_text}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Clean response text to ensure it is valid JSON
            clean_text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.error(f"Error during analysis: {str(e)}")
            return {"error": "Failed to analyze resume", "details": str(e)}

if __name__ == "__main__":
    analyzer = ResumeAnalyzer()
    sample_text = "Experienced software engineer with skills in Java and SQL. Managed a team."
    print(json.dumps(analyzer.analyze(sample_text), indent=2))

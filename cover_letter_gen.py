
import google.generativeai as genai
from config import GOOGLE_API_KEY, logger

class CoverLetterGenerator:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def generate(self, resume_summary: str, job_description: str):
        """Generates a tailored cover letter."""
        logger.info("Generating tailored cover letter...")
        
        prompt = f"""
        Create a high-converting, professional cover letter.
        Tailor it specifically to this job description using strengths from the provided resume summary.
        
        Job Description:
        {job_description}
        
        Candidate Highlights:
        {resume_summary}
        
        The letter should be assertive, professional, and exactly 3-4 paragraphs. 
        Focus on value proposition and cultural fit.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            logger.error(f"Error generating cover letter: {str(e)}")
            return "Professional Cover Letter template..."

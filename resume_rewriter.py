
import logging
import google.generativeai as genai
from config import GOOGLE_API_KEY, logger
from document_generator import DocumentGenerator

class ResumeRewriter:
    def __init__(self):
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel('gemini-3-pro-preview')
        self.doc_gen = DocumentGenerator()

    def rewrite(self, resume_text: str, analysis_results: dict = None):
        """Rewrites resume into an ATS-optimized format based on analysis."""
        logger.info("Generating professional rewrite...")
        
        context = ""
        if analysis_results:
            context = f"Fix these issues: {json.dumps(analysis_results.get('critical_issues', []))} " \
                      f"and include these keywords: {json.dumps(analysis_results.get('missing_keywords', []))}"

        prompt = f"""
        Rewrite this resume to be a world-class, ATS-optimized professional document.
        Requirements:
        1. Use strong action verbs (e.g., 'Spearheaded', 'Orchestrated').
        2. Quantify every single achievement with metrics ($, %, #).
        3. Optimize for 11pt Arial font readability.
        4. Remove all tables, images, and non-standard characters.
        5. Maintain a strictly reverse-chronological format.
        
        Context/Analysis: {context}
        
        Original Resume:
        {resume_text}
        
        Return the rewritten resume in clear Markdown format.
        """
        
        try:
            response = self.model.generate_content(prompt)
            markdown_content = response.text
            return markdown_content
        except Exception as e:
            logger.error(f"Error during rewrite: {str(e)}")
            return None

    def create_optimized_package(self, resume_text, analysis, user_id):
        """Rewrites and saves as DOCX."""
        markdown = self.rewrite(resume_text, analysis)
        if markdown:
            filename = f"Optimized_Resume_{user_id}.docx"
            return self.doc_gen.markdown_to_docx(markdown, filename)
        return None

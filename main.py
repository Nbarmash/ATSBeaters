
import sys
import logging
from resume_analyzer import ResumeAnalyzer
from resume_rewriter import ResumeRewriter
from cover_letter_gen import CoverLetterGenerator
from email_sender import EmailService
from config import logger

def run_automation_pipeline(user_email: str, resume_text: str, job_desc: str = None):
    """
    Main orchestration function to run the full ATS optimization pipeline.
    1. Analyze -> 2. Rewrite -> 3. Generate Docs -> 4. Email User
    """
    logger.info(f"--- Starting Pipeline for {user_email} ---")
    
    # 1. Initialize services
    analyzer = ResumeAnalyzer()
    rewriter = ResumeRewriter()
    letter_gen = CoverLetterGenerator()
    mailer = EmailService()

    # 2. Analyze
    analysis = analyzer.analyze(resume_text)
    if "error" in analysis:
        logger.error("Pipeline aborted: Analysis failed.")
        return False

    # 3. Rewrite and Generate Document
    doc_path = rewriter.create_optimized_package(resume_text, analysis, "USER_ID_123")
    
    # 4. (Optional) Cover Letter
    cover_letter = ""
    if job_desc:
        cover_letter = letter_gen.generate(resume_text[:500], job_desc)

    # 5. Build Email Content
    html_template = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #4F46E5;">ATSBeaters: Your Optimization Report is Ready</h2>
        <p>Hello,</p>
        <p>We've successfully processed your resume. Your current ATS Score is: <strong>{analysis.get('ats_score')}%</strong></p>
        <p><strong>Top Recommendations:</strong></p>
        <ul>
            {"".join([f"<li>{fix}</li>" for fix in analysis.get('priority_fixes', [])])}
        </ul>
        <hr>
        <p>Find your fully rewritten, ATS-compatible document attached to this email.</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px;">
            <p><strong>Pro Tip:</strong> Ensure you use the exact keywords highlighted in our analysis before applying.</p>
        </div>
    </div>
    """

    # 6. Dispatch
    success = mailer.send_report(
        to_email=user_email,
        subject=f"ATSBeaters Report: Score {analysis.get('ats_score')}%",
        body_html=html_template,
        attachment_path=doc_path
    )

    if success:
        logger.info("Pipeline completed successfully.")
    else:
        logger.warning("Pipeline completed with errors (Email failed).")
    
    return analysis

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python main.py <email> <resume_file_path>")
        sys.exit(1)
        
    email = sys.argv[1]
    file_path = sys.argv[2]
    
    with open(file_path, 'r') as f:
        content = f.read()
        
    results = run_automation_pipeline(email, content)
    print("Optimization Complete. Check your logs and email.")

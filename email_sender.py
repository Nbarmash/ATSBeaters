
import os
import base64
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import (Mail, Attachment, FileContent, FileName, FileType, Disposition)
from config import SENDGRID_API_KEY, FROM_EMAIL, logger

class EmailService:
    def __init__(self):
        self.sg = SendGridAPIClient(SENDGRID_API_KEY)

    def send_report(self, to_email: str, subject: str, body_html: str, attachment_path: str = None):
        """Sends an email with branding and optional file attachments."""
        logger.info(f"Sending email to {to_email}")
        
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=body_html
        )

        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, 'rb') as f:
                data = f.read()
                f.close()
            encoded_file = base64.b64encode(data).decode()
            
            attachedFile = Attachment(
                FileContent(encoded_file),
                FileName(os.path.basename(attachment_path)),
                FileType('application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
                Disposition('attachment')
            )
            message.add_attachment(attachedFile)

        try:
            response = self.sg.send(message)
            logger.info(f"Email sent! Status code: {response.status_code}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False

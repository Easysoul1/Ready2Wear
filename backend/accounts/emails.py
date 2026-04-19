import os
import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(user, reset_url):
    """Send password reset email to user."""
    subject = 'Reset your FashionFlow password'
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #555; font-size: 16px;">Hello {user.full_name or user.email},</p>
        <p style="color: #555; font-size: 16px;">We received a request to reset your FashionFlow password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{reset_url}" style="background: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="color: #777; font-size: 14px;">This link will expire in 30 minutes for security reasons.</p>
        
        <p style="color: #777; font-size: 14px;">If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">FashionFlow Team</p>
    </body>
    </html>
    """
    
    text_body = f"""
    Password Reset Request
    
    Hello {user.full_name or user.email},
    
    We received a request to reset your FashionFlow password. Copy and paste the link below into your browser to create a new password:
    
    {reset_url}
    
    This link will expire in 30 minutes for security reasons.
    
    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
    
    FashionFlow Team
    """
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@fashionflow.local')
    
    try:
        send_mail(
            subject=subject,
            message=text_body,
            from_email=from_email,
            recipient_list=[user.email],
            html_message=html_body,
            fail_silently=False,
        )
        logger.info(f'Password reset email sent to {user.email}')
        return True
    except Exception as e:
        logger.error(f'Failed to send password reset email to {user.email}: {e}')
        print(f'[EMAIL] Password reset link: {reset_url}')
        return False


def send_password_changed_notification(user):
    """Send notification when password has been changed."""
    subject = 'Your FashionFlow password has been changed'
    
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Changed</h2>
        <p style="color: #555; font-size: 16px;">Hello {user.full_name or user.email},</p>
        <p style="color: #555; font-size: 16px;">Your FashionFlow password has been successfully changed.</p>
        
        <p style="color: #777; font-size: 14px;">If you didn't change your password, please contact support immediately.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px;">FashionFlow Team</p>
    </body>
    </html>
    """
    
    text_body = f"""
    Password Changed
    
    Hello {user.full_name or user.email},
    
    Your FashionFlow password has been successfully changed.
    
    If you didn't change your password, please contact support immediately.
    
    FashionFlow Team
    """
    
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@fashionflow.local')
    
    try:
        send_mail(
            subject=subject,
            message=text_body,
            from_email=from_email,
            recipient_list=[user.email],
            html_message=html_body,
            fail_silently=False,
        )
        logger.info(f'Password changed notification sent to {user.email}')
        return True
    except Exception as e:
        logger.error(f'Failed to send password changed notification to {user.email}: {e}')
        return False
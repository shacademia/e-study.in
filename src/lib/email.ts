import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string, name: string) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'E-Study <onboarding@resend.dev>', // Using Resend's default domain for testing
            // to: [email],
            to: 'onlineshacademia@gmail.com',
            subject: 'Verify Your Email Address',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Thank you for using E-Study! Please verify your email address by entering the following 6-digit code:</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h1 style="color: #2563eb; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          
          <p>This code will expire in 10 minutes for security reasons.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from E-Study. Please do not reply to this email.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send verification email');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Email service error:', error);
        throw error;
    }
}

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if verification code is expired (10 minutes)
export function isCodeExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
}

// Generate expiry date (10 minutes from now)
export function generateExpiryDate(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    return expiry;
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string, name: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password/${resetToken}`;

    try {
        const { data, error } = await resend.emails.send({
            from: 'E-Study <onboarding@resend.dev>', // Using Resend's default domain for testing
            to: 'onlineshacademia@gmail.com', // Using same test email for now
            subject: 'Reset Your Password',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for your E-Study account.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <p style="margin-bottom: 15px;">Click the button below to reset your password:</p>
            <a href="${resetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
          
          <p><strong>This link will expire in 10 minutes</strong> for security reasons.</p>
          <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from E-Study. Please do not reply to this email.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Password reset email sending error:', error);
            throw new Error('Failed to send password reset email');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Password reset email service error:', error);
        throw error;
    }
}
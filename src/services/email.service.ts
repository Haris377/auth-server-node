import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

class EmailService {
  private transporter;
  private isConfigured: boolean = false;

  constructor() {
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailUser = process.env.EMAIL_USER || 'haris.qadir93@gmail.com';
    
    // Validate email configuration
    if (!emailPassword) {
      console.warn('⚠️  WARNING: EMAIL_PASSWORD environment variable is not set. Email sending will fail.');
      this.isConfigured = false;
    } else {
      this.isConfigured = true;
    }

    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword || ''
      }
    });

    // Verify connection on startup
    if (this.isConfigured) {
      this.verifyConnection().catch(err => {
        console.error('❌ Email service connection verification failed:', err.message);
      });
    }
  }

  private async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service configured and ready');
    } catch (error: any) {
      console.error('❌ Email service verification failed:', error.message);
      if (error.code === 'EAUTH') {
        console.error('   → Check your EMAIL_PASSWORD. For Gmail, use an App-Specific Password.');
      }
      throw error;
    }
  }

  async sendPasswordSetupEmail(email: string, name: string, token: string) {
    if (!this.isConfigured) {
      const error = new Error('Email service is not configured. Please set EMAIL_PASSWORD environment variable.');
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const setupLink = `${appUrl}/set-password?token=${token}`;
    const emailFrom = process.env.EMAIL_USER || 'haris.qadir93@gmail.com';

    const mailOptions = {
      from: `"Auth Server" <${emailFrom}>`,
      to: email,
      subject: 'Set Your Password - Auth Server',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Auth Server!</h2>
          <p>Hello ${name},</p>
          <p>Your account has been created. Please click the button below to set your password and activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupLink}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Set Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${setupLink}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't create an account, please ignore this email.
          </p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Password setup email sent successfully:', info.messageId, `→ ${email}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending password setup email:', error.message);
      if (error.code === 'EAUTH') {
        console.error('   → Authentication failed. Check EMAIL_PASSWORD. For Gmail, use App-Specific Password.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   → Connection failed. Check network and SMTP settings.');
      }
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    if (!this.isConfigured) {
      const error = new Error('Email service is not configured. Please set EMAIL_PASSWORD environment variable.');
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }

    const emailFrom = process.env.EMAIL_USER || 'haris.qadir93@gmail.com';
    const mailOptions = {
      from: `"Auth Server" <${emailFrom}>`,
      to: email,
      subject: 'Welcome to Auth Server!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Auth Server!</h2>
          <p>Hello ${name},</p>
          <p>Your password has been successfully set. You can now log in to your account.</p>
          <p>Thank you for using our service!</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId, `→ ${email}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error.message);
      if (error.code === 'EAUTH') {
        console.error('   → Authentication failed. Check EMAIL_PASSWORD. For Gmail, use App-Specific Password.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   → Connection failed. Check network and SMTP settings.');
      }
      throw error;
    }
  }
}

export default new EmailService();

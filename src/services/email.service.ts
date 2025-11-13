import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

class EmailService {
  private transporter;
  private isConfigured: boolean = false;

  constructor() {
    // Use the specific email configuration
    const emailConfig = {
      emailaddressFrom: "contact@cyful.net",
      emailaddress: "contact@cyful.net",
      password: "]H6G4R;35Jo",
      localport: "587",
      localSMTPIP: "smtp.hostinger.com",
      SenderEmailAddress: "contact@cyful.net",
      SMTPIP: "smtp.hostinger.com",
      SMTPPort: 587,
      EnableSSL: true,
      AllowAnonymous: false
    };
    
    // Set configuration status
    this.isConfigured = true;

    this.transporter = nodemailer.createTransport({
      host: emailConfig.SMTPIP,
      port: emailConfig.SMTPPort,
      secure: emailConfig.EnableSSL,
      auth: {
        user: emailConfig.emailaddress,
        pass: emailConfig.password
      }
    });

    // Verify connection on startup
    if (this.isConfigured) {
      this.verifyConnection()
        .then(() => {
          // Connection success log is inside verifyConnection()
        })
        .catch((err: any) => {
          if (err && err.message) {
            console.error('❌ Email service connection verification failed:', err.message);
          } else {
            console.error('❌ Email service connection verification failed:', err);
          }
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
        console.error('   → Authentication failed. Check your email credentials for smtp.hostinger.com.');
      }
      throw error;
    }
  }

  async sendPasswordSetupEmail(email: string, name: string, token: string) {
    if (!this.isConfigured) {
      const error = new Error('Email service is not configured properly.');
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const setupLink = `${appUrl}/set-password?token=${token}`;
    const emailFrom = 'contact@cyful.net';

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
        console.error('   → Authentication failed. Check email credentials for smtp.hostinger.com.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   → Connection failed. Check network and SMTP settings for smtp.hostinger.com.');
      }
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    if (!this.isConfigured) {
      const error = new Error('Email service is not configured properly.');
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }

    const emailFrom = 'contact@cyful.net';
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
        console.error('   → Authentication failed. Check email credentials for smtp.hostinger.com.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   → Connection failed. Check network and SMTP settings for smtp.hostinger.com.');
      }
      throw error;
    }
  }
}

export default new EmailService();

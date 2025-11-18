import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import appConfig from '../config/app.config';

// Ensure environment variables are loaded
dotenv.config();

class EmailService {
  private transporter;
  private isConfigured: boolean = false;

  constructor() {
    // Use the specific email configuration
    const emailConfig = {
      emailaddressFrom: "rasadrahimkhan@gmail.com",
      emailaddress: "asadkhaaa@gmail.com",
      password: "nezjhrkwgridjsvv",
      localport: "587",
      localSMTPIP: "smtp.gmail.com",
      ServerIP: "10.228.41.10",
      SenderEmailAddress: "rasadrahimkhan@gmail.com",
      SMTPIP: "smtp.ipage.com",
      SMTPPort: 587,
      EnableSSL: true,
      AllowAnonymous: false,
      RedirectSignUpUrl: "http://103.79.16.18:6062/Account/SignUp?role=PARTNER"
    };

    
    
    // Set configuration status
    this.isConfigured = true;

    // Use Gmail SMTP since the email address is a Gmail account
    this.transporter = nodemailer.createTransport({
      host: emailConfig.localSMTPIP || 'smtp.gmail.com', // Use Gmail SMTP for Gmail accounts
      port: parseInt(emailConfig.localport) || 587,
      secure: false, // Port 587 uses STARTTLS, not direct SSL
      requireTLS: true, // Enable TLS/SSL via STARTTLS
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
        console.error('   → Authentication failed. Check your email credentials for smtp.gmail.com.');
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

    const appUrl = appConfig.getCurrentAppUrl();
    const setupLink = `${appUrl}/set-password?token=${token}`;
    const emailFrom = 'rasadrahimkhan@gmail.com';

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
        console.error('   → Authentication failed. Check email credentials for smtp.gmail.com.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   → Connection failed. Check network and SMTP settings for smtp.gmail.com.');
      }
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string, isPasswordSet: boolean = false) {
    if (!this.isConfigured) {
      const error = new Error('Email service is not configured properly.');
      console.error('❌ Email sending failed:', error.message);
      throw error;
    }

    const appUrl = appConfig.getCurrentAppUrl();
    const emailFrom = 'rasadrahimkhan@gmail.com';
    
    let mailOptions;
    
    if (isPasswordSet) {
      // Confirmation email after password is set
      mailOptions = {
        from: `<${emailFrom}>`,
        to: email,
        subject: 'Password Set Successfully - Workpulse!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Workpulse!</h2>
            <p>Hello ${name},</p>
            <p>Your password has been successfully set. You can now log in to your account.</p>
            <p>Thank you for using our service!</p>
          </div>
        `
      };
    } else {
      // Initial welcome email with set password link
      const setPasswordLink = `${appUrl}/set-password?email=${encodeURIComponent(email)}`;
      mailOptions = {
        from: `<${emailFrom}>`,
        to: email,
        subject: 'Welcome to Workpulse!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Welcome to Workpulse!</h2>
            <p>Hello ${name},</p>
            <p>Click the button below to set your password and activate your account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setPasswordLink}" 
                 style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Set Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 12px; word-break: break-all;">${setPasswordLink}</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't create an account, please ignore this email.
            </p>
          </div>
        `
      };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent successfully:', info.messageId, `→ ${email}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending welcome email:', error.message);
      if (error.code === 'EAUTH') {
        console.error('   → Authentication failed. Check email credentials for smtp.gmail.com.');
      } else if (error.code === 'ECONNECTION') {
        console.error('   → Connection failed. Check network and SMTP settings for smtp.gmail.com.');
      }
      throw error;
    }
  }
}

export default new EmailService();

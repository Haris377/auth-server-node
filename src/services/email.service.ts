import nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'haris.qadir93@gmail.com',
        pass: process.env.EMAIL_PASSWORD || ''
      }
    });
  }

  async sendPasswordSetupEmail(email: string, name: string, token: string) {
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const setupLink = `${appUrl}/set-password?token=${token}`;

    const mailOptions = {
      from: 'haris.qadir93@gmail.com',
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
      console.log('Email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name: string) {
    const mailOptions = {
      from: 'haris.qadir93@gmail.com',
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
      console.log('Welcome email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      throw error;
    }
  }
}

export default new EmailService();

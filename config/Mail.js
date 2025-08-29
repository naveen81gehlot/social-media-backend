import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, otp) => {
  try {
    const info = await transporter.sendMail({
      from: `"Team Vybe" <${process.env.EMAIL}>`,
      to,
      subject: "Reset Your Password - OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #4CAF50;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the OTP below to proceed:</p>
          
          <div style="background-color: #f4f4f4; padding: 10px 20px; border-radius: 8px; display: inline-block; font-size: 20px; font-weight: bold; letter-spacing: 2px;">
            ${otp}
          </div>

          <p style="margin-top: 20px;">This OTP is valid for <b>10 minutes</b>. If you did not request a password reset, you can safely ignore this email.</p>
          
          <p style="margin-top: 30px;">Thanks,<br>Team Vybe</p>
        </div>
      `,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

export default sendMail;

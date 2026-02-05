import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send PDF email after purchase
export const sendPdfEmail = async (purchase) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BookNest" <${process.env.EMAIL_USER}>`,
      to: purchase.buyer.email,
      subject: `Your Book Purchase: ${purchase.book.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Hi ${purchase.buyer.name},</p>
          <p>You have successfully purchased <strong>${purchase.book.title}</strong> by ${purchase.book.author}.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Purchase Details:</h3>
            <p><strong>Book:</strong> ${purchase.book.title}</p>
            <p><strong>Author:</strong> ${purchase.book.author}</p>
            <p><strong>Amount Paid:</strong> ₹${purchase.amount}</p>
            <p><strong>Purchase Date:</strong> ${new Date(purchase.createdAt).toLocaleDateString()}</p>
          </div>

          ${purchase.book.pdfFile ? `
            <p>Your book PDF is attached to this email. You can also access it from your profile at any time.</p>
          ` : `
            <p style="color: #d9534f;">Note: The seller has not uploaded a PDF file for this book yet. Please contact the seller for assistance.</p>
          `}

          <p>If you have any questions, feel free to contact us.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>BookNest Team</strong>
          </p>
        </div>
      `,
      attachments: purchase.book.pdfFile ? [
        {
          filename: `${purchase.book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          path: path.join(__dirname, '../../', purchase.book.pdfFile),
        },
      ] : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('PDF email sent:', info.messageId);
    
    // Update purchase record
    purchase.pdfDelivered = true;
    purchase.pdfDeliveryAttempts = (purchase.pdfDeliveryAttempts || 0) + 1;
    purchase.lastDeliveryAttempt = new Date();
    await purchase.save();

    return info;
  } catch (error) {
    console.error('Error sending PDF email:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, name, resetUrl) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BookNest" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - BookNest',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your BookNest account.</p>
          
          <p>Click the button below to reset your password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all; font-size: 14px;">
            ${resetUrl}
          </p>
          
          <p style="color: #d9534f; margin-top: 20px;">
            <strong>This link will expire in 1 hour.</strong>
          </p>
          
          <p>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</p>
          
          <p style="margin-top: 30px;">
            Best regards,<br>
            <strong>BookNest Team</strong>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email (optional)
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"BookNest" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to BookNest!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to BookNest!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for joining BookNest - your online marketplace for buying and selling ebooks.</p>
          
          <p>Here's what you can do with your account:</p>
          <ul>
            <li>Browse and purchase ebooks from various categories</li>
            <li>Upload and sell your own ebooks</li>
            <li>Manage your digital library</li>
            <li>Track your earnings from sales</li>
          </ul>
          
          <p>Get started by exploring our collection or uploading your first book!</p>
          
          <p style="margin-top: 30px;">
            Happy reading and selling!<br>
            <strong>BookNest Team</strong>
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email, it's not critical
  }
};
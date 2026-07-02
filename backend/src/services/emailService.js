const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    }
  }

  async sendReservationConfirmation(email, reservationDetails) {
    if (!this.transporter) {
      console.log('Email service not configured, skipping email send');
      return;
    }

    const mailOptions = {
      from: `"The Lighthouse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reservation Confirmation - The Lighthouse',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1714; color: #f5f2ed; border-radius: 8px;">
          <h1 style="color: #c9a962; text-align: center;">The Lighthouse</h1>
          <h2 style="text-align: center;">Reservation Confirmation</h2>
          <div style="background-color: #2a2520; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Date:</strong> ${new Date(reservationDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${reservationDetails.time}</p>
            <p><strong>Guests:</strong> ${reservationDetails.guests}</p>
            ${reservationDetails.specialRequests ? `<p><strong>Special Requests:</strong> ${reservationDetails.specialRequests}</p>` : ''}
          </div>
          <p style="text-align: center; color: #c9a962;">Thank you for choosing The Lighthouse</p>
          <p style="text-align: center; font-size: 12px; color: #888;">We look forward to serving you!</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Confirmation email sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}

module.exports = new EmailService();
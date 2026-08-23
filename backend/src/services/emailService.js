const nodemailer = require('nodemailer');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

    // Calculate total order amount if pre-ordered dishes exist
    let totalEstimate = 0;
    let preOrderHtml = '';
    
    if (reservationDetails.preOrder && reservationDetails.preOrder.length > 0) {
      preOrderHtml = `
        <h3 style="color: #c9a962; border-bottom: 1px solid rgba(201, 169, 98, 0.3); padding-bottom: 5px; margin-top: 20px;">Pre-ordered Dishes</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px; color: #f5f2ed;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(201, 169, 98, 0.2); text-align: left; font-size: 14px;">
              <th style="padding: 8px 0;">Item</th>
              <th style="padding: 8px 0; text-align: center;">Qty</th>
              <th style="padding: 8px 0; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
      `;

      reservationDetails.preOrder.forEach(item => {
        const dishName = escapeHtml(item.menuItem?.name || 'Dish');
        const dishPrice = item.menuItem?.price || 0;
        const itemTotal = dishPrice * item.quantity;
        totalEstimate += itemTotal;
        preOrderHtml += `
          <tr style="border-bottom: 1px dashed rgba(255, 255, 255, 0.05); font-size: 14px;">
            <td style="padding: 8px 0;">${dishName}</td>
            <td style="padding: 8px 0; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px 0; text-align: right;">₹${itemTotal}</td>
          </tr>
        `;
      });

      preOrderHtml += `
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 15px; font-weight: bold; color: #c9a962; font-size: 16px;">
          Estimated Total: ₹${totalEstimate}
        </div>
      `;
    }

    const tableSection = reservationDetails.table?.section || reservationDetails.seatingPreference || 'any';
    const sectionName = tableSection.charAt(0).toUpperCase() + tableSection.slice(1);

    const mailOptions = {
      from: `"The Lighthouse" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reservation Confirmation - The Lighthouse',
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1714; color: #f5f2ed; border-radius: 8px;">
          <h1 style="color: #c9a962; text-align: center; margin-bottom: 5px;">The Lighthouse</h1>
          <p style="text-align: center; font-style: italic; color: #b8b0a4; margin-bottom: 25px;">Fine Dining Redefined</p>
          
          <h2 style="text-align: center; color: #f5f2ed; font-weight: 300;">Reservation Confirmed!</h2>
          
          <div style="background-color: #2a2520; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid rgba(201, 169, 98, 0.15);">
            <p style="margin: 8px 0;"><strong>Date:</strong> ${escapeHtml(new Date(reservationDetails.date).toLocaleDateString())}</p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${escapeHtml(reservationDetails.time)}</p>
            <p style="margin: 8px 0;"><strong>Guests:</strong> ${escapeHtml(String(reservationDetails.guests))}</p>
            <p style="margin: 8px 0;"><strong>Seating Preference:</strong> ${escapeHtml(sectionName)}</p>
            ${reservationDetails.depositAmount ? `<p style="margin: 8px 0;"><strong>Refundable Deposit:</strong> ₹${escapeHtml(String(reservationDetails.depositAmount))} (Paid via ${escapeHtml(reservationDetails.confirmationChannel)})</p>` : ''}
            ${reservationDetails.specialRequests ? `<p style="margin: 8px 0;"><strong>Special Requests:</strong> ${escapeHtml(reservationDetails.specialRequests)}</p>` : ''}
            
            ${preOrderHtml}
          </div>
          
          <div style="text-align: center; margin: 20px 0; padding: 15px; border-radius: 6px; background: rgba(76, 175, 125, 0.1); border: 1px solid rgba(76, 175, 125, 0.2); font-size: 14px; color: #4caf7d;">
            🍽️ <strong>Ready When Seated:</strong> Your pre-ordered food will be prepared in advance and served fresh shortly after you are seated!
          </div>

          <p style="text-align: center; color: #c9a962; margin-top: 30px;">Thank you for choosing The Lighthouse</p>
          <p style="text-align: center; font-size: 12px; color: #888; margin-top: 5px;">We look forward to serving you!</p>
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
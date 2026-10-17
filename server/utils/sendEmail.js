import nodemailer from 'nodemailer';

/**
 * Helper to build configured nodemailer transporter
 */
export const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  return process.env.SMTP_HOST
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
      })
    : nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass, // Gmail 16-character App Password
        },
      });
};

/**
 * Send an OTP verification email to the user
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
export const sendOtpEmail = async (toEmail, otp) => {
  const emailUser = process.env.EMAIL_USER;
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[EMAIL NOTICE] No EMAIL_USER/EMAIL_PASS configured in server/.env.`);
    console.log(`[EMAIL NOTICE] OTP for ${toEmail}: ${otp}`);
    return {
      sent: false,
      reason: 'Missing EMAIL_USER / EMAIL_PASS in server/.env',
      otp,
    };
  }

  const mailOptions = {
    from: `"Kaldi & Co Specialty Coffee" <${emailUser}>`,
    to: toEmail,
    subject: `${otp} is your Kaldi & Co Password Reset Code`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ef; margin: 0; padding: 24px; color: #2c1810; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 36px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8dfd5; }
            .header { text-align: center; margin-bottom: 24px; }
            .logo-title { font-size: 24px; font-weight: 700; color: #2c1810; letter-spacing: 0.05em; margin: 0; }
            .logo-sub { font-size: 12px; color: #c9945a; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; margin-top: 4px; }
            .divider { height: 1px; background: #f0ebe4; margin: 20px 0; }
            .content { font-size: 15px; line-height: 1.6; color: #4a3b32; }
            .otp-box { background: #fbf7f2; border: 2px dashed #c9945a; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0; }
            .otp-code { font-family: monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2c1810; }
            .footer { font-size: 12px; color: #8c7e73; text-align: center; margin-top: 28px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-title">KALDI & CO.</h1>
              <div class="logo-sub">Ethiopian Specialty Coffee & Roastery</div>
            </div>
            <div class="divider"></div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset the password for your Kaldi & Co account associated with <strong>${toEmail}</strong>.</p>
              <p>Use the following 6-digit verification code to complete your password reset:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
              </div>
              
              <p><strong>This code will expire in 10 minutes.</strong> If you did not request a password reset, you can safely ignore this email; your account remains secure.</p>
            </div>
            <div class="divider"></div>
            <div class="footer">
              Kaldi & Co. Roastery · Addis Ababa, Ethiopia<br />
              Specialty Arabica from Yirgacheffe, Sidama, Guji & Harrar
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] OTP email delivered to ${toEmail}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send email to ${toEmail}:`, error.message);
    return { sent: false, error: error.message, otp };
  }
};

/**
 * Send an Order Receipt email to the customer
 */
export const sendOrderReceiptEmail = async (orderData) => {
  const customerEmail = orderData.customerEmail || orderData.shippingAddress?.email || orderData.userEmail;
  if (!customerEmail) {
    console.log(`[EMAIL NOTICE] No customer email provided for order receipt.`);
    return { sent: false, reason: 'No customer email' };
  }

  const transporter = createTransporter();
  const emailUser = process.env.EMAIL_USER;
  if (!transporter) {
    console.log(`[EMAIL NOTICE] No email credentials configured.`);
    return { sent: false, reason: 'No transporter configured' };
  }

  const orderRef = orderData.orderRef || orderData.orderId || orderData._id?.toString()?.slice(-8).toUpperCase() || 'KL-ORDER';
  const customerName = orderData.customerName || orderData.shippingAddress?.fullName || 'Valued Customer';
  const items = orderData.orderItems || orderData.items || [];
  const totalPrice = Number(orderData.totalPrice || orderData.total || 0).toLocaleString();
  const paymentMethod = orderData.paymentMethod || 'Cash on Delivery';
  const address = orderData.shippingAddress?.address || orderData.streetAddress || 'Addis Ababa';
  const city = orderData.shippingAddress?.city || orderData.subcity || 'Addis Ababa';
  const phone = orderData.shippingAddress?.phone || orderData.phone || '';

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4;">
        <strong style="color: #2c1810; font-size: 14px;">${item.name}</strong><br />
        <span style="font-size: 12px; color: #8c7e73;">${item.weight || '250g'} · ${item.grind || 'Whole Bean'}</span>
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4; text-align: center; color: #4a3b32; font-size: 14px;">
        ${item.quantity}×
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe4; text-align: right; color: #2c1810; font-weight: 600; font-size: 14px;">
        ETB ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Kaldi & Co Specialty Coffee" <${emailUser}>`,
    to: customerEmail,
    subject: `☕ Order Confirmation #${orderRef} - Kaldi & Co Specialty Coffee`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ef; margin: 0; padding: 24px; color: #2c1810; }
            .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 36px 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e8dfd5; }
            .header { text-align: center; margin-bottom: 24px; }
            .logo-title { font-size: 26px; font-weight: 700; color: #2c1810; letter-spacing: 0.05em; margin: 0; }
            .logo-sub { font-size: 11px; color: #c9945a; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 600; margin-top: 4px; }
            .order-badge { display: inline-block; background: #eaf3ed; color: #2e6930; font-weight: 700; font-size: 12px; padding: 6px 14px; border-radius: 20px; margin: 16px 0; }
            .divider { height: 1px; background: #f0ebe4; margin: 20px 0; }
            .details-box { background: #faf7f2; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #4a3b32; }
            .footer { font-size: 12px; color: #8c7e73; text-align: center; margin-top: 28px; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-title">KALDI & CO.</h1>
              <div class="logo-sub">Ethiopian Specialty Coffee & Roastery</div>
              <div class="order-badge">✓ ORDER CONFIRMED · #${orderRef}</div>
            </div>

            <p style="font-size: 16px; margin-bottom: 8px;">Hello <strong>${customerName}</strong>,</p>
            <p style="font-size: 14px; color: #5a4a40; line-height: 1.6; margin-top: 0;">
              Amesegenalloh! Thank you for ordering from Kaldi & Co. Your Ethiopian specialty coffee is being freshly prepped by our roastery team.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="border-bottom: 2px solid #2c1810; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #8c7e73; text-align: left;">
                  <th style="padding-bottom: 8px;">Coffee Item</th>
                  <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                  <th style="padding-bottom: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding-top: 14px; font-size: 15px; font-weight: 700; color: #2c1810;">
                    Grand Total
                  </td>
                  <td style="padding-top: 14px; text-align: right; font-size: 18px; font-weight: 700; color: #2c1810;">
                    ETB ${totalPrice}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="details-box">
              <strong style="color: #2c1810; display: block; margin-bottom: 6px; font-size: 14px;">📍 Delivery Details:</strong>
              <div><strong>Recipient:</strong> ${customerName} (${phone})</div>
              <div><strong>Address:</strong> ${address}, ${city}</div>
              <div><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</div>
            </div>

            <p style="font-size: 13px; color: #5a4a40; line-height: 1.6;">
              Need to modify your order or ask a question? Reach our roastery barista directly on WhatsApp:
              <a href="https://wa.me/251911234567" style="color: #2e6930; font-weight: 700;">+251 91 123 4567</a>.
            </p>

            <div class="divider"></div>
            <div class="footer">
              Kaldi & Co. Roastery · Addis Ababa, Ethiopia<br />
              Direct Trade Specialty Arabica: Yirgacheffe · Sidama · Guji · Harrar
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Order receipt delivered to ${customerEmail}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send order receipt to ${customerEmail}:`, error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Send Store Notification email to the Store Business Owner / Manager
 * Primary Recipient: process.env.STORE_EMAIL || 'kalidcoexample@gmail.com'
 * (Easily configurable in server/.env when the website is sold)
 */
export const sendStoreOrderNotification = async (orderData) => {
  const storeEmail = process.env.STORE_EMAIL || 'kalidcoexample@gmail.com';
  const transporter = createTransporter();
  const emailUser = process.env.EMAIL_USER;

  if (!transporter) {
    console.log(`[STORE ALERT NOTICE] Transporter not configured. New order for store: ${storeEmail}`);
    return { sent: false, reason: 'No transporter' };
  }

  const orderRef = orderData.orderRef || orderData.orderId || orderData._id?.toString()?.slice(-8).toUpperCase() || 'KL-ORDER';
  const customerName = orderData.customerName || orderData.shippingAddress?.fullName || 'Customer';
  const customerEmail = orderData.customerEmail || orderData.shippingAddress?.email || orderData.userEmail || 'Not provided';
  const phone = orderData.shippingAddress?.phone || orderData.phone || 'Not provided';
  const address = orderData.shippingAddress?.address || orderData.streetAddress || 'Addis Ababa';
  const city = orderData.shippingAddress?.city || orderData.subcity || 'Addis Ababa';
  const items = orderData.orderItems || orderData.items || [];
  const totalPrice = Number(orderData.totalPrice || orderData.total || 0).toLocaleString();
  const paymentMethod = orderData.paymentMethod || 'Cash on Delivery';

  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #e8dfd5;">
      <td style="padding: 10px 8px; font-weight: 600; color: #1a0f0a;">${item.name}</td>
      <td style="padding: 10px 8px; color: #5a4a40;">${item.weight || '250g'}</td>
      <td style="padding: 10px 8px; color: #5a4a40;">${item.grind || 'Whole Bean'}</td>
      <td style="padding: 10px 8px; text-align: center; font-weight: 700; color: #1a0f0a;">${item.quantity}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #1a0f0a;">
        ETB ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Kaldi Store Orders" <${emailUser}>`,
    to: storeEmail,
    subject: `🚨 [NEW ORDER #${orderRef}] ETB ${totalPrice} from ${customerName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ef; margin: 0; padding: 24px; color: #2c1810; }
            .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 2px solid #2c1810; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .alert-banner { background: #2c1810; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
            .card { background: #faf7f2; border-radius: 8px; padding: 18px; margin: 18px 0; border: 1px solid #e8dfd5; }
            .label { font-weight: 700; color: #2c1810; display: inline-block; width: 140px; }
            .value { color: #4a3b32; }
            .config-note { background: #fff8e1; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 24px; font-size: 12px; color: #78350f; line-height: 1.5; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert-banner">
              <h2 style="margin: 0; font-size: 20px; letter-spacing: 0.05em;">📦 NEW CUSTOMER ORDER RECEIVED</h2>
              <div style="font-size: 13px; opacity: 0.9; margin-top: 4px;">Order #${orderRef} · ETB ${totalPrice}</div>
            </div>

            <div class="card">
              <h3 style="margin-top: 0; font-size: 16px; color: #2c1810; border-bottom: 1px solid #e0d4c6; padding-bottom: 8px;">
                👤 Customer & Delivery Info
              </h3>
              <div style="line-height: 1.8; font-size: 14px;">
                <div><span class="label">Customer Name:</span> <span class="value"><strong>${customerName}</strong></span></div>
                <div><span class="label">Phone:</span> <span class="value"><a href="tel:${phone}" style="color: #2e6930; font-weight: 700;">${phone}</a></span></div>
                <div><span class="label">Email:</span> <span class="value"><a href="mailto:${customerEmail}">${customerEmail}</a></span></div>
                <div><span class="label">Sub-City / Area:</span> <span class="value">${city}</span></div>
                <div><span class="label">Payment Method:</span> <span class="value"><strong>${paymentMethod.toUpperCase()}</strong></span></div>
                <div><span class="label">Payment Status:</span> <span class="value" style="color: ${orderData.isPaid ? '#15803d' : '#b45309'}; font-weight: 700;">${orderData.paymentStatus || (orderData.isPaid ? 'Paid & Verified' : 'Pending Verification')}</span></div>
                ${orderData.transactionId ? `
                  <div style="margin-top: 6px;"><span class="label">Transaction ID:</span> <span class="value"><code style="background: #e8dfd5; padding: 3px 8px; font-size: 14px; font-weight: 700; color: #1a0f0a; border-radius: 3px;">${orderData.transactionId}</code></span></div>
                  <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 8px 12px; margin-top: 8px; border-radius: 4px; font-size: 12px; color: #92400e;">
                    🔍 <strong>Action Required:</strong> Check your Telebirr / CBE app for this reference code to confirm the funds were credited before packing.
                  </div>
                ` : ''}
              </div>
            </div>

            <h3 style="font-size: 16px; color: #2c1810; margin-top: 24px; margin-bottom: 10px;">
              ☕ Items to Pack & Dispatch:
            </h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr style="background: #efe9df; text-align: left; font-size: 12px; text-transform: uppercase;">
                  <th style="padding: 8px;">Item</th>
                  <th style="padding: 8px;">Size</th>
                  <th style="padding: 8px;">Grind</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr style="background: #faf7f2;">
                  <td colspan="4" style="padding: 12px 8px; font-size: 15px; font-weight: 700; color: #2c1810;">
                    TOTAL TO COLLECT / RECEIVED:
                  </td>
                  <td style="padding: 12px 8px; text-align: right; font-size: 17px; font-weight: 700; color: #2c1810;">
                    ETB ${totalPrice}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="config-note">
              <strong>⚙️ Store Email Routing Notice:</strong><br />
              This notification was sent to <strong>${storeEmail}</strong> as defined by <code>STORE_EMAIL</code> in your <code>server/.env</code> file.<br />
              <em>If this website is sold or transferred to a new owner, update <code>STORE_EMAIL</code> in <code>server/.env</code> to point to the new owner's inbox.</em>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Store order alert delivered to ${storeEmail}. Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId, storeEmail };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send store order alert to ${storeEmail}:`, error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Send Contact or Wholesale Inquiry email to the Store Business Owner
 * Recipient: process.env.STORE_EMAIL || 'kalidcoexample@gmail.com'
 */
export const sendInquiryEmail = async ({
  type = 'contact',
  name,
  email,
  phone = '',
  businessName = '',
  businessType = '',
  volumeKg = '',
  coffeeInterest = '',
  subject = '',
  message = '',
}) => {
  const storeEmail = process.env.STORE_EMAIL || 'kalidcoexample@gmail.com';
  const transporter = createTransporter();
  const emailUser = process.env.EMAIL_USER;

  if (!transporter) {
    console.log(`[INQUIRY NOTICE] Transporter not configured. Inquiry from ${name} <${email}>`);
    return { sent: false, reason: 'No transporter' };
  }

  const isWholesale = type === 'wholesale';
  const title = isWholesale ? '🏢 NEW WHOLESALE PARTNERSHIP INQUIRY' : '💬 NEW CUSTOMER CONTACT MESSAGE';
  const emailSubject = isWholesale
    ? `☕ [Wholesale Partner Inquiry] ${businessName || name} (${volumeKg || 'Custom Volume'})`
    : `📬 [Customer Inquiry] ${name} - ${subject || 'General Inquiry'}`;

  const mailOptions = {
    from: `"Kaldi Website" <${emailUser}>`,
    to: storeEmail,
    replyTo: email,
    subject: emailSubject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f4ef; margin: 0; padding: 24px; color: #2c1810; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; border: 1px solid #e8dfd5; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            .banner { background: ${isWholesale ? '#c9945a' : '#2c1810'}; color: #ffffff; padding: 14px 20px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
            .field-row { padding: 8px 0; border-bottom: 1px solid #f0ebe4; font-size: 14px; }
            .field-label { font-weight: 700; color: #2c1810; display: inline-block; width: 140px; }
            .msg-box { background: #faf7f2; border-left: 4px solid #c9945a; padding: 16px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #2c1810; border-radius: 0 8px 8px 0; }
            .footer { font-size: 12px; color: #8c7e73; text-align: center; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="banner">
              <h2 style="margin: 0; font-size: 18px; letter-spacing: 0.05em;">${title}</h2>
            </div>

            <div class="field-row"><span class="field-label">Sender Name:</span> <strong>${name}</strong></div>
            <div class="field-row"><span class="field-label">Email:</span> <a href="mailto:${email}">${email}</a></div>
            ${phone ? `<div class="field-row"><span class="field-label">Phone:</span> <a href="tel:${phone}">${phone}</a></div>` : ''}
            ${businessName ? `<div class="field-row"><span class="field-label">Business Name:</span> <strong>${businessName}</strong></div>` : ''}
            ${businessType ? `<div class="field-row"><span class="field-label">Business Type:</span> ${businessType}</div>` : ''}
            ${volumeKg ? `<div class="field-row"><span class="field-label">Est. Volume:</span> <strong>${volumeKg}</strong></div>` : ''}
            ${coffeeInterest ? `<div class="field-row"><span class="field-label">Coffee Interest:</span> ${coffeeInterest}</div>` : ''}
            ${subject ? `<div class="field-row"><span class="field-label">Subject:</span> ${subject}</div>` : ''}

            <h4 style="margin-top: 20px; margin-bottom: 8px; color: #2c1810;">Message:</h4>
            <div class="msg-box" style="white-space: pre-wrap;">${message || '(No message content provided)'}</div>

            <p style="font-size: 13px; color: #6b5c51;">
              💡 <em>You can reply directly to this email to respond to <strong>${name}</strong> (${email}).</em>
            </p>

            <div class="footer">
              Kaldi & Co Specialty Coffee Platform<br />
              Routed to <strong>${storeEmail}</strong> via <code>STORE_EMAIL</code> setting.
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL SUCCESS] Inquiry delivered to store (${storeEmail}). Message ID: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to send inquiry to ${storeEmail}:`, error.message);
    return { sent: false, error: error.message };
  }
};

/**
 * Send an OTP verification SMS to a phone number
 * Supports:
 * - AfroMessage (Ethiopia local SMS Gateway: https://afromessage.com)
 * - Twilio (International SMS)
 * - Console simulation fallback when no gateway keys are set in .env
 *
 * @param {string} toPhone - Recipient phone number (e.g., "+251911223344" or "0911223344")
 * @param {string} otp - 6-digit OTP code
 */
export const sendOtpSms = async (toPhone, otp) => {
  const message = `Your Kaldi & Co verification code is ${otp}. Valid for 10 minutes. Do not share this code.`;

  // Normalize Ethiopian phone number format (+2519... or +2517...)
  let cleanPhone = toPhone.replace(/[\s\-\(\)]/g, '');
  if (cleanPhone.startsWith('09') || cleanPhone.startsWith('07')) {
    cleanPhone = '+251' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('9') || cleanPhone.startsWith('7')) {
    cleanPhone = '+251' + cleanPhone;
  }

  // 1. Check if AfroMessage (Ethiopian SMS Gateway) is configured
  if (process.env.AFROMESSAGE_TOKEN) {
    try {
      const payload = {
        to: cleanPhone,
        recipient: cleanPhone,
        message: message,
      };

      if (process.env.AFROMESSAGE_SENDER_ID && process.env.AFROMESSAGE_SENDER_ID.trim()) {
        payload.from = process.env.AFROMESSAGE_SENDER_ID.trim();
        payload.sender = process.env.AFROMESSAGE_SENDER_ID.trim();
      }

      const response = await fetch('https://api.afromessage.com/api/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AFROMESSAGE_TOKEN.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(`[AFROMESSAGE RESPONSE]`, data);

      if (response.ok && (data.acknowledge === 'success' || data.status === 'success' || data.response?.status === 'success')) {
        console.log(`[SMS SUCCESS] AfroMessage sent OTP to ${cleanPhone}`);
        return { sent: true, provider: 'afromessage' };
      } else {
        const errorMsg = data.response?.errors?.[0] || data.message || 'AfroMessage rejected delivery';
        console.warn(`[SMS WARNING] AfroMessage:`, errorMsg);
        return { sent: false, error: errorMsg, otp };
      }
    } catch (err) {
      console.error(`[SMS ERROR] AfroMessage network error:`, err.message);
      return { sent: false, error: err.message, otp };
    }
  }

  // 2. Check if Twilio is configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const body = new URLSearchParams({
        To: toPhone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: message,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        }
      );

      const data = await response.json();
      if (response.ok && data.sid) {
        console.log(`[SMS SUCCESS] Twilio sent OTP to ${toPhone}. SID: ${data.sid}`);
        return { sent: true, provider: 'twilio', sid: data.sid };
      } else {
        console.warn(`[SMS WARNING] Twilio error:`, data.message);
      }
    } catch (err) {
      console.error(`[SMS ERROR] Twilio network error:`, err.message);
    }
  }

  // 3. Fallback when SMS credentials are not set in .env
  console.log(`[SMS NOTICE] No SMS gateway credentials in server/.env (AFROMESSAGE_TOKEN or TWILIO_ACCOUNT_SID).`);
  console.log(`[SMS NOTICE] Simulated SMS to ${toPhone}: "${message}"`);

  return {
    sent: false,
    reason: 'No SMS gateway configured in server/.env (AFROMESSAGE_TOKEN or TWILIO)',
    otp,
  };
};

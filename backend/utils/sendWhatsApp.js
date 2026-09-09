import twilio from 'twilio';

/**
 * Utility function to send WhatsApp messages via Twilio
 * @param {string} to - The customer's phone number
 * @param {string} message - The text content to send
 * @returns {Promise<boolean>}
 */
export const sendWhatsAppMessage = async (to, message) => {
    try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // default Twilio sandbox number

        if (!accountSid || !authToken) {
            console.log(`\n================================`);
            console.log(`[MOCK WHATSAPP] To: ${to}`);
            console.log(`[MOCK WHATSAPP] Message: ${message}`);
            console.log(`================================\n`);
            return true;
        }

        // Clean phone number: keep only digits
        const cleanPhone = String(to).replace(/\D/g, '');
        // Standardize to E.164 format. If it's a 10-digit number, prepend +91 for India
        let formattedTo = cleanPhone;
        if (cleanPhone.length === 10) {
            formattedTo = '+91' + cleanPhone;
        } else if (!cleanPhone.startsWith('+')) {
            formattedTo = '+' + cleanPhone;
        }

        const client = twilio(accountSid, authToken);
        const result = await client.messages.create({
            from: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
            to: `whatsapp:${formattedTo}`,
            body: message
        });

        console.log(`[TWILIO WHATSAPP] Successfully sent message to ${formattedTo}. Message SID: ${result.sid}`);
        return true;
    } catch (error) {
        console.error('[TWILIO WHATSAPP ERROR] Failed to send WhatsApp message:', error.message);
        return false;
    }
};

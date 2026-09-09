import dotenv from 'dotenv';
import { sendWhatsAppMessage } from './utils/sendWhatsApp.js';
dotenv.config();

const testWhatsApp = async () => {
    console.log("Testing WhatsApp message...");
    const success = await sendWhatsAppMessage('9999999999', 'Hello! This is a test WhatsApp message from the Food Court QR Ordering System.');
    console.log("Result:", success ? "SUCCESS" : "FAILED");
};

testWhatsApp();

import Order from '../models/Order.js';
import axios from 'axios';
import { sendWhatsAppMessage } from '../utils/sendWhatsApp.js';

export const broadcastMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message is required' });

        // Find all unique phone numbers for this restaurant
        const orders = await Order.find({ 
            restaurant: req.user._id, 
            customerPhone: { $exists: true, $ne: '' } 
        }).select('customerPhone');
        
        const phoneNumbers = [...new Set(orders.map(order => order.customerPhone))];

        if (phoneNumbers.length === 0) {
            return res.status(404).json({ message: 'No customers found to broadcast to.' });
        }

        let successCount = 0;
        let failCount = 0;
        
        // Sequentially to avoid overwhelming trial accounts or hitting rate limits
        for (const phone of phoneNumbers) {
            const success = await sendWhatsAppMessage(phone, message);
            if (success) successCount++;
            else failCount++;
        }

        res.json({ message: 'Broadcast complete', successCount, failCount, total: phoneNumbers.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAudienceSize = async (req, res) => {
    try {
        const orders = await Order.find({ 
            restaurant: req.user._id, 
            customerPhone: { $exists: true, $ne: '' } 
        }).select('customerPhone');
        
        const phoneNumbers = [...new Set(orders.map(order => order.customerPhone))];
        
        res.json({ count: phoneNumbers.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import Razorpay from 'razorpay';
import crypto from 'crypto';

export const getRazorpayConfig = (req, res) => {
    res.json({ key_id: process.env.RAZORPAY_KEY_ID });
};

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
        });

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await instance.orders.create(options);

        // Razorpay SDK may return an error object directly instead of throwing
        if (order && order.error) {
            return res.status(400).json({ message: order.error.description || 'Razorpay Error: Authentication failed or invalid request' });
        }

        if (!order) return res.status(500).send('Some error occured');

        res.json(order);
    } catch (error) {
        // Handle when instance.orders.create actually throws
        const message = error.error ? error.error.description : error.message;
        res.status(500).json({ message: message || 'Failed to create payment order' });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        } = req.body;

        const sign = razorpayOrderId + '|' + razorpayPaymentId;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(sign.toString())
            .digest('hex');

        if (razorpaySignature === expectedSign) {
            return res.status(200).json({ message: 'Payment verified successfully' });
        } else {
            return res.status(400).json({ message: 'Invalid signature sent!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

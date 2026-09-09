import QRCode from 'qrcode';
import os from 'os';

const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
};

export const generateQRCode = async (req, res) => {
    try {
        const ip = getLocalIp();
        let frontendUrl = req.query.frontend || process.env.FRONTEND_URL || 'https://qr-food-ordering-rho.vercel.app';
        
        // If testing locally, convert localhost to network IP for mobile scanning
        if (frontendUrl.includes('localhost')) {
            frontendUrl = frontendUrl.replace('localhost', ip);
        }
        
        const table = req.query.table;
        let url = `${frontendUrl}/menu?restaurant=${req.user._id}`;
        if (table) {
            url += `&table=${table}`;
        }
        
        const qrCodeUrl = await QRCode.toDataURL(url);
        res.json({ qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: 'Error generating QR code' });
    }
};

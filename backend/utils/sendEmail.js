import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', // or any other email wrapper
            auth: {
                user: process.env.ADMIN_EMAIL || 'test@example.com',
                pass: process.env.EMAIL_PASS || 'password'
            }
        });

        const mailOptions = {
            from: process.env.ADMIN_EMAIL || 'test@example.com',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html
        };

        if (process.env.ADMIN_EMAIL && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${options.email}`);
        } else {
            console.log('Admin email not configured. Mock sending email:');
            console.log(`To: ${options.email}\nSubject: ${options.subject}\nBody:\n${options.text || options.html}`);
        }
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

export default sendEmail;

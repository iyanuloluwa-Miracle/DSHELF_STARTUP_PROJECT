const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
        user: 'dion.hessel44@ethereal.email',
        pass: 'gdkfsk6KgfMuHbgEpp'
    }
});

const mailOptions = {
    from: 'dion.hessel44@ethereal.email',
    to: 'iyanudina@gmail.com',  // Replace with your actual email
    subject: 'Test Email',
    text: 'Hello, this is a test email from your Node.js app.'
};

transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.error('Error sending email:', err);
    } else {
        console.log('Email sent:', info.response);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
});

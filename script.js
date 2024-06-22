const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const qrcode = require('qrcode');
require('dotenv').config(); 
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});
const otps = {};
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).send('Email is required');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error); 
            return res.status(500).send('Error sending email');
        }
        otps[email] = otp; 
        console.log('Email sent:', info.response);
        res.send('OTP sent');
    });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).send('Email and OTP are required');
    }

    if (otps[email] && otps[email] === otp) {
        delete otps[email]; 
        const qrData = `Email: ${email} verified at ${new Date().toISOString()}`;
        qrcode.toDataURL(qrData, (err, url) => {
            if (err) {
                console.error('Error generating QR code:', err);
                return res.status(500).send('Error generating QR code');
            }
            res.send({ message: 'OTP verified', qrCode: url });
        });
    } else {
        res.status(400).send('Invalid OTP');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
fetch('/send-otp', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: email })
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.text();
})
.then(data => {
    alert(data);
    document.getElementById('otpGroup').style.display = 'block';
    document.getElementById('btnVerify').style.display = 'block';
})
.catch(error => {
    console.error('Error sending OTP:', error);
    alert('Error sending OTP');
});

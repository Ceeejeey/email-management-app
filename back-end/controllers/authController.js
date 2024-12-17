const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { pool } = require('../config/config');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');
const crypto = require('crypto');

// Gmail API configuration
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Function to send email via Gmail API
async function sendVerificationEmail(to, verificationUrl) {
    const encodedMessage = Buffer.from(
        `From: "Email Management System" <${process.env.EMAIL_USER}>\r\n` +
        `To: ${to}\r\n` +
        `Subject: Verify Your Email Address\r\n\r\n` +
        `Please verify your email by clicking the link below:\r\n${verificationUrl}`
    ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    try {
        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage,
            },
        });
        console.log('Verification email sent successfully');
    } catch (err) {
        console.error('Error sending verification email:', err);
        throw err;
    }
}

// Sign-up logic with Gmail API
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate a unique email verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Insert the user into the database
        await pool.query(
            'INSERT INTO users (name, email, password, is_verified, verification_token) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, false, verificationToken]
        );

        // Send verification email
        const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;
        await sendVerificationEmail(email, verificationUrl);

        res.status(201).json({ message: 'Signup successful! Please check your email for verification.' });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ message: 'Error while signing up' });
    }
});

// Email verification logic
router.post('/verify-email', async (req, res) => {
    const { token } = req.body;

    try {
        
        const [rows] = await pool.query('SELECT * FROM users WHERE verification_token = ?', [token]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

       
        await pool.query('UPDATE users SET is_verified = ? WHERE id = ?', [true, user.id]);

        res.json({ message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ message: 'An error occurred during email verification' });
    }
});

// Sign-in logic
router.post('/signin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const existingRefreshToken = req.cookies.refreshToken;

        if (existingRefreshToken) {
            try {
                const decoded = jwt.verify(existingRefreshToken, process.env.JWT_REFRESH_SECRET);
                return res.json({ accessToken: existingRefreshToken, user });
            } catch (err) {
                console.log('Invalid or expired refresh token, issuing a new one...');
            }
        }

        const accessToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.json({ accessToken, user, message: 'Sign-in successful' });

    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'An error occurred during sign-in' });
    }
});



module.exports = router;

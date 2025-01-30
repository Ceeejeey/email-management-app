require('dotenv').config();
const express = require('express');
const router = express.Router();
const { pool } = require('../config/config'); 
const authenticateToken = require('../middlewares/authMiddleware');
const bcrypt = require('bcryptjs');
const { google } = require('googleapis');

// Google OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Fetch user profile
router.get('/user/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, googleTokens FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

// Update user profile
router.put('/user/profile', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [userResult] = await pool.query(
      'SELECT id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }

    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      params.push(hashedPassword);
    }

    if (updates.length > 0) {
      params.push(req.user.id);
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      await pool.query(updateQuery, params);
    }

    res.status(200).json({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// Step 1: Generate Google Auth URL
router.get('/auth/google', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }

  // Set user ID in a cookie
  res.cookie('googleAuthUserId', userId, {
      httpOnly: true,  // Prevent access from JavaScript
      secure: process.env.NODE_ENV === 'production', // Secure flag for HTTPS
      sameSite: 'Lax', // Prevent CSRF attacks
      maxAge: 10 * 60 * 1000 // Expire in 10 minutes
  });

  // Generate Google OAuth2 URL
  const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send'],
      prompt: 'consent',
  });

  res.json({ authUrl });
});


// Step 2: Handle Google OAuth2 Callback
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  const userId = req.cookies.googleAuthUserId; // Retrieve from cookies

  
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required.' });
    }
  
    if (!userId) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
  }

  try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Save tokens to the database
      await pool.query(
          'UPDATE users SET googleTokens = ? WHERE id = ?',
          [JSON.stringify(tokens), userId]
      );

      // Clear the cookie after successful authentication
      res.clearCookie('googleAuthUserId');
  
      res.status(200).json({ message: 'Google account connected successfully!' });
    } catch (error) {
      console.error('Error during Google OAuth2 callback:', error);
      res.status(500).json({ message: 'Failed to connect Google account.' });
    }
  });
  

module.exports = router;

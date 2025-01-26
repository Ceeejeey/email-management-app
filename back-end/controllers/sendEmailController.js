const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer')

router.post('/send-email', async (req, res) => {
    const { senderEmail, senderPassword, subject, body, recipients } = req.body;
    console.log(req.body)

    console.log('senderEmail:', senderEmail);
    if (!senderEmail || !senderPassword || !subject || !body || !recipients || recipients.length === 0) {
      return res.status(400).json({ message: 'Sender email, password, subject, body, and recipients are required.' });
    }
  
    try {
      // Create transporter with sender's credentials
      const transporter = nodemailer.createTransport({
        service: 'Gmail', // Update this if using a different email provider
        auth: {
          user: senderEmail,
          pass: senderPassword,
        },
      });
  
      // Prepare recipients as a comma-separated string
      const recipientList = Array.isArray(recipients) ? recipients.join(',') : recipients;
  
      // Email Options
      const mailOptions = {
        from: senderEmail, // Sender's email address
        to: recipientList, // Recipients
        subject: subject, // Email subject
        text: body, // Email body in plain text
      };
  
      // Send the email
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Failed to send email.', error: error.message });
    }
  });
  
  module.exports = router;
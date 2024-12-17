const express = require('express');
const router = express.Router();
const { pool } = require('../config/config'); 
const authenticateToken = require('../middlewares/authMiddleware');



// Add a new contact
router.post('/contacts', authenticateToken, async (req, res) => {
  const { name, email } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO contacts (name, email, user_id) VALUES (?, ?, ?)',
      [name, email, req.userId]
    );

    res.status(201).json({ id: result.insertId, name, email });
  } catch (err) {
    console.error('Error adding contact:', err);
    res.status(400).json({ message: 'Error adding contact' });
  }
});

// Delete a contact
router.delete('/contacts/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM contacts WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Error deleting contact:', err);
    res.status(400).json({ message: 'Error deleting contact' });
  }
});

// Update a contact
router.post('/update-contact/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE contacts SET name = ?, email = ? WHERE id = ? AND user_id = ?',
      [name, email, id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contact not found or unauthorized' });
    }

    res.json({ message: 'Contact updated successfully', id, name, email });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(400).json({ message: 'Error updating contact' });
  }
});

// Fetch all contacts for the authenticated user
router.get('/contacts', authenticateToken, async (req, res) => {
  console.log('Fetching contacts for User ID:', req.userId);

  const startTime = Date.now(); 

  try {
    const [results] = await pool.query(
      'SELECT id, name, email FROM contacts WHERE user_id = ?',
      [req.userId]
    );

    const endTime = Date.now(); 
    console.log(`Query executed in ${endTime - startTime} ms`);

    res.json(results);
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(400).json({ message: 'Error fetching contacts' });
  }
});

module.exports = router;

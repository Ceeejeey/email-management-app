const express = require('express');
const router = express.Router();
const multer = require('multer');
const { pool } = require('../config/config');
const authenticateToken = require('../middlewares/authMiddleware');

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Fetch all templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const [templates] = await pool.query('SELECT id, name, content FROM templates WHERE user_id = ?', [req.userId]);
    res.json(templates);
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ message: 'Error fetching templates' });
  }
});

// Create a new template
router.post('/templates', authenticateToken, upload.single('file'), async (req, res) => {
  const { name, content } = req.body;

  try {
    const [result] = await pool.query('INSERT INTO templates (name, content, user_id) VALUES (?, ?, ?)', [
      name,
      content,
      req.userId,
    ]);
    res.json({ id: result.insertId, name, content });
  } catch (err) {
    console.error('Error saving template:', err);
    res.status(500).json({ message: 'Error saving template' });
  }
});

// Update a template
router.put('/templates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, content } = req.body;

  try {
    await pool.query('UPDATE templates SET name = ?, content = ? WHERE id = ? AND user_id = ?', [
      name,
      content,
      id,
      req.userId,
    ]);
    res.json({ id, name, content });
  } catch (err) {
    console.error('Error updating template:', err);
    res.status(500).json({ message: 'Error updating template' });
  }
});

// Delete a template
router.delete('/templates/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM templates WHERE id = ? AND user_id = ?', [id, req.userId]);
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('Error deleting template:', err);
    res.status(500).json({ message: 'Error deleting template' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../config/config'); // Database connection
const authenticateToken = require('../middlewares/authMiddleware'); // Token middleware

// ------------------------ 1. Create a New Group ------------------------
router.post('/groups', authenticateToken, async (req, res) => {
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ message: 'Group name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO groups (name, description, user_id) VALUES (?, ?, ?)',
      [name, description, req.userId]
    );
    res.status(201).json({ id: result.insertId, name, description });
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ message: 'Error creating group' });
  }
});

// ------------------------ 2. Add Contacts to a Group ------------------------
router.post('/groups/:groupId/contacts', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { contactIds } = req.body; 

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({ message: 'Invalid or empty contact list' });
  }

  const values = contactIds.map((contactId) => [groupId, contactId]);

  try {
   
    const [result] = await pool.query(
      'INSERT IGNORE INTO group_contacts (group_id, contact_id) VALUES ?',
      [values]
    );
    res.json({ message: 'Contacts added successfully', addedRows: result.affectedRows });
  } catch (err) {
    console.error('Error adding contacts to group:', err);
    res.status(500).json({ message: 'Error adding contacts to group' });
  }
});

// ------------------------ 3. Remove Contacts from a Group ------------------------
router.delete('/groups/:groupId/contacts', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { contactIds } = req.body; 

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({ message: 'Invalid or empty contact list to remove' });
  }

  try {
   
    const [result] = await pool.query(
      'DELETE FROM group_contacts WHERE group_id = ? AND contact_id IN (?)',
      [groupId, contactIds]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Contacts not found in the group' });
    }

    res.json({ message: 'Contacts removed successfully' });
  } catch (err) {
    console.error('Error removing contacts from group:', err);
    res.status(500).json({ message: 'Error removing contacts from group' });
  }
});


// ------------------------ 4. Fetch Group Details with Contacts ------------------------
router.get('/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;

  try {
   
    const [results] = await pool.query(
      `SELECT g.id, g.name, g.description, g.created_at, c.id AS contact_id, c.name AS contact_name, c.email 
       FROM groups g
       LEFT JOIN group_contacts gc ON g.id = gc.group_id
       LEFT JOIN contacts c ON gc.contact_id = c.id
       WHERE g.id = ? AND g.user_id = ?`,
      [groupId, req.userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Initialize group object
    const group = {
      id: results[0].id,
      name: results[0].name,
      description: results[0].description,
      created_at: results[0].created_at,
      contacts: [],
    };

    // Map over results to collect contacts
    results.forEach(row => {
      if (row.contact_id) {
        group.contacts.push({
          id: row.contact_id,
          name: row.contact_name,
          email: row.email,
        });
      }
    });

    res.json(group);
  } catch (err) {
    console.error('Error fetching group details:', err);
    res.status(500).json({ message: 'Error fetching group details' });
  }
});


// ------------------------ 5. Update Group Details ------------------------
router.put('/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;
  const { name, description, contactIds } = req.body;

 
  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  try {
   
    const [groupResult] = await pool.query(
      'UPDATE groups SET name = ?, description = ? WHERE id = ? AND user_id = ?',
      [name, description, groupId, req.userId]
    );

    
    if (groupResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // If 'contactIds' are provided, handle the adding/removing of contacts
    if (Array.isArray(contactIds)) {
      // First, remove contacts that are not selected in the 'contactIds' list
      const [existingContacts] = await pool.query(
        'SELECT contact_id FROM group_contacts WHERE group_id = ?',
        [groupId]
      );

      const existingContactIds = existingContacts.map(row => row.contact_id);
      const contactsToRemove = existingContactIds.filter(contactId => !contactIds.includes(contactId));

      if (contactsToRemove.length > 0) {
        // Remove the unselected contacts
        await pool.query(
          'DELETE FROM group_contacts WHERE group_id = ? AND contact_id IN (?)',
          [groupId, contactsToRemove]
        );
      }

      // Add new contacts that were selected but not previously added
      const contactsToAdd = contactIds.filter(contactId => !existingContactIds.includes(contactId));

      if (contactsToAdd.length > 0) {
        const values = contactsToAdd.map(contactId => [groupId, contactId]);
        await pool.query(
          'INSERT IGNORE INTO group_contacts (group_id, contact_id) VALUES ?',
          [values]
        );
      }
    }

    res.json({ message: 'Group updated successfully' });
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ message: 'Error updating group' });
  }
});

// ------------------------ 6. Delete a Group ------------------------
router.delete('/groups/:groupId', authenticateToken, async (req, res) => {
  const { groupId } = req.params;

  try {
    const [result] = await pool.query(
      'DELETE FROM groups WHERE id = ? AND user_id = ?',
      [groupId, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ message: 'Error deleting group' });
  }
});

// ------------------------ 7. Fetch Contacts of a Group ------------------------
router.get('/groups/:groupId/contacts', authenticateToken, async (req, res) => {
  const { groupId } = req.params;

  try {
    // Query to fetch contacts associated with the group
    const [results] = await pool.query(
      `SELECT c.id AS contact_id, c.name AS contact_name, c.email
       FROM group_contacts gc
       LEFT JOIN contacts c ON gc.contact_id = c.id
       WHERE gc.group_id = ?`,
      [groupId]
    );

    // If no contacts are found, return an empty array instead of 404
    if (results.length === 0) {
      return res.json([]);  // No contacts found, but it's okay
    }

    // Map over the results and send the contacts
    const contacts = results.map(row => ({
      id: row.contact_id,
      name: row.contact_name,
      email: row.email
    }));

    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts for group:', err);
    res.status(500).json({ message: 'Error fetching contacts for group' });
  }
});

// ------------------8. Fetch All Groups------------------------
router.get('/groups', authenticateToken, async (req, res) => {
  try {
    const [groups] = await pool.query(
      'SELECT id, name, description, created_at FROM groups WHERE user_id = ?',
      [req.userId]
    );

    if (groups.length === 0) {
      return res.json([]); // No groups found
    }

    // Fetch contacts associated with the groups
    const groupIds = groups.map((group) => group.id);
    const [contacts] = await pool.query(
      `SELECT gc.group_id, c.id AS contact_id, c.name AS contact_name, c.email
       FROM group_contacts gc
       JOIN contacts c ON gc.contact_id = c.id
       WHERE gc.group_id IN (?)`,
      [groupIds]
    );

    const groupMap = groups.map((group) => ({
      ...group,
      contacts: contacts
        .filter((contact) => contact.group_id === group.id)
        .map((contact) => ({
          id: contact.contact_id,
          name: contact.contact_name,
          email: contact.email,
        })),
    }));

    res.json(groupMap);
  } catch (err) {
    console.error('Error fetching groups with contacts:', err);
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

module.exports = router;

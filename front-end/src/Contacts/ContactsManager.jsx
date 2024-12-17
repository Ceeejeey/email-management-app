import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import './ContactsManager.css';

const ContactsManager = () => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', email: '' });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await axios.get('/api/contacts', {
          withCredentials: true,
          timeout: 30000,
        });
        console.log('Fetched Contacts:', response.data);
        setContacts(response.data);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContact((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = async () => {
    if (!newContact.name || !newContact.email) return;

    try {
      if (editIndex !== null) {
        const response = await axios.post(
          `/api/update-contact/${contacts[editIndex].id}`,
          newContact,
          { withCredentials: true }
        );
        const updatedContacts = [...contacts];
        updatedContacts[editIndex] = response.data;
        setContacts(updatedContacts);
        setEditIndex(null);
      } else {
        const response = await axios.post(
          '/api/contacts',
          newContact,
          { withCredentials: true }
        );
        setContacts((prev) => [...prev, response.data]);
      }

      setNewContact({ name: '', email: '' });
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleDeleteContact = async (index) => {
    try {
      await axios.delete(`/api/contacts/${contacts[index].id}`, {
        withCredentials: true,
      });
      const updatedContacts = contacts.filter((_, i) => i !== index);
      setContacts(updatedContacts);
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleEditContact = (index) => {
    setNewContact(contacts[index]);
    setEditIndex(index);
  };

  return (
    <div className="contacts-manager">
      <h2>Manage Individual Contacts</h2>
      <p>Add, edit, or remove individual contacts here.</p>

      <div className="contact-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={newContact.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newContact.email}
          onChange={handleInputChange}
          required
        />
        <button onClick={handleSaveContact}>
          {editIndex !== null ? 'Update Contact' : 'Add Contact'}
        </button>
      </div>

      <div className="contacts-list">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact, index) => (
                <tr key={index}>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>
                    <button onClick={() => handleEditContact(index)}>Edit</button>
                    <button onClick={() => handleDeleteContact(index)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  No contacts available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsManager;

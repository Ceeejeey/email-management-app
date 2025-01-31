import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from '../utils/axiosConfig';
import './GroupManager.css';

const GroupsManager = () => {
  const [groups, setGroups] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    contactIds: [],
  });
  const [editGroupId, setEditGroupId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch groups and set initial state
  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups', { withCredentials: true });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // Fetch all contacts for selection
  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts', { withCredentials: true });
      setContacts(response.data); 
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Open the modal for creating or editing a group
  const openModal = async (group = null) => {
    try {
     
      await fetchContacts();

      if (group) {
        setEditGroupId(group.id);

        // Initialize groupForm with selected contacts and other group data
        setGroupForm({
          name: group.name,
          description: group.description || '',
          contactIds: group.contacts ? group.contacts.map((contact) => contact.id) : [], 
        });
      } else {
        setEditGroupId(null);
        setGroupForm({ name: '', description: '', contactIds: [] }); 
      }

      setIsModalOpen(true); 
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle contact selection (checkbox toggle)
  const handleContactSelection = (contactId) => {
    setGroupForm((prev) => {
      const alreadySelected = prev.contactIds.includes(contactId);
      const updatedContactIds = alreadySelected
        ? prev.contactIds.filter((id) => id !== contactId) 
        : [...prev.contactIds, contactId]; 
      return { ...prev, contactIds: updatedContactIds };
    });
  };

  // Save a new group or update an existing one
  const handleSaveGroup = async () => {
    if (!groupForm.name) return alert('Group name is required.');

    try {
      if (editGroupId) {
        // Update the group details
        await axios.put(
          `/api/groups/${editGroupId}`,
          {
            name: groupForm.name,
            description: groupForm.description,
          },
          { withCredentials: true }
        );

        // Ensure contacts to remove (if any) are handled correctly
        const existingContactIds = groupForm.contactIds;
        const groupContactsResponse = await axios.get(`/api/groups/${editGroupId}/contacts`, { withCredentials: true });
        const groupContacts = groupContactsResponse.data;

        const contactsToRemove = groupContacts
          .filter(contact => !existingContactIds.includes(contact.id))
          .map(contact => contact.id); 

        if (contactsToRemove.length > 0) {
          await axios.delete(`/api/groups/${editGroupId}/contacts`, {
            data: { contactIds: contactsToRemove },
            withCredentials: true,
          });
        }

        // Add new selected contacts to the group
        const contactsToAdd = existingContactIds
          .filter(contactId => !groupContacts.some(contact => contact.id === contactId)); 

        if (contactsToAdd.length > 0) {
          await axios.post(
            `/api/groups/${editGroupId}/contacts`,
            { contactIds: contactsToAdd },
            { withCredentials: true }
          );
        }
      } else {
        // Create a new group if no `editGroupId`
        const response = await axios.post(
          '/api/groups',
          {
            name: groupForm.name,
            description: groupForm.description,
          },
          { withCredentials: true }
        );

        // Add selected contacts to the new group only if contactIds are not empty
        if (groupForm.contactIds.length > 0) {
          await axios.post(
            `/api/groups/${response.data.id}/contacts`,
            { contactIds: groupForm.contactIds },
            { withCredentials: true }
          );
        }
      }

      // Reset form and refresh groups
      setGroupForm({ name: '', description: '', contactIds: [] });
      setEditGroupId(null);
      closeModal();
      fetchGroups(); 
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  // Edit group handler
  const handleEditGroup = async (groupId) => {
    try {
      // Fetch group details
      const response = await axios.get(`/api/groups/${groupId}`, { withCredentials: true });
      const group = response.data;

      // Fetch contacts and pre-fill the modal form
      await openModal({
        id: group.id,
        name: group.name,
        description: group.description || '',
        contacts: group.contacts || [],
      });
    } catch (error) {
      console.error('Error fetching group details:', error);
    }
  };

  // Delete a group
  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`/api/groups/${groupId}`, { withCredentials: true });
      fetchGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  // Fetch the groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="groups-manager">
      <h2>Manage Groups</h2>
      <p>Create, edit, or remove groups and assign contacts to them.</p>

      
      <button onClick={() => openModal()} className='create-group-button'>Create Group</button>

      {/* Groups List */}
      <div className="groups-list">
        <table>
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Description</th>
              <th>Contacts</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.length > 0 ? (
              groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{group.description || 'No description'}</td>
                  <td>
                    {group.contacts && group.contacts.length > 0
                      ? group.contacts.map((c) => c.name).join(', ')
                      : 'No contacts'}
                  </td>
                  <td>
                    <button onClick={() => handleEditGroup(group.id)}>Edit</button>
                    <button onClick={() => handleDeleteGroup(group.id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>
                  No groups available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={editGroupId ? 'Edit Group' : 'Create Group'}
        ariaHideApp={false}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2>{editGroupId ? 'Edit Group' : 'Create Group'}</h2>
        <div className="group-form">
          {/* Group Name Input */}
          <input
            type="text"
            name="name"
            placeholder="Group Name"
            value={groupForm.name}
            onChange={handleInputChange}
          />

          {/* Group Description Input */}
          <input
            type="text"
            name="description"
            placeholder="Group Description"
            value={groupForm.description}
            onChange={handleInputChange}
          />

          {/* Contact Selection */}
          <div className="contact--selection">
            <p>Select Contacts:</p>
            {contacts && contacts.length > 0 ? (
              contacts.map((contact) => (
                <label key={contact.id} className='contact-label'>
                  <input
                    type="checkbox"
                    checked={groupForm.contactIds.includes(contact.id)}
                    onChange={() => handleContactSelection(contact.id)}
                    id='contact-checkbox'
                  />
                  {contact.name || 'Unknown Name'} {contact.email ? `(${contact.email})` : ''}
                </label>
              ))
            ) : (
              <p>No contacts available.</p>
            )}
          </div>


          {/* Save Button */}
          <button onClick={handleSaveGroup}>
            {editGroupId ? 'Update Group' : 'Create Group'}
          </button>

          {/* Cancel Button */}
          <button onClick={closeModal} className="cancel-button">
            Cancel
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default GroupsManager;

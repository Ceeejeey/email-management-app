import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig'; // Custom axios instance with credentials
import Cookies from 'js-cookie'; // Import js-cookie
import { jwtDecode } from 'jwt-decode'; // Import jwt-decode
import { toast } from 'react-toastify';  // Import React Toastify for notifications
import 'react-toastify/dist/ReactToastify.css';
import './TemplateManager.css';

const TemplateManager = ({ accessToken }) => {
  const [templates, setTemplates] = useState([]); // Store templates
  const [selectedFile, setSelectedFile] = useState(null); // Store uploaded file
  const [templateContent, setTemplateContent] = useState(''); // Template content for viewing/editing
  const [editTemplateId, setEditTemplateId] = useState(null); // Track template being edited
  const [templateName, setTemplateName] = useState(''); // Template name for new uploads or edits
  const [isSendModalOpen, setIsSendModalOpen] = useState(false); // Toggle modal visibility
  const [emailSubject, setEmailSubject] = useState(''); // Email subject for sending
  const [emailBody, setEmailBody] = useState(''); // Email body for sending
  const [recipients, setRecipients] = useState(''); // Recipients (comma-separated or group)
  const [userEmail, setUserEmail] = useState('');
  const [contacts, setContacts] = useState([]);
  const [userId, setUserId] = useState('');
  const [groups, setGroups] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);


  // Fetch templates on mount
  useEffect(() => {

    if (isSendModalOpen) {
      fetchContacts();
      fetchGroups();
    }
    const decodeToken = () => {
      try {
        // Retrieve the token from cookies
        const token = accessToken// Use the cookie name where the token is stored
        console.log('token:', token);
        if (token) {
          const decoded = jwtDecode(token); // Decode the token
          setUserEmail(decoded.email); // Set user email (adjust based on your token structure)
          setUserId(decoded.id); // Set user ID (adjust based on your token
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    decodeToken();
    fetchTemplates();
  }, [isSendModalOpen]);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts', { withCredentials: true });
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  // Fetch all groups
  const fetchGroups = async () => {
    try {
      const response = await axios.get('/api/groups', { withCredentials: true });
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };
  // Handle selection of individual contacts
  const toggleContactSelection = (contact) => {
    setSelectedRecipients((prev) =>
      prev.find((c) => c.email === contact.email)
        ? prev.filter((c) => c.email !== contact.email)
        : [...prev, contact]
    );
  };

  // Handle selection of groups
  const toggleGroupSelection = async (groupId) => {
    try {
      const response = await axios.get(`/api/groups/${groupId}/contacts`, { withCredentials: true });
      const groupContacts = response.data;

      setSelectedRecipients((prev) => {
        const emailsInGroup = groupContacts.map((c) => c.email);
        const alreadySelected = prev.some((c) => emailsInGroup.includes(c.email));

        return alreadySelected
          ? prev.filter((c) => !emailsInGroup.includes(c.email))
          : [...prev, ...groupContacts.filter((c) => !prev.some((p) => p.email === c.email))];
      });
    } catch (error) {
      console.error('Error fetching group contacts:', error);
    }
  };

  // Fetch all templates from the backend
  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/templates', { withCredentials: true });
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setTemplateName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTemplateContent(event.target.result);
    };
    reader.readAsText(file);
  };

  // Save a new template or update an existing one
  const handleSaveTemplate = async () => {
    if (!templateName || !templateContent) {
      alert('Template name and content are required!');
      return;
    }

    try {
      if (editTemplateId) {
        // Update an existing template
        await axios.put(`/api/templates/${editTemplateId}`, {
          name: templateName,
          content: templateContent,
        }, { withCredentials: true });
      } else {
        // Save a new template
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('name', templateName);
        formData.append('content', templateContent);

        await axios.post('/api/templates', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
      }

      // Reset form and refresh templates
      setSelectedFile(null);
      setTemplateName('');
      setTemplateContent('');
      setEditTemplateId(null);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  // Edit an existing template
  const handleEditTemplate = (template) => {
    setTemplateName(template.name);
    setTemplateContent(template.content);
    setEditTemplateId(template.id);
  };

  // Delete a template
  const handleDeleteTemplate = async (templateId) => {
    try {
      await axios.delete(`/api/templates/${templateId}`, { withCredentials: true });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  // Open "Send Template" modal
  const handleSendTemplate = (template) => {
    setEmailSubject(template.name); // Use template name as default subject
    setEmailBody(template.content); // Use template content as default body
    setIsSendModalOpen(true); // Show modal
  };

  // Handle email sending
  const handleSendEmail = async (recipients, subject, body) => {
    try {
      const response = await axios.post('/api/send-email', {
        recipients, 
        subject,
        body,
        userId
      }, { withCredentials: true });
  
      console.log('Email sent successfully:', response.data);
      
      // 🔹 Show success notification
      toast.success('  ✅ Email sent successfully!', { position: 'top-right' });
  
    } catch (error) {
      console.error('Error sending email:', error);
      
      // 🔹 Show error notification
      toast.error(' ❌ Failed to send email. Please try again.', { position: 'top-right' });
    }
  };
  
  return (
    <div className="template-manager">
      <h2>Template Manager</h2>
      <p>Upload, edit, view, or delete templates.</p>

      {/* Drag-and-Drop File Upload */}
      <div className="file-upload">
        <div
          className="upload-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            handleFileUpload({ target: { files: [file] } });
          }}
        >
          Drag & Drop your template file here or click to upload
        </div>
        <input type="file" accept=".txt,.docx" onChange={handleFileUpload} />
        <input
          type="text"
          placeholder="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
        />
      </div>

      {/* Template Editor */}
      <textarea
        placeholder="Template Content"
        value={templateContent}
        onChange={(e) => setTemplateContent(e.target.value)}
        rows="10"
      />

      <button onClick={handleSaveTemplate} id='saveButton'>
        {editTemplateId ? 'Update Template' : 'Save Template'}
      </button>

      {/* Templates Table */}
      <div className="template-list">
        <table>
          <thead>
            <tr>
              <th>Template Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.length > 0 ? (
              templates.map((template) => (
                <tr key={template.id}>
                  <td>{template.name}</td>
                  <td>
                    <button onClick={() => handleEditTemplate(template)} id='editButton'>Edit</button>
                    <button onClick={() => handleDeleteTemplate(template.id)} id='deleteButton'>Delete</button>
                    <button onClick={() => handleSendTemplate(template)} id='sendButton'>Send</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">No templates available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isSendModalOpen && (
        <div className="template-modal">
          <div className="modal-content">

            {/* Left Column: Email Content & Selected Recipients */}
            <div className="modal-left">
              <h3>Send Email</h3>

              {/* Subject */}
              <input
                type="text"
                placeholder="Email Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />

              {/* Email Body */}
              <textarea
                placeholder="Email Body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />

              {/* Selected Recipients */}
              <h4>Selected Recipients:</h4>
              <div className="selected-recipients">
                {selectedRecipients.map((contact) => (
                  <span key={contact.email} className="recipient-tag">
                    {contact.name} ({contact.email})
                  </span>
                ))}
              </div>
            </div>

            {/* Right Column: Contacts & Groups Selection */}
            <div className="modal-right">

              {/* Contacts Selection */}
              <h4>Select Contacts:</h4>
              <div className="contacts-list">
                {contacts.map((contact) => (
                  <label key={contact.id}>
                    <input
                      type="checkbox"
                      checked={selectedRecipients.some((c) => c.email === contact.email)}
                      onChange={() => toggleContactSelection(contact)}
                    />
                    {contact.name} ({contact.email})
                  </label>
                ))}
              </div>

              {/* Groups Selection */}
              <h4>Select Groups:</h4>
              <div className="groups-list">
                {groups.map((group) => (
                  <label key={group.id}>
                    <input type="checkbox" onChange={() => toggleGroupSelection(group.id)} />
                    {group.name}
                  </label>
                ))}
              </div>

              {/* Buttons (Bottom Right) */}
              <div className="modal-buttons">
                <button onClick={() => handleSendEmail(selectedRecipients.map((c) => c.email), emailSubject, emailBody)}>Send</button>
                <button onClick={() => setIsSendModalOpen(false)}>Cancel</button>
              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  );
};

export default TemplateManager;

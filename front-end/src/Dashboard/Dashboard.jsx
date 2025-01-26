import React, { useState, useEffect } from 'react';
import ContactsManager from '../Contacts/ContactsManager';
import GroupsManager from '../Contacts/GroupManager';
import TemplateManager from '../emailTemplates/TemplateManager';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('contacts');
  const [draggedFiles, setDraggedFiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [accessToken, setAccessToken] = useState('');
  const [userName, setUserName] = useState('John Doe'); // Example user name
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the token and user's name from localStorage
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user')); // Assuming user details are stored in localStorage
    console.log('token:', token);

    if (token) {
      setAccessToken(token);
    }

    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const handleLogout = () => {
    // Clear localStorage and navigate to the login page
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setDraggedFiles(files);
    setTemplates((prev) => [...prev, ...files.map((file) => file.name)]);
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <h1>Dashboard</h1>
        <div className="profile" onClick={toggleDropdown}>
          <img src="https://via.placeholder.com/40" alt="User Profile" />
          <span>{userName}</span>
          <div className={`dropdown ${showDropdown ? 'show' : ''}`}>
            <ul>
              <li onClick={() => navigate('/profile')}>Profile</li>
              <li onClick={handleLogout}>Logout</li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <ul>
            <li
              className={activeTab === 'contacts' ? 'active' : ''}
              onClick={() => setActiveTab('contacts')}
            >
              Manage Contacts
            </li>
            <li
              className={activeTab === 'groups' ? 'active' : ''}
              onClick={() => setActiveTab('groups')}
            >
              Manage Groups
            </li>
            <li
              className={activeTab === 'templates' ? 'active' : ''}
              onClick={() => setActiveTab('templates')}
            >
              Email Templates
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'contacts' && <ContactsManager />}

          {activeTab === 'groups' && (
            <div className="groups">
              <GroupsManager />
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="templates">
              <TemplateManager accessToken={accessToken} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

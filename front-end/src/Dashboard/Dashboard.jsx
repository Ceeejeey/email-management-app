import React, { useState, useEffect,useRef } from 'react';
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
  const [googleTokens, setGoogleTokens] = useState(null);
  const dropdownRef = useRef(null);

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
    if (user && user.googleTokens) {
      setGoogleTokens(user.googleTokens);
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }

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
        <div className="profile-container" ref={dropdownRef}>
          {/* Profile Info (Click to Toggle Dropdown) */}
          <div className="profile-card" onClick={toggleDropdown}>
           
            <span className="user-name">{userName || 'User'}</span>
          </div>

          {/* Dropdown Menu (Only Visible When Clicked) */}
          {showDropdown && (
            <div className="profile-dropdown">
              <ul>
                <li onClick={() => navigate('/profile')}>
                  <i className="fas fa-user"></i> Profile
                </li>
                <li onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </li>
                <li className="google-status">
                  {googleTokens ? (
                    <>
                      <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg"
                        alt="Google Connected" className="google-logo" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <span>Not Connected</span>
                  )}
                </li>
              </ul>
            </div>
          )}
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

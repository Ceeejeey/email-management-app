import React, { useState } from 'react';
import ContactsManager from '../Contacts/ContactsManager';
import './Dashboard.css';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('contacts');
    const [draggedFiles, setDraggedFiles] = useState([]);
    const [templates, setTemplates] = useState([]);

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
                <div className="profile">
                    <img src="https://via.placeholder.com/40" alt="User Profile" />
                    <span>John Doe</span>
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
                    {activeTab === 'contacts' && (
                        <>
                            <ContactsManager />
                        </>
                    )}



                    {activeTab === 'groups' && (
                        <div className="groups">
                            <h2>Manage Contact Groups</h2>
                            <p>Add, edit, or remove contact groups here.</p>
                            {/* Add form or table for managing groups */}
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div
                            className="templates"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <h2>Email Templates</h2>
                            <p>Drag and drop your email template files here:</p>
                            <div className="drop-zone">
                                <p>Drop files here or click to upload</p>
                            </div>
                            <ul className="template-list">
                                {templates.map((template, index) => (
                                    <li key={index}>{template}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

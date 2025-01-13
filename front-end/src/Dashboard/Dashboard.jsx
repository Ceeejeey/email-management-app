import React, { useState } from 'react';
import ContactsManager from '../Contacts/ContactsManager';
import GroupsManager from '../Contacts/GroupManager';
import TemplateManager from '../emailTemplates/TemplateManager'
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
                            <GroupsManager />
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="templates">
                            <TemplateManager />
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user details (replace with your API endpoint)
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get('/api/user/profile', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };
    fetchUserDetails();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        '/api/user/profile',
        { name: user.name, email: user.email, password },
        { withCredentials: true }
      );
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    }
  };

  const handleConnectGoogle = async () => {
    try {
      // Step 1: Get the Google Auth URL from your backend
      const response = await axios.get('/api/auth/google', { withCredentials: true }
        );
  
      if (response.data.authUrl) {
        // Redirect the user to the Google OAuth2 consent screen
        window.location.href = response.data.authUrl;
      } else {
        console.error('No authUrl provided in the response');
        setMessage('Failed to initiate Google account connection.');
      }
    } catch (error) {
      console.error('Error connecting Google account:', error);
      setMessage('Failed to connect Google account.');
    }
  };
  

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <form>
        <div className="form-group">
          <label className='profile-labels'>Name:</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            className='profile-input'
          />
        </div>
        <div className="form-group">
          <label className='profile-labels'>Email:</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            className='profile-input'
          />
        </div>
        <div className="form-group">
          <label className='profile-labels'>New Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='profile-input'
          />
        </div>
        <button type="button" onClick={handleSaveChanges} className="profile-button">
          Save Changes
        </button>
      </form>

      <hr />

      <div className="google-connect">
        <h2>Connect Google Account</h2>
        <button onClick={handleConnectGoogle}>Connect with Google</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default ProfilePage;

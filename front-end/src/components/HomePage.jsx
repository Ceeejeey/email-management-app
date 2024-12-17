import React from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container">
      <h1>Welcome Back!</h1>
      <p>Manage your contacts and templates with ease. Sign in or create an account to get started.</p>
      <div className="buttons">
        <button className="btn btn-signin" onClick={() => navigate('/signin')}>Sign In</button>
        <button className="btn btn-signup" onClick={() => navigate('/signup')}>
          Sign Up
        </button>
      </div>
      <footer>
        <p>&copy; 2024 YourBrand. All rights reserved. <a href="#">Privacy Policy</a></p>
      </footer>
    </div>
  );
};

export default HomePage;

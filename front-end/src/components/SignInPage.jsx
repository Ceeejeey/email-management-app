import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import './App.css';

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setMessage('');

    try {
      const response = await axios.post('http://localhost:3000/api/signin', { email, password }, {
        withCredentials: true,
      });

      const { accessToken, user } = response.data;
      console.log('data:', response.data);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      setMessage('Sign-in successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      console.error('Sign-in error:', error.response?.data || error.message);
      setMessage(
        error.response?.data?.message || 'Failed to sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignupRedirect = () => {
    navigate('/signup');
  };

  return (
    <div className="container">
      <h1>Sign In</h1>
      <form onSubmit={handleSignIn}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-signin" disabled={isLoading}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="forgot-password" onClick={handleForgotPassword}>
        Forgot your password?
      </p>

      <p className="signup-redirect">
        Don’t have an account?{' '}
        <span onClick={handleSignupRedirect} className="signup-link">
          Sign Up
        </span>
      </p>

      {message && <p className={`message ${isLoading ? 'loading' : ''}`}>{message}</p>}
    </div>
  );
};

export default SignInPage;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';

const VerifyEmail = () => {
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            const queryParams = new URLSearchParams(location.search);
            const token = queryParams.get('token');

            if (!token) {
                setMessage('Invalid or missing verification token.');
                return;
            }

            try {
                const response = await axios.post('/api/verify-email', { token });
                setMessage(response.data.message || 'Email verified successfully! You Will Redirect to Sign In Page in 3 seconds');

                setTimeout(() => {
                    navigate('/signin');
                }, 3000);
            } catch (error) {
                console.error('Error during email verification:', error.response?.data || error.message);
                setMessage(
                    error.response?.data?.message || 'Email verification failed. Please try again later.'
                );
            }
        };

        verifyEmail();
    }, [location, navigate]);

    return (
        <div className="container">
            <h1>Email Verification</h1>
            <p>{message}</p>
        </div>
    );
};

export default VerifyEmail;

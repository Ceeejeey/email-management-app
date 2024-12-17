import axios from 'axios';

// Create an instance of axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000', 
    timeout: 30000,                  
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;

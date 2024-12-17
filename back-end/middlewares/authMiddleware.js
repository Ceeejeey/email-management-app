const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
   
    const token = req.cookies.refreshToken;
    console.log('Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'No token found. Please sign in.' });
    }

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
          res.clearCookie('refreshToken');
          return res.status(401).json({ message: 'Invalid or expired token' });
      }
  
      req.userId = decoded.id; 
      req.user = decoded; 
      console.log('Decoded User:', req.user);
      next();
  });
};

module.exports = authenticateToken;

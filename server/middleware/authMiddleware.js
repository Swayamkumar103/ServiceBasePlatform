// middleware/authMiddleware.js
// Protects routes by verifying the JWT token sent with requests

import jwt from 'jsonwebtoken';
import User from '../module/User.js';

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here');

      // Attach user info to the request object for use in controllers
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
      }

      next(); // Move on to the actual route handler
    } catch (error) {
      res.status(401).json({ message: 'Token is invalid or expired. Please log in again.' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'No token provided. Please log in.' });
  }
};

export default protect;
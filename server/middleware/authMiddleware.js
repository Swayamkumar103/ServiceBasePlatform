// middleware/authMiddleware.js
// Protects routes by verifying the JWT token sent with requests

import jwt from 'jsonwebtoken';
import User from '../module/User.js';

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    return authHeader.split(' ')[1];
  }

  const cookieHeader = req.headers.cookie || '';
  const cookieToken = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('token='));

  if (!cookieToken) {
    return null;
  }

  return decodeURIComponent(cookieToken.split('=')[1]);
};

const protect = async (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    if (req.accepts('html')) {
      return res.redirect('/login');
    }

    return res.status(401).json({ message: 'No token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_here');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      if (req.accepts('html')) {
        return res.redirect('/login');
      }
      return res.status(401).json({ message: 'User no longer exists. Please log in again.' });
    }

    next();
  } catch (error) {
    if (req.accepts('html')) {
      return res.redirect('/login');
    }

    return res.status(401).json({ message: 'Token is invalid or expired. Please log in again.' });
  }
};

export default protect;
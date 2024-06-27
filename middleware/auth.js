// middleware/auth.js

import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const token = req.header('x-token');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('Token error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

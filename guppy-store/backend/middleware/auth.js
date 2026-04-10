const jwt  = require('jsonwebtoken');
const db   = require('../utils/supabase');
const { toDoc } = require('../utils/transform');

exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authenticated' });

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const { rows } = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [decoded.id]);
    if (!rows[0]) return res.status(401).json({ message: 'User not found' });

    req.user = toDoc(rows[0]);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  next();
};

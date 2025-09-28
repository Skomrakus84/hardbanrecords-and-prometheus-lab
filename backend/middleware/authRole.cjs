const jwt = require('jsonwebtoken');

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: 'Brak tokena.' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Brak tokena.' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ success: false, message: 'Brak uprawnień.' });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Nieprawidłowy token.' });
    }
  };
}

module.exports = authorizeRoles;
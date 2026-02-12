const jwt = require('jsonwebtoken');

// Middleware to verify if the user is logged in (Token check)
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    // We split "Bearer <token>" to get just the token string
    const verified = jwt.verify(token.split(" ")[1], 'SECRET_KEY'); 
    req.user = verified; // Adds user id and role to the request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

// Middleware to check specific roles (e.g., Admin only)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission." });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
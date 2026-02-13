const jwt = require('jsonwebtoken');

// Middleware to verify if the user is logged in (Token check)
const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  // Check if header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Access Denied. No valid token format provided." });
  }

  // Safely extract the token
  const token = authHeader.split(" ")[1];

  try {
    // Use the same secret key used in login (ideally from .env)
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY'); 
    req.user = verified; // Adds user id and role to the request
    next();
  } catch (err) {
    console.error("Token Verification Error:", err.message);
    res.status(400).json({ message: "Invalid or Expired Token" });
  }
};

// Middleware to check specific roles (e.g., Admin only)
const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: You do not have permission." });
    }
    next();
  };
};

module.exports = { verifyToken, authorizeRole };
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || "supersecret";

function authMiddleware(requiredRole) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ detail: "No token provided" });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ detail: "Invalid token format" });
    }

    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;

      // If a role is required, enforce it
      if (requiredRole && decoded.type !== requiredRole) {
        return res.status(403).json({ detail: "Access denied" });
      }

      next();
    } catch (err) {
      console.error("JWT error:", err);
      return res.status(401).json({ detail: "Invalid or expired token" });
    }
  };
}

module.exports = authMiddleware;

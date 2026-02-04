const jwt = require("jsonwebtoken");

/**
 * JWT Authentication Middleware
 * Verifies the JWT token from the Authorization header
 * and attaches the decoded user data to req.user
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Check if it's a Bearer token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Unauthorized: Invalid token format. Use 'Bearer <token>'" });
  }

  const token = parts[1];

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    } else {
      return res.status(403).json({ message: "Token verification failed" });
    }
  }
}

module.exports = authMiddleware;

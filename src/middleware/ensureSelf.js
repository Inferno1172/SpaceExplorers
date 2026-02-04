/**
 * @fileoverview Middleware to ensure the authenticated user is acting on their own resource
 * @module middleware/ensureSelf
 */

/**
 * Validates that the user_id in params matches the authenticated user's ID
 *
 * @function ensureSelf
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.user_id - User ID from URL
 * @param {Object} req.user - Authenticated user object (from authMiddleware)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
module.exports.ensureSelf = (req, res, next) => {
  const userIdParam = parseInt(req.params.user_id, 10);
  const authenticatedUserId = req.user.user_id;

  if (userIdParam !== authenticatedUserId) {
    return res.status(403).json({
      message: "Forbidden: You can only perform this action on your own account.",
    });
  }

  next();
};

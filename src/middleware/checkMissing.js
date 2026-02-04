/**
 * @fileoverview Middleware to validate required fields in request body
 * @module middleware/checkMissing
 */

/**
 * Creates middleware to ensure specified fields exist in req.body
 *
 * @function validateBody
 * @param {...string} requiredFields - Names of fields to validate
 * @returns {Function} Express middleware
 * @throws {400} Missing required data if fields missing or empty
 */
module.exports.validateBody = (...requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(
      (field) => req.body[field] === undefined || req.body[field] === ""
    );

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Missing required data.",
        missing_fields: missing,
      });
    }

    next();
  };
};
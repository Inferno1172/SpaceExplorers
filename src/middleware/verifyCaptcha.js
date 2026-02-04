/**
 * @fileoverview Middleware to verify Google reCAPTCHA tokens
 * @module middleware/verifyCaptcha
 * @requires axios
 */

const axios = require("axios");

/**
 * Verifies reCAPTCHA token to prevent bot abuse
 *
 * @function verifyCaptcha
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.captchaToken - Token from client
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {void} Calls next() if verification succeeds
 * @throws {400} CAPTCHA token missing or invalid
 * @throws {500} CAPTCHA verification fails due to server/API error
 */
module.exports.verifyCaptcha = (req, res, next) => {
  // Step 1: Dev mode bypass
  if (process.env.SKIP_CAPTCHA === "true") {
    console.log("CAPTCHA verification skipped (dev mode)");
    return next();
  }

  // Step 2: Get token from request
  const captchaToken = req.body.captchaToken;
  if (!captchaToken) {
    return res.status(400).json({ message: "CAPTCHA token missing." });
  }

  // Step 3: Prepare verification request
  const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
  const params = {
    secret: process.env.RECAPTCHA_SECRET_KEY,
    response: captchaToken,
  };

  // Step 4: Send verification request to Google
  axios
    .post(verifyURL, null, { params })
    .then((response) => {
      const data = response.data;

      // Step 5: Validate response
      if (!data.success) {
        return res.status(400).json({ message: "Invalid CAPTCHA." });
      }

      console.log("CAPTCHA verified.");
      next();
    })
    .catch((err) => {
      console.error("Error verifying CAPTCHA:", err);
      res.status(500).json({ message: "CAPTCHA verification failed." });
    });
};
/**
 * @fileoverview Middleware to validate spacecraft upgrade ownership
 * @module middleware/checkUpgradeOwnership
 * @requires ../models/spaceModel
 */

const model = require("../models/spaceModel");

/**
 * Ensures a user does not already own a spacecraft upgrade before purchase
 *
 * @function checkUpgradeOwnership
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {number} req.body.user_id - ID of the user attempting to purchase
 * @param {number} req.body.upgrade_id - ID of the upgrade to validate
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} Calls next() if validation passes
 * @throws {404} Upgrade not found
 * @throws {409} Upgrade already owned
 * @throws {500} Internal server error if database fails
 */
module.exports.checkUpgradeOwnership = (req, res, next) => {
  const user_id = req.user.user_id;
  const { upgrade_id } = req.body;

  // Step 1: Verify the upgrade exists
  model.getUpgradeById({ upgrade_id }, (err, upgradeResults) => {
    if (err) {
      console.error("Error fetching upgrade:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (!upgradeResults || upgradeResults.length === 0) {
      return res.status(404).json({ message: "Upgrade not found." });
    }

    const upgrade = upgradeResults[0];

    // Step 2: Check if user already owns the upgrade
    model.checkUpgradeOwnership({ user_id, upgrade_id }, (err, results) => {
      if (err) {
        console.error("Error checking upgrade ownership:", err);
        return res.status(500).json({ message: "Internal server error." });
      }

      if (results.length > 0) {
        return res
          .status(409)
          .json({ message: `Upgrade (${upgrade.name}) already owned.` });
      }

      // Step 3: Ownership valid, proceed
      next();
    });
  });
};
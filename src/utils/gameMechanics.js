// ==================================================
// CHECK IF USER CAN DISCOVER PLANET
// ==================================================
function canDiscoverPlanet(userPoints, planetFuelRequired) {
  // Return true if user has enough points (fuel) to discover the planet
  return userPoints >= planetFuelRequired;
}

// ==================================================
// GET NEXT UNDISCOVERED PLANET
// ==================================================
function getNextPlanet(userDiscoveredPlanets, allPlanets) {
  // Collect IDs of planets user has already discovered
  const discoveredIds = userDiscoveredPlanets.map((p) => p.planet_id);

  // Find the first planet not yet discovered
  return allPlanets.find((p) => !discoveredIds.includes(p.planet_id));
}

// ==================================================
// CALCULATE TOTAL POINTS MULTIPLIER FROM EQUIPPED UPGRADES
// ==================================================
function calculatePointsMultiplier(userUpgrades) {
  let totalMultiplier = 1;

  // Multiply all equipped upgrades that provide a points multiplier
  userUpgrades.forEach((upgrade) => {
    if (upgrade.is_equipped && upgrade.points_multiplier) {
      totalMultiplier *= upgrade.points_multiplier;
    }
  });

  return totalMultiplier;
}

// ==================================================
// APPLY MULTIPLIER TO BASE POINTS
// ==================================================
function awardPoints(basePoints, multiplier) {
  // Return floored value after applying multiplier
  return Math.floor(basePoints * multiplier);
}

module.exports = {
  canDiscoverPlanet,
  getNextPlanet,
  calculatePointsMultiplier,
  awardPoints,
};
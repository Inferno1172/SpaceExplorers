// API Configuration
const API_BASE_URL = "/api"; // Use relative path for better portability

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Add JWT token if it exists
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred");
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// API functions
const API = {
  // ======================
  // AUTH / USERS
  // ======================

  register: async (username, password, email, captchaToken) => {
    return apiRequest("/users/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        email: email || undefined,
        captchaToken,
      }),
    });
  },

  login: async (username, password) => {
    return apiRequest("/users/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });
  },

  forgotPassword: async (email) => {
    return apiRequest("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiRequest(`/users/reset-password?token=${token}`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    });
  },

  getLeaderboard: async () => {
    return apiRequest("/users/leaderboard", {
      method: "GET",
    });
  },

  getAllUsers: async () => {
    return apiRequest("/users", {
      method: "GET",
    });
  },

  getUserById: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: "GET",
    });
  },

  updateUserById: async (userId, username, points) => {
    return apiRequest(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({
        username,
        points,
      }),
    });
  },

  // ======================
  // CHALLENGES
  // ======================

  // Create new challenge
  newChallenge: async (userId, description, points) => {
    return apiRequest("/challenges", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        description,
        points,
      }),
    });
  },

  // Get all challenges
  getAllChallenges: async () => {
    return apiRequest("/challenges", {
      method: "GET",
    });
  },

  // Update challenge by ID
  updateChallengeById: async (userId, challengeId, description, points) => {
    return apiRequest(`/challenges/${challengeId}`, {
      method: "PUT",
      body: JSON.stringify({
        user_id: userId,
        description,
        points,
      }),
    });
  },

  // Delete challenge by ID
  deleteChallengeById: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}`, {
      method: "DELETE",
    });
  },

  // ======================
  // COMPLETIONS
  // ======================

  // Create new completion
  newCompletion: async (userId, challengeId, details) => {
    return apiRequest(`/challenges/${challengeId}`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        details,
      }),
    });
  },

  // Get all completions for a challenge
  getAllCompletions: async (challengeId) => {
    return apiRequest(`/challenges/${challengeId}`, {
      method: "GET",
    });
  },

  // ======================
  // SPACE
  // ======================

  // Get a user's space journey/progress
  getUserJourney: async (user) => {
    return apiRequest(`/space/journey/${user.user_id}`, {
      method: "GET",
    });
  },

  // Discover a new planet
  newPlanet: async (userId, planetId) => {
    return apiRequest("/space/discover", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        planet_id: planetId,
      }),
    });
  },

  // Get shop
  getShop: async () => {
    return apiRequest("/space/shop", {
      method: "GET",
    });
  },

  // Purchase an upgrade
  newUpgrade: async (userId, upgradeId) => {
    return apiRequest("/space/purchase", {
      method: "POST",
      body: JSON.stringify({
        user_id: userId,
        upgrade_id: upgradeId,
      }),
    });
  },

  // Get a user's spacecraft
  getSpacecraft: async (userId) => {
    return apiRequest(`/space/spacecraft/${userId}`, {
      method: "GET",
    });
  },

  // Toggle a spacecraft upgrade
  toggleUpgrade: async (userId, upgradeId, isEquipped) => {
    return apiRequest("/space/spacecraft/toggle", {
      method: "PUT",
      body: JSON.stringify({
        user_id: userId,
        upgrade_id: upgradeId,
        is_equipped: isEquipped,
      }),
    });
  },

  // Get user achievements
  getAchievements: async (userId) => {
    return apiRequest(`/space/achievements/${userId}`, {
      method: "GET",
    });
  },
};
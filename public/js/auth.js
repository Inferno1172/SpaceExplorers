// Authentication handler for login and register pages

// Helper functions
function showError(message) {
  const errorMsg = document.getElementById("errorMsg");
  const successMsg = document.getElementById("successMsg");
  
  if (errorMsg) {
    errorMsg.textContent = message;
  }
  if (successMsg) {
    successMsg.textContent = ""; // Clear success message
  }
}

function showSuccess(message) {
  const successMsg = document.getElementById("successMsg");
  const errorMsg = document.getElementById("errorMsg");
  
  if (successMsg) {
    successMsg.textContent = message;
  }
  if (errorMsg) {
    errorMsg.textContent = ""; // Clear error message
  }
}

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = "Loading..."; // simplified, no custom spinner
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText;
  }
}

// Handle Login Form
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("loginBtn");

    if (!username || !password) {
      showError("Please fill in all fields");
      return;
    }

    try {
      setButtonLoading(loginBtn, true);

      const response = await API.login(username, password);

      if (response.token) localStorage.setItem("token", response.token);
      if (response.user)
        localStorage.setItem("user", JSON.stringify(response.user));

      showSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } catch (error) {
      showError(
        error.message || "Login failed. Please check your credentials."
      );
      setButtonLoading(loginBtn, false);
    }
  });
}

// Handle Register Form
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const registerBtn = document.getElementById("registerBtn");

    if (!username || !password) {
      showError("Username and password are required");
      return;
    }

    let captchaToken = "";
    if (typeof grecaptcha !== "undefined") {
      captchaToken = grecaptcha.getResponse();
      if (!captchaToken) {
        showError("Please complete the CAPTCHA");
        return;
      }
    }

    try {
      setButtonLoading(registerBtn, true);

      const response = await API.register(
        username,
        password,
        email,
        captchaToken
      );

      showSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } catch (error) {
      showError(error.message || "Registration failed. Please try again.");
      setButtonLoading(registerBtn, false);

      if (typeof grecaptcha !== "undefined") {
        grecaptcha.reset();
      }
    }
  });
}

// Handle Forgot Password Form
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const forgotBtn = document.getElementById("forgotBtn");

    if (!email) {
      showError("Please enter your email");
      return;
    }

    try {
      setButtonLoading(forgotBtn, true);

      const response = await API.forgotPassword(email);

      showSuccess(response.message || "If that email exists, a reset link has been sent.");
      forgotPasswordForm.reset();
      
    } catch (error) {
      showError(error.message || "Request failed. Please try again.");
    } finally {
        setButtonLoading(forgotBtn, false);
    }
  });
}

// Handle Reset Password Form
const resetPasswordForm = document.getElementById("resetPasswordForm");
if (resetPasswordForm) {
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const resetBtn = document.getElementById("resetBtn");

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      showError("Invalid or missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      showError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    try {
      setButtonLoading(resetBtn, true);

      const response = await API.resetPassword(token, newPassword);

      showSuccess("Password reset successful! Redirecting to login...");

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } catch (error) {
      showError(error.message || "Reset failed. valid or expired token.");
      setButtonLoading(resetBtn, false);
    }
  });
}

// Redirect logged-in users away from auth pages
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const currentPage = window.location.pathname;

  if (
    token &&
    (currentPage.includes("login.html") ||
      currentPage.includes("register.html"))
  ) {
    window.location.href = "index.html";
  }
});
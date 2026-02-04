/* ===================================
   ENHANCED NAVBAR FUNCTIONALITY
   JavaScript for navigation behavior and interactions
   =================================== */


/* ===================================
   INITIALIZATION
   =================================== */


// Enhanced navbar functionality
document.addEventListener("DOMContentLoaded", () => {
    // Get DOM elements
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelectorAll(".nav-link");
    const mobileNavLinks = document.querySelectorAll(".offcanvas-body .nav-link");
    const offcanvas = document.getElementById("mobileMenu");
    const bootstrap = window.bootstrap; // Declare the bootstrap variable


    /* ===================================
       DESKTOP NAVIGATION LINK HANDLING
       =================================== */


    // Active link management for desktop navigation
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
           
            // Only prevent default for internal links (like #sections or Get Started)
            if (href === "#" || href.startsWith("#")) {
                e.preventDefault();
               
                // Remove active class from all links
                navLinks.forEach((l) => l.classList.remove("active"));
               
                // Add active class to clicked link
                this.classList.add("active");
               
                // Handle section navigation if needed
                const section = this.getAttribute("data-section");
                if (section) {
                    console.log(`Navigating to ${section} section`);
                    // Add your smooth scroll logic here
                }
            }
            // For external links (like about.html), let the default behavior happen
        });
    });


    /* ===================================
       MOBILE NAVIGATION LINK HANDLING
       =================================== */


    // Active link management for mobile navigation
    mobileNavLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
           
            // Only prevent default for internal links
            if (href === "#" || href.startsWith("#")) {
                e.preventDefault();
               
                // Remove active class from all mobile links
                mobileNavLinks.forEach((l) => l.classList.remove("active"));
               
                // Add active class to clicked link
                this.classList.add("active");
               
                // Handle section navigation if needed
                const section = this.getAttribute("data-section");
                if (section) {
                    console.log(`Navigating to ${section} section`);
                    // Add your smooth scroll logic here
                }
            }
           
            // Always close offcanvas for mobile (even for external links)
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        });
    });


    /* ===================================
       RIPPLE EFFECT FUNCTIONALITY
       =================================== */


    /**
     * Create ripple effect on button click
     * @param {Event} event - Click event object
     */
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;


        // Set ripple circle properties
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add("ripple");


        // Remove existing ripple if present
        const ripple = button.getElementsByClassName("ripple")[0];
        if (ripple) {
            ripple.remove();
        }


        // Add new ripple
        button.appendChild(circle);
    }


    /* ===================================
       DYNAMIC STYLE INJECTION
       =================================== */


    // Add ripple effect styles dynamically
    const style = document.createElement("style");
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 600ms linear;
            background-color: rgba(255, 255, 255, 0.6);
        }
       
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);


    /* ===================================
       APPLY RIPPLE EFFECTS
       =================================== */


    // Apply ripple effect to all navigation links
    [...navLinks, ...mobileNavLinks].forEach((link) => {
        link.addEventListener("click", createRipple);
        link.style.position = "relative";
        link.style.overflow = "hidden";
    });


    /* ===================================
       KEYBOARD NAVIGATION SUPPORT
       =================================== */


    // Handle keyboard navigation
    document.addEventListener("keydown", (e) => {
        // Close mobile menu on Escape key
        if (e.key === "Escape") {
            const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
            if (bsOffcanvas) {
                bsOffcanvas.hide();
            }
        }
    });


    /* ===================================
       INTERSECTION OBSERVER SETUP
       =================================== */


    // Intersection Observer for active link highlighting (if you have sections)
    const observerOptions = {
        threshold: 0.6,
        rootMargin: "-20% 0px -20% 0px",
    };


    // Note: Observer implementation would go here if sections exist
    // This is set up for future section-based navigation


    /* ===================================
       AUTHENTICATION UI MANAGEMENT
       =================================== */

    /**
     * Decode JWT token without verification (client-side)
     * @param {string} token 
     * @returns {Object|null} payload
     */
    function decodeToken(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
        }
    }

    /**
     * Updates the navbar based on authentication state
     */
    window.updateAuthUI = async function() {
        const token = localStorage.getItem('token');
        const loginNav = document.getElementById('loginNav');
        const registerNav = document.getElementById('registerNav');
        const userNav = document.getElementById('userNav');
        const logoutNav = document.getElementById('logoutNav');
        const navUsername = document.getElementById('navUsername');
        const navPoints = document.getElementById('navPoints');

        const mobileLoginNav = document.getElementById('mobileLoginNav');
        const mobileRegisterNav = document.getElementById('mobileRegisterNav');
        const mobileUserNav = document.getElementById('mobileUserNav');
        const mobileLogoutNav = document.getElementById('mobileLogoutNav');
        const mobileNavUsername = document.getElementById('mobileNavUsername');
        const mobileNavPoints = document.getElementById('mobileNavPoints');

        if (!token) {
            if (loginNav) loginNav.classList.remove('d-none');
            if (registerNav) registerNav.classList.remove('d-none');
            if (userNav) userNav.classList.add('d-none');
            if (logoutNav) logoutNav.classList.add('d-none');

            if (mobileLoginNav) mobileLoginNav.classList.remove('d-none');
            if (mobileRegisterNav) mobileRegisterNav.classList.remove('d-none');
            if (mobileUserNav) mobileUserNav.classList.add('d-none');
            if (mobileLogoutNav) mobileLogoutNav.classList.add('d-none');
            return;
        }

        const payload = decodeToken(token);
        if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
            localStorage.removeItem('token');
            if (loginNav) loginNav.classList.remove('d-none');
            if (registerNav) registerNav.classList.remove('d-none');
            if (userNav) userNav.classList.add('d-none');
            if (logoutNav) logoutNav.classList.add('d-none');

            if (mobileLoginNav) mobileLoginNav.classList.remove('d-none');
            if (mobileRegisterNav) mobileRegisterNav.classList.remove('d-none');
            if (mobileUserNav) mobileUserNav.classList.add('d-none');
            if (mobileLogoutNav) mobileLogoutNav.classList.add('d-none');
            return;
        }

        // Token is valid, show user info and logout
        if (loginNav) loginNav.classList.add('d-none');
        if (registerNav) registerNav.classList.add('d-none');
        if (userNav) userNav.classList.remove('d-none');
        if (logoutNav) logoutNav.classList.remove('d-none');
        if (navUsername) navUsername.textContent = payload.username;

        if (mobileLoginNav) mobileLoginNav.classList.add('d-none');
        if (mobileRegisterNav) mobileRegisterNav.classList.add('d-none');
        if (mobileUserNav) mobileUserNav.classList.remove('d-none');
        if (mobileLogoutNav) mobileLogoutNav.classList.remove('d-none');
        if (mobileNavUsername) mobileNavUsername.textContent = payload.username;

        // Fetch latest points
        try {
            const response = await fetch(`/api/users/${payload.user_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                if (navPoints) navPoints.textContent = userData.points || 0;
                if (mobileNavPoints) mobileNavPoints.textContent = userData.points || 0;
            }
        } catch (error) {
            console.error('Failed to fetch user points:', error);
        }
    }

    // Handle Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        });
    }

    // Initialize Auth UI
    updateAuthUI();
});


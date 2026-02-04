/**
 * @fileoverview Logic for Planet Discovery page
 */

let currentUser = null;
let authToken = null;

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await loadDiscoveryData();
});

function checkAuth() {
    authToken = localStorage.getItem('token');
    if (authToken) {
        try {
            currentUser = JSON.parse(atob(authToken.split('.')[1]));
        } catch (e) {
            console.error('Failed to decode token');
            authToken = null;
        }
    }
}

async function loadDiscoveryData() {
    if (!currentUser) {
        showLoginRequired();
        return;
    }

    try {
        const response = await fetch(`/api/space/journey/${currentUser.user_id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Failed to load journey');

        const data = await response.json();
        renderDiscovery(data);
    } catch (error) {
        console.error('Error loading discovery data:', error);
        showError('Analysis systems offline. Please try again later.');
    }
}

function renderDiscovery(data) {
    const fuelElement = document.getElementById('currentFuel');
    if (fuelElement) fuelElement.textContent = data.user.fuel;

    renderNextPlanet(data.next_planet, data.can_discover_next, data.user.fuel);
    renderDiscoveredPlanets(data.discoveredPlanets);
}

function renderNextPlanet(planet, canDiscover, currentFuel) {
    const container = document.getElementById('nextPlanetContainer');
    if (!container) return;

    if (!planet) {
        container.innerHTML = `
            <div class="planet-card text-center p-5">
                <i class="bi bi-stars planet-icon mb-4" style="color: gold; font-size: 4rem;"></i>
                <h2 class="text-white mb-2">All Systems Charted</h2>
                <p class="opacity-75">You have discovered all currently known planets. Check back later for new coordinates.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="next-planet-hero">
            <div class="hero-visual">
                <div class="planet-glow"></div>
                <!-- Using a specific planet icon based on planet ID style or generic -->
                <i class="fa-solid fa-planet-ringed planet-icon"></i>
            </div>
            
            <div class="hero-content">
                <div class="mission-tag"><i class="bi bi-crosshair me-2"></i> Current Objective</div>
                <h2>${planet.name}</h2>
                <p class="description">${planet.description}</p>
                
                <div class="stats-grid">
                    <div class="stat-box">
                        <span class="label">Fuel Required</span>
                        <div class="value fuel-cost"><i class="bi bi-fuel-pump-fill me-2"></i>${planet.fuel_required}</div>
                    </div>
                    <div class="stat-box">
                        <span class="label">Discovery Reward</span>
                        <div class="value reward"><i class="bi bi-trophy-fill me-2"></i>+${planet.discovery_reward} pts</div>
                    </div>
                </div>

                <div class="action-area">
                    <button class="btn-discover" id="discoverBtn" 
                        ${!canDiscover ? 'disabled' : ''} 
                        onclick="handleDiscovery(${planet.planet_id})">
                        ${canDiscover ? 'Initiate Hyperdrive' : 'Insufficient Fuel'}
                        <i class="bi ${canDiscover ? 'bi-rocket-takeoff-fill' : 'bi-slash-circle'}" ></i>
                    </button>
                    
                    ${!canDiscover ? `
                        <div class="requirement-warning">
                            <i class="bi bi-exclamation-triangle-fill"></i>
                            <span>You need ${planet.fuel_required - currentFuel} more points to reach this planet.</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function renderDiscoveredPlanets(planets) {
    const container = document.getElementById('discoveredPlanetsList');
    if (!container) return;

    if (!planets || planets.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5 opacity-50">
                    <i class="bi bi-search fs-1 mb-3 d-block"></i>
                    <p>No systems charted yet. Start your journey above!</p>
                </div>
            </div>`;
        return;
    }

    container.innerHTML = planets.map(p => `
        <div class="col">
            <div class="planet-card">
                <div class="card-header-visual">
                    <i class="fa-solid fa-planet-moon card-icon"></i>
                    <div class="discovered-badge">
                        <i class="bi bi-check-lg"></i> Charted
                    </div>
                </div>
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <div class="discovery-meta">
                    <i class="bi bi-calendar-check"></i>
                    Discovered on ${new Date(p.discovered_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })}
                </div>
            </div>
        </div>
    `).join('');
}

async function handleDiscovery(planetId) {
    const btn = document.getElementById('discoverBtn');
    if (btn) btn.disabled = true;

    try {
        const response = await fetch('/api/space/discover', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ planet_id: planetId })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Discovery failed');
        }

        const result = await response.json();
        
        // Success!
        alert(`Success! You have discovered ${result.planet.name}. Reward points added!`);
        
        // Refresh UI
        if (window.updateAuthUI) await window.updateAuthUI();
        await loadDiscoveryData();

    } catch (error) {
        alert(error.message);
        if (btn) btn.disabled = false;
    }
}

function showLoginRequired() {
    // Hide fuel indicator when not logged in
    const fuelIndicator = document.getElementById('fuelIndicator');
    if (fuelIndicator) {
        fuelIndicator.style.display = 'none';
    }

    // Hide discovered systems section when not logged in
    const discoveredSection = document.querySelector('.my-5');
    if (discoveredSection) {
        discoveredSection.style.display = 'none';
    }

    const container = document.getElementById('nextPlanetContainer');
    if (container) {
        container.innerHTML = `
            <div class="planet-card text-center p-5 layer-flat">
                <i class="bi bi-lock-fill planet-icon mb-4"></i>
                <h2>Authorization Required</h2>
                <p class="opacity-75">You must be logged in to access navigation systems.</p>
                <a href="login.html" class="btn btn-outline-warning mt-3">Login to Proceed</a>
            </div>
        `;
    }
}

function showError(msg) {
    const container = document.getElementById('nextPlanetContainer');
    if (container) {
        container.innerHTML = `<div class="alert alert-danger">${msg}</div>`;
    }
}

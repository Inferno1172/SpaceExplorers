/**
 * @fileoverview Logic for Spacecraft Shop page
 */

let currentUser = null;
let authToken = null;
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async function() {
    checkAuth();
    
    // Hide stats card immediately if not logged in
    if (!currentUser) {
        const statsCard = document.querySelector('.stats-card');
        if (statsCard) statsCard.classList.add('d-none');
    }
    
    setupFilters();
    await loadShopData();
});

function checkAuth() {
    authToken = localStorage.getItem('token');
    if (authToken) {
        try {
            currentUser = JSON.parse(atob(authToken.split('.')[1]));
        } catch (e) {
            authToken = null;
        }
    }
}

function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(function(btn) {
        btn.addEventListener('click', async function() {
            btns.forEach(function(b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            await loadShopData();
        });
    });
}

async function loadShopData() {
    const container = document.getElementById('shopList');
    if (!container) return;

    // If not logged in, show login required message
    if (!currentUser) {
        showLoginRequired();
        return;
    }

    try {
        const query = new URLSearchParams();
        if (currentUser) query.set('user_id', currentUser.user_id);
        if (currentCategory !== 'all') query.set('category', currentCategory);

        const response = await fetch(`/api/space/shop?${query.toString()}`, {
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });

        if (!response.ok) throw new Error('Failed to load shop items');

        const items = await response.json();
        
        // Also fetch spacecraft data if logged in to get multiplier and equipped status
        if (currentUser) {
            const shipResp = await fetch(`/api/space/spacecraft/${currentUser.user_id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (shipResp.ok) {
                const shipData = await shipResp.json();
                renderStats(shipData);
                renderShop(items, shipData);
                return;
            }
        }
        
        renderStats(null);
        renderShop(items, null);

    } catch (error) {
        console.error('Shop error:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading shop.</div>';
    }
}

function renderStats(data) {
    const mult = document.getElementById('pointsMultiplier');
    const statsCard = document.querySelector('.stats-card');
    
    if (data) {
        if (mult) mult.textContent = data.points_multiplier;
        if (statsCard) statsCard.classList.remove('d-none');
    } else {
        if (statsCard) statsCard.classList.add('d-none');
    }
}

function renderShop(items, shipData) {
    const container = document.getElementById('shopList');
    container.innerHTML = '';
    
    // Show filter tabs and shop list when logged in
    const filterTabs = document.querySelector('.filter-tabs');
    if (filterTabs) filterTabs.style.display = 'flex';
    
    if (container) container.style.display = 'flex';
    
    // Clear auth container
    const authContainer = document.getElementById('authContainer');
    if (authContainer) authContainer.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 opacity-50">No upgrades available in this category.</div>';
        return;
    }

    const equippedIds = shipData ? shipData.upgrades : {};
    // Extract actual equipped IDs flattened
    const equippedUpgradeIds = shipData ? 
        Object.values(shipData.upgrades).flat().filter(function(u) { return u.is_equipped; }).map(function(u) { return u.upgrade_id; }) 
        : [];

    container.innerHTML = items.map(function(item) {
        const isOwned = item.is_owned;
        const isLocked = item.is_locked;
        const isEquipped = equippedUpgradeIds.includes(item.upgrade_id);

        return `
            <div class="col">
                <div class="upgrade-card ${isLocked ? 'locked' : ''}">
                    <span class="category-tag"><i class="bi bi-tag-fill me-1"></i>${item.category}</span>
                    <h3 class="upgrade-name">${item.name}</h3>
                    <div class="upgrade-benefit"><i class="bi bi-graph-up-arrow me-1"></i> +${((item.points_multiplier - 1) * 100).toFixed(0)}% Bonus</div>
                    <p class="upgrade-description">${item.description}</p>
                    
                    <div class="upgrade-price">
                        ${isOwned ? 
                            '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i> Owned</span>' : 
                            `<i class="fas fa-gas-pump"></i>  ${item.price} pts`
                        }
                    </div>

                    ${renderActionButton(item, isOwned, isLocked, isEquipped)}
                </div>
            </div>
        `;
    }).join('');
}



function renderActionButton(item, isOwned, isLocked, isEquipped) {
    if (!currentUser) {
        return `<a href="login.html" class="btn btn-purchase mt-3">Login to Purchase</a>`;
    }

    if (isLocked) {
        return `
            <div class="lock-overlay">
                <i class="bi bi-lock-fill lock-icon"></i>
                <span class="small">Required: Discovery of ${item.unlock_requirement} planets</span>
            </div>
        `;
    }

    if (isOwned) {
        return `
            <button class="btn btn-equip ${isEquipped ? 'active' : ''}" onclick="toggleEquip(${item.upgrade_id}, ${isEquipped})">
                <i class="bi ${isEquipped ? 'bi-toggle-on' : 'bi-toggle-off'} me-2"></i>
                ${isEquipped ? 'Equipped' : 'Equip Item'}
            </button>
        `;
    }

    return `
        <button class="btn btn-purchase" onclick="purchaseUpgrade(${item.upgrade_id})">
            <i class="bi bi-cart-plus-fill me-2"></i>Purchase Upgrade
        </button>
    `;
}

async function purchaseUpgrade(upgradeId) {
    if (!confirm('Confirm purchase? Points will be deducted from your account.')) return;

    try {
        const response = await fetch('/api/space/shop/purchase', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ upgrade_id: upgradeId })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Purchase failed');
        }

        alert('Upgrade purchased successfully!');
        if (window.updateAuthUI) await window.updateAuthUI();
        await loadShopData();

    } catch (error) {
        alert(error.message);
    }
}

async function toggleEquip(upgradeId, currentlyEquipped) {
    try {
        const response = await fetch('/api/space/spacecraft/toggle', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                upgrade_id: upgradeId,
                is_equipped: !currentlyEquipped
            })
        });

        if (!response.ok) throw new Error('Toggle failed');
        
        await loadShopData();

    } catch (error) {
        alert(error.message);
    }
}

function showLoginRequired() {
    // Hide filter tabs when not logged in
    const filterTabs = document.querySelector('.filter-tabs');
    if (filterTabs) filterTabs.style.display = 'none';

    // Hide shop grid
    const shopList = document.getElementById('shopList');
    if (shopList) shopList.style.display = 'none';

    const container = document.getElementById('authContainer');
    if (container) {
        container.innerHTML = `
            <div class="planet-card text-center p-5 layer-flat">
                <i class="bi bi-lock-fill planet-icon mb-4"></i>
                <h2>Authorization Required</h2>
                <p class="opacity-75">You must be logged in to access the spacecraft shop.</p>
                <a href="login.html" class="btn btn-outline-warning mt-3">Login to Proceed</a>
            </div>
        `;
    }
}

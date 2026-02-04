/**
 * @fileoverview Logic for Spacecraft Shop page
 */

let currentUser = null;
let authToken = null;
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
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
    btns.forEach(btn => {
        btn.addEventListener('click', async () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            await loadShopData();
        });
    });
}

async function loadShopData() {
    const container = document.getElementById('shopList');
    if (!container) return;

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
        
        renderShop(items, null);

    } catch (error) {
        console.error('Shop error:', error);
        container.innerHTML = '<div class="col-12 text-center text-danger">Error loading shop.</div>';
    }
}

function renderStats(data) {
    const mult = document.getElementById('pointsMultiplier');
    if (mult) mult.textContent = data.points_multiplier;
}

function renderShop(items, shipData) {
    const container = document.getElementById('shopList');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<div class="col-12 text-center py-5 opacity-50">No upgrades available in this category.</div>';
        return;
    }

    const equippedIds = shipData ? shipData.upgrades : {};
    // Extract actual equipped IDs flattened
    const equippedUpgradeIds = shipData ? 
        Object.values(shipData.upgrades).flat().filter(u => u.is_equipped).map(u => u.upgrade_id) 
        : [];

    container.innerHTML = items.map(item => {
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
                            `<i class="bi bi-coin me-1"></i> ${item.price} pts`
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

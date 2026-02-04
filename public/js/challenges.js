// ============================================
// GLOBAL STATE
// ============================================
let currentUser = null;
let authToken = null;
let editModal = null;
let attemptsModal = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Auth Data
    await checkAuthentication();
    
    // Initialize Bootstrap Modals
    const editModalEl = document.getElementById('editChallengeModal');
    if (editModalEl) editModal = new bootstrap.Modal(editModalEl);
    
    const attemptsModalEl = document.getElementById('attemptsModal');
    if (attemptsModalEl) attemptsModal = new bootstrap.Modal(attemptsModalEl);

    // Initial load of content
    await loadChallenges();

    // Setup Global Event Listeners
    setupEventListeners();
});

// ============================================
// AUTHENTICATION
// ============================================
async function checkAuthentication() {
    authToken = localStorage.getItem('token');
    if (authToken) {
        try {
            currentUser = JSON.parse(atob(authToken.split('.')[1]));
            document.getElementById('createChallengeSection')?.classList.remove('d-none');
        } catch (e) {
            console.error('Failed to decode token');
            authToken = null;
            currentUser = null;
        }
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    const createForm = document.getElementById('createChallengeForm');
    if (createForm) {
        createForm.addEventListener('submit', handleCreateChallenge);
    }

    const saveEditBtn = document.getElementById('saveEditBtn');
    if (saveEditBtn) {
        saveEditBtn.addEventListener('click', handleUpdateChallenge);
    }
}

// ============================================
// CHALLENGE OPERATIONS
// ============================================

async function loadChallenges() {
    const list = document.getElementById('challengesList');
    if (!list) return;

    try {
        const response = await fetch('/api/challenges');
        if (!response.ok) throw new Error('Failed to load challenges');
        
        const challenges = await response.json();
        renderChallenges(challenges);
    } catch (error) {
        console.error('Error loading challenges:', error);
        list.innerHTML = '<div class="alert alert-danger">Failed to load challenges. Please try again later.</div>';
    }
}

function renderChallenges(challenges) {
    const list = document.getElementById('challengesList');
    if (!list) return;

    if (challenges.length === 0) {
        list.innerHTML = '<div class="text-center py-5 opacity-50">No wellness challenges available yet.</div>';
        return;
    }

    list.innerHTML = challenges.map(c => {
        const isOwner = currentUser && c.creator_id === currentUser.user_id;
        
        return `
            <div class="challenge-card">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h3 class="challenge-title">${c.description}</h3>
                    <div class="challenge-points">+${c.points} pts</div>
                </div>
                
                <div class="challenge-meta">
                    <span class="meta-item">
                        <i class="bi bi-people-fill"></i> ${c.total_completions || 0} completions
                    </span>
                    <span class="meta-item">
                        <i class="bi bi-person-fill"></i> Creator ID: ${c.creator_id}
                    </span>
                </div>

                <div class="challenge-actions mt-4 gap-2 d-flex flex-wrap">
                    ${authToken ? `
                        <button class="btn btn-secondary" onclick="handleStartCompletion(${c.challenge_id})">
                            <i class="bi bi-check2-circle me-1"></i> Complete
                        </button>
                        <button class="btn btn-outline-warning" onclick="viewMyAttempts(${c.challenge_id})">
                            <i class="bi bi-clock-history me-1"></i> My Attempts
                        </button>
                    ` : `
                        <a href="login.html" class="btn btn-outline-secondary">Login to Participate</a>
                    `}

                    ${isOwner ? `
                        <button class="btn btn-outline-info" onclick='openEditModal(${JSON.stringify(c).replace(/'/g, "&apos;")})'>
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="handleDeleteChallenge(${c.challenge_id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function handleCreateChallenge(e) {
    e.preventDefault();
    if (!authToken) return;

    const description = document.getElementById('challengeDescription').value;
    const points = parseInt(document.getElementById('challengePoints').value);

    // Validate points
    if (points > 50) {
        alert("Points cannot exceed 50.");
        return;
    }

    try {
        const response = await fetch('/api/challenges', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, points })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create challenge');
        }

        e.target.reset();
        await loadChallenges();
        alert('Challenge created successfully!');
    } catch (error) {
        alert(error.message);
    }
}

function openEditModal(challenge) {
    if (!editModal) return;
    document.getElementById('editChallengeId').value = challenge.challenge_id;
    document.getElementById('editChallengeDescription').value = challenge.description;
    document.getElementById('editChallengePoints').value = challenge.points;
    editModal.show();
}

async function handleUpdateChallenge() {
    if (!authToken) return;

    const id = document.getElementById('editChallengeId').value;
    const description = document.getElementById('editChallengeDescription').value;
    const points = parseInt(document.getElementById('editChallengePoints').value);

    if (points > 50) {
        alert("Points cannot exceed 50.");
        return;
    }

    try {
        const response = await fetch(`/api/challenges/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ description, points })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Update failed');
        }

        if (editModal) editModal.hide();
        await loadChallenges();
    } catch (error) {
        alert(error.message);
    }
}

async function handleDeleteChallenge(id) {
    if (!confirm('Are you sure you want to delete this challenge? All completions will also be removed.')) return;

    try {
        const response = await fetch(`/api/challenges/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) throw new Error('Delete failed');
        
        await loadChallenges();
    } catch (error) {
        alert(error.message);
    }
}

// ============================================
// COMPLETION OPERATIONS
// ============================================

async function handleStartCompletion(id) {
    const details = prompt('Enter any details about your completion (optional):');
    if (details === null) return;

    try {
        const response = await fetch(`/api/challenges/${id}/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ details })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Completion failed');
        }

        await response.json();
        alert('Challenge completed! Points awarded.');
        
        // Refresh navbar points and challenges list
        if (window.updateAuthUI) await window.updateAuthUI();
        await loadChallenges();
    } catch (error) {
        alert(error.message);
    }
}

async function viewMyAttempts(challengeId) {
    const list = document.getElementById('attemptsList');
    if (!list || !attemptsModal) return;

    list.innerHTML = `
        <div class="text-center py-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
    attemptsModal.show();

    try {
        const response = await fetch(`/api/challenges/${challengeId}/my-completions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!response.ok) {
            if (response.status === 404) {
                list.innerHTML = '<div class="alert alert-info">No attempts found for this challenge yet.</div>';
                return;
            }
            throw new Error('Failed to load attempts');
        }

        const attempts = await response.json();
        list.innerHTML = attempts.map(a => `
            <div class="list-group-item mb-2">
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1 text-primary">Completion #${a.completion_id}</h6>
                    <small class="opacity-50"><i class="bi bi-check-circle-fill"></i></small>
                </div>
                <p class="mb-0 small">${a.details || 'No details provided.'}</p>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
}

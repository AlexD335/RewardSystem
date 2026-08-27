// script.js - Complete JavaScript logic with safe element handling
let currentUserId = null;

// Helper function to safely set text content
function safeSetTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        return true;
    } else {
        console.warn(`Element with id '${elementId}' not found`);
        return false;
    }
}

// Helper function to safely show result
function showResult(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = 'result show ' + type;
        return true;
    } else {
        console.warn(`Result element with id '${elementId}' not found`);
        return false;
    }
}

// Helper function for fetch with error handling
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

// Load user data when selected
function loadUserData() {
    const userSelect = document.getElementById('userSelect');
    if (!userSelect) {
        console.error('User select element not found');
        return;
    }
    
    currentUserId = userSelect.value;
    
    if (!currentUserId) {
        showResult('userInfo', 'Please select a user', 'info');
        const userInfo = document.getElementById('userInfo');
        if (userInfo) userInfo.classList.add('hidden');
        return;
    }
    
    // Fetch user balance
    fetch(`/api/get_balance/${currentUserId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                safeSetTextContent('userName', data.user_name);
                safeSetTextContent('userPoints', data.points);
                const userInfo = document.getElementById('userInfo');
                if (userInfo) userInfo.classList.remove('hidden');
                showResult('userInfo', `User ${data.user_name} loaded successfully`, 'success');
            } else {
                showResult('userInfo', data.error || 'Error loading user', 'error');
            }
        })
        .catch(error => {
            showResult('userInfo', 'Error loading user: ' + error.message, 'error');
        });
}

// Register a purchase
function registerPurchase() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    const amountInput = document.getElementById('purchaseAmount');
    if (!amountInput) {
        console.error('Purchase amount input not found');
        return;
    }
    
    const amount = parseFloat(amountInput.value);
    
    if (!amount || amount <= 0) {
        showResult('purchaseResult', 'Please enter a valid amount greater than 0', 'error');
        return;
    }
    
    // Show loading
    showResult('purchaseResult', 'Processing...', 'info');
    
    fetch('/api/register_purchase', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: currentUserId,
            amount: amount
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showResult('purchaseResult', 
                `✅ ${data.message}\nAmount: $${data.amount}\nPoints Earned: ${data.points_earned}\nTotal Points: ${data.total_points}`,
                'success'
            );
            // Update user points display
            safeSetTextContent('userPoints', data.total_points);
            if (amountInput) amountInput.value = '';
        } else {
            showResult('purchaseResult', `❌ ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Purchase error:', error);
        showResult('purchaseResult', '❌ Error: ' + (error.message || 'Error connecting to server'), 'error');
    });
}

// Redeem points
function redeemPoints() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    const pointsInput = document.getElementById('redeemPoints');
    if (!pointsInput) {
        console.error('Redeem points input not found');
        return;
    }
    
    const points = parseInt(pointsInput.value);
    
    if (!points || points <= 0) {
        showResult('redeemResult', 'Please enter a valid number of points', 'error');
        return;
    }
    
    showResult('redeemResult', 'Processing...', 'info');
    
    fetch('/api/redeem_points', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: currentUserId,
            points_to_redeem: points
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            showResult('redeemResult', 
                `✅ ${data.message}\nPoints Redeemed: ${data.points_redeemed}\nCash Value: $${data.cash_value}\nRemaining Points: ${data.remaining_points}`,
                'success'
            );
            safeSetTextContent('userPoints', data.remaining_points);
            if (pointsInput) pointsInput.value = '';
        } else {
            showResult('redeemResult', `❌ ${data.error}`, 'error');
        }
    })
    .catch(error => {
        console.error('Redemption error:', error);
        showResult('redeemResult', '❌ Error: ' + (error.message || 'Error connecting to server'), 'error');
    });
}

// Check balance
function checkBalance() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    fetch(`/api/get_balance/${currentUserId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showResult('balanceResult', 
                    `👤 User: ${data.user_name}\n💰 Points: ${data.points}`,
                    'success'
                );
                safeSetTextContent('userPoints', data.points);
            } else {
                showResult('balanceResult', `❌ ${data.error}`, 'error');
            }
        })
        .catch(error => {
            console.error('Balance error:', error);
            showResult('balanceResult', '❌ Error: ' + (error.message || 'Error connecting to server'), 'error');
        });
}

// View purchase history
function viewHistory() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    fetch(`/api/get_history/${currentUserId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const historyList = document.getElementById('historyList');
                if (!historyList) {
                    console.error('History list element not found');
                    return;
                }
                
                historyList.innerHTML = '';
                
                if (data.history.length === 0) {
                    historyList.innerHTML = '<p>No purchases or redemptions yet</p>';
                } else {
                    data.history.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'history-item';
                        if (item.type === 'PURCHASE') {
                            div.innerHTML = `
                                <strong>🛒 Purchase</strong><br>
                                Amount: $${item.amount} | Points Earned: ${item.points_earned}<br>
                                Date: ${new Date(item.date).toLocaleString()}
                            `;
                        } else {
                            div.innerHTML = `
                                <strong>🎯 Redemption</strong><br>
                                Points Redeemed: ${item.points_redeemed} | Cash Value: $${item.cash_value}<br>
                                Date: ${new Date(item.date).toLocaleString()}
                            `;
                        }
                        historyList.appendChild(div);
                    });
                }
                showResult('historyResult', '', 'info');
                const historyResult = document.getElementById('historyResult');
                if (historyResult) historyResult.classList.add('show');
            } else {
                showResult('historyResult', `❌ ${data.error}`, 'error');
            }
        })
        .catch(error => {
            console.error('History error:', error);
            showResult('historyResult', '❌ Error: ' + (error.message || 'Error connecting to server'), 'error');
        });
}

// View all users
function viewAllUsers() {
    fetch('/api/get_all_users')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const allUsersList = document.getElementById('allUsersList');
                if (!allUsersList) {
                    console.error('All users list element not found');
                    return;
                }
                
                allUsersList.innerHTML = '';
                
                if (data.users.length === 0) {
                    allUsersList.innerHTML = '<p>No users found</p>';
                } else {
                    data.users.forEach(user => {
                        const div = document.createElement('div');
                        div.className = 'user-item';
                        div.innerHTML = `
                            <span class="user-name">${user.name}</span>
                            <span class="user-points">${user.points} points</span>
                        `;
                        allUsersList.appendChild(div);
                    });
                }
                showResult('allUsersResult', '', 'info');
                const allUsersResult = document.getElementById('allUsersResult');
                if (allUsersResult) allUsersResult.classList.add('show');
            } else {
                showResult('allUsersResult', `❌ ${data.error}`, 'error');
            }
        })
        .catch(error => {
            console.error('All users error:', error);
            showResult('allUsersResult', '❌ Error: ' + (error.message || 'Error connecting to server'), 'error');
        });
}
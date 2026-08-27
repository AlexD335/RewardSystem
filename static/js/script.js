// script.js - Complete JavaScript logic
let currentUserId = null;

// Load user data when selected
function loadUserData() {
    const userSelect = document.getElementById('userSelect');
    currentUserId = userSelect.value;
    
    if (!currentUserId) {
        showResult('userInfo', 'Please select a user', 'info');
        document.getElementById('userInfo').classList.add('hidden');
        return;
    }
    
    // Fetch user balance
    fetch(`/api/get_balance/${currentUserId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('userName').textContent = data.user_name;
                document.getElementById('userPoints').textContent = data.points;
                document.getElementById('userInfo').classList.remove('hidden');
                showResult('userInfo', `User ${data.user_name} loaded successfully`, 'success');
            } else {
                showResult('userInfo', data.error || 'Error loading user', 'error');
            }
        })
        .catch(error => {
            showResult('userInfo', 'Error connecting to server', 'error');
        });
}

// Register a purchase
function registerPurchase() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    const amountInput = document.getElementById('purchaseAmount');
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showResult('purchaseResult', 
                `✅ ${data.message}\nAmount: $${data.amount}\nPoints Earned: ${data.points_earned}\nTotal Points: ${data.total_points}`,
                'success'
            );
            // Update user points display
            document.getElementById('userPoints').textContent = data.total_points;
            amountInput.value = '';
        } else {
            showResult('purchaseResult', `❌ ${data.error}`, 'error');
        }
    })
    .catch(error => {
        showResult('purchaseResult', 'Error connecting to server', 'error');
    });
}

// Redeem points
function redeemPoints() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    const pointsInput = document.getElementById('redeemPoints');
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
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showResult('redeemResult', 
                `✅ ${data.message}\nPoints Redeemed: ${data.points_redeemed}\nCash Value: $${data.cash_value}\nRemaining Points: ${data.remaining_points}`,
                'success'
            );
            document.getElementById('userPoints').textContent = data.remaining_points;
            pointsInput.value = '';
        } else {
            showResult('redeemResult', `❌ ${data.error}`, 'error');
        }
    })
    .catch(error => {
        showResult('redeemResult', 'Error connecting to server', 'error');
    });
}

// Check balance
function checkBalance() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    fetch(`/api/get_balance/${currentUserId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showResult('balanceResult', 
                    `👤 User: ${data.user_name}\n💰 Points: ${data.points}`,
                    'success'
                );
                document.getElementById('userPoints').textContent = data.points;
            } else {
                showResult('balanceResult', `❌ ${data.error}`, 'error');
            }
        })
        .catch(error => {
            showResult('balanceResult', 'Error connecting to server', 'error');
        });
}

// View purchase history
function viewHistory() {
    if (!currentUserId) {
        alert('Please select a user first');
        return;
    }
    
    fetch(`/api/get_history/${currentUserId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const historyList = document.getElementById('historyList');
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
                document.getElementById('historyResult').classList.add('show');
            } else {
                showResult('historyResult', `❌ ${data.error}`, 'error');
            }
        })
        .catch(error => {
            showResult('historyResult', 'Error connecting to server', 'error');
        });
}

// View all users
function viewAllUsers() {
    fetch('/api/get_all_users')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const allUsersList = document.getElementById('allUsersList');
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
                document.getElementById('allUsersResult').classList.add('show');
            } else {
                showResult('allUsersResult', `❌ ${data.error}`, 'error');
            }
        })
        .catch(error => {
            showResult('allUsersResult', 'Error connecting to server', 'error');
        });
}

// Helper function to show results
function showResult(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = 'result show ' + type;
}
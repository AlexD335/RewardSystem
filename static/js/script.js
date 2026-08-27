// script.js - Complete JavaScript logic
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
    
    // Mostrar loading
    const historyResult = document.getElementById('historyResult');
    const historyList = document.getElementById('historyList');
    
    if (historyResult) {
        historyResult.className = 'result show info';
        historyResult.textContent = '⏳ Cargando historial...';
    }
    if (historyList) {
        historyList.innerHTML = '';
    }
    
    fetch(`/api/get_history/${currentUserId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            const historyList = document.getElementById('historyList');
            if (!historyList) {
                console.error('History list element not found');
                return;
            }
            
            // Limpiar el contenido anterior
            historyList.innerHTML = '';
            
            if (data.success) {
                if (data.history.length === 0) {
                    historyList.innerHTML = '<p style="padding:10px;color:#666;text-align:center;">📭 No hay compras o canjes registrados aún</p>';
                    // Mostrar mensaje de éxito pero sin texto adicional
                    const historyResult = document.getElementById('historyResult');
                    if (historyResult) {
                        historyResult.className = 'result show success';
                        historyResult.textContent = '✅ Historial cargado correctamente';
                        setTimeout(() => {
                            if (historyResult) {
                                historyResult.className = 'result show info';
                                historyResult.textContent = '';
                            }
                        }, 2000);
                    }
                } else {
                    // Construir la lista de historial
                    data.history.forEach(item => {
                        const div = document.createElement('div');
                        div.className = 'history-item';
                        if (item.type === 'PURCHASE') {
                            div.innerHTML = `
                                <strong>🛒 Compra</strong><br>
                                Monto: $${item.amount} | Puntos Ganados: ${item.points_earned}<br>
                                <small>📅 ${new Date(item.date).toLocaleString()}</small>
                            `;
                        } else {
                            div.innerHTML = `
                                <strong>🎯 Canje</strong><br>
                                Puntos Canjeados: ${item.points_redeemed} | Valor: $${item.cash_value}<br>
                                <small>📅 ${new Date(item.date).toLocaleString()}</small>
                            `;
                        }
                        historyList.appendChild(div);
                    });
                    
                    // Mostrar mensaje de éxito
                    const historyResult = document.getElementById('historyResult');
                    if (historyResult) {
                        historyResult.className = 'result show success';
                        historyResult.textContent = `✅ ${data.history.length} movimientos encontrados`;
                        setTimeout(() => {
                            if (historyResult) {
                                historyResult.className = 'result show info';
                                historyResult.textContent = '';
                            }
                        }, 2000);
                    }
                }
            } else {
                // Error en la respuesta
                const historyResult = document.getElementById('historyResult');
                if (historyResult) {
                    historyResult.className = 'result show error';
                    historyResult.textContent = `❌ ${data.error}`;
                }
            }
        })
        .catch(error => {
            console.error('History error:', error);
            const historyResult = document.getElementById('historyResult');
            if (historyResult) {
                historyResult.className = 'result show error';
                historyResult.textContent = '❌ Error: ' + (error.message || 'Error connecting to server');
            }
        });
}

// View all users
function viewAllUsers() {
    // Mostrar loading
    const allUsersResult = document.getElementById('allUsersResult');
    const allUsersList = document.getElementById('allUsersList');
    
    if (allUsersResult) {
        allUsersResult.className = 'result show info';
        allUsersResult.textContent = '⏳ Cargando usuarios...';
    }
    if (allUsersList) {
        allUsersList.innerHTML = '';
    }
    
    fetch('/api/get_all_users')
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            const allUsersList = document.getElementById('allUsersList');
            if (!allUsersList) {
                console.error('All users list element not found');
                return;
            }
            
            // Limpiar el contenido anterior
            allUsersList.innerHTML = '';
            
            if (data.success) {
                if (data.users.length === 0) {
                    allUsersList.innerHTML = '<p style="padding:10px;color:#666;text-align:center;">📭 No hay usuarios registrados</p>';
                    const allUsersResult = document.getElementById('allUsersResult');
                    if (allUsersResult) {
                        allUsersResult.className = 'result show success';
                        allUsersResult.textContent = '✅ Usuarios cargados correctamente';
                        setTimeout(() => {
                            if (allUsersResult) {
                                allUsersResult.className = 'result show info';
                                allUsersResult.textContent = '';
                            }
                        }, 2000);
                    }
                } else {
                    // Construir la lista de usuarios
                    data.users.forEach(user => {
                        const div = document.createElement('div');
                        div.className = 'user-item';
                        div.innerHTML = `
                            <span class="user-name">👤 ${user.name}</span>
                            <span class="user-points">⭐ ${user.points} puntos</span>
                        `;
                        allUsersList.appendChild(div);
                    });
                    
                    // Mostrar mensaje de éxito
                    const allUsersResult = document.getElementById('allUsersResult');
                    if (allUsersResult) {
                        allUsersResult.className = 'result show success';
                        allUsersResult.textContent = `✅ ${data.users.length} usuarios encontrados`;
                        setTimeout(() => {
                            if (allUsersResult) {
                                allUsersResult.className = 'result show info';
                                allUsersResult.textContent = '';
                            }
                        }, 2000);
                    }
                }
            } else {
                // Error en la respuesta
                const allUsersResult = document.getElementById('allUsersResult');
                if (allUsersResult) {
                    allUsersResult.className = 'result show error';
                    allUsersResult.textContent = `❌ ${data.error}`;
                }
            }
        })
        .catch(error => {
            console.error('All users error:', error);
            const allUsersResult = document.getElementById('allUsersResult');
            if (allUsersResult) {
                allUsersResult.className = 'result show error';
                allUsersResult.textContent = '❌ Error: ' + (error.message || 'Error connecting to server');
            }
        });
}
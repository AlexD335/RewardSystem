from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import json
import os

app = Flask(__name__)
app.secret_key = 'techsoft_reward_system_2026'

# In-memory database (simulated)
users = {}
purchase_history = {}

# Initialize with test users
def init_test_data():
    users['1'] = {
        'id': '1',
        'name': 'John Doe',
        'points': 0,
        'email': 'john@example.com'
    }
    users['2'] = {
        'id': '2',
        'name': 'Jane Smith',
        'points': 0,
        'email': 'jane@example.com'
    }
    purchase_history['1'] = []
    purchase_history['2'] = []

init_test_data()

# Business rules
POINTS_PER_THOUSAND = 1
THOUSAND_VALUE = 1000
REDEMPTION_VALUE_PER_POINT = 100

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    user_list = []
    for user_id, user_data in users.items():
        user_list.append({
            'id': user_data['id'],
            'name': user_data['name'],
            'points': user_data['points']
        })
    return jsonify(user_list)

@app.route('/api/register_purchase', methods=['POST'])
def register_purchase():
    """Register a purchase and calculate points"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        
        # Validate required fields
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'User ID is required'
            }), 400
        
        if amount is None:
            return jsonify({
                'success': False,
                'error': 'Amount is required'
            }), 400
        
        # Validate user exists
        if user_id not in users:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Validate amount
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Invalid amount. Must be a number'
            }), 400
        
        if amount <= 0:
            return jsonify({
                'success': False,
                'error': 'Amount must be greater than 0'
            }), 400
        
        # Calculate points: For each 1000 pesos, 1 point
        points_earned = int(amount // THOUSAND_VALUE) * POINTS_PER_THOUSAND
        
        if points_earned == 0:
            return jsonify({
                'success': False,
                'error': f'Amount must be at least {THOUSAND_VALUE} pesos to earn points'
            }), 400
        
        # Update user points
        users[user_id]['points'] += points_earned
        
        # Register purchase in history
        purchase = {
            'purchase_id': str(int(datetime.now().timestamp() * 1000)),
            'amount': amount,
            'points_earned': points_earned,
            'date': datetime.now().isoformat(),
            'type': 'PURCHASE'
        }
        purchase_history[user_id].append(purchase)
        
        return jsonify({
            'success': True,
            'message': 'Purchase registered successfully',
            'user_id': user_id,
            'user_name': users[user_id]['name'],
            'amount': amount,
            'points_earned': points_earned,
            'total_points': users[user_id]['points'],
            'purchase': purchase
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
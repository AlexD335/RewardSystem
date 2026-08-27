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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
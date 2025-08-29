#!/bin/bash

# Test script for Profile API endpoints
BASE_URL="http://localhost:8080/api"
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

echo "🧪 Testing Profile API Endpoints"
echo "================================="

# Test 1: Get User Profile
echo "📝 Testing GET /user/profile..."
curl -X GET "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 2: Update User Profile
echo "📝 Testing PUT /user/profile..."
curl -X PUT "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated First",
    "lastName": "Updated Last",
    "monthlyBudget": 6000.00,
    "dailyBudget": 200.00
  }'
echo -e "\n"

# Test 3: Get Reward Points
echo "📝 Testing GET /user/rewards..."
curl -X GET "$BASE_URL/user/rewards" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 4: Get Transaction Summary
echo "📝 Testing GET /transactions/summary..."
curl -X GET "$BASE_URL/transactions/summary" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json"
echo -e "\n"

# Test 5: Delete All Transactions (WARNING: Use with caution!)
echo "⚠️  Testing DELETE /user/transactions/all..."
echo "This endpoint will delete ALL transactions for the user!"
echo "Uncomment the following line only if you want to test this:"
# curl -X DELETE "$BASE_URL/user/transactions/all" \
#   -H "Authorization: Bearer $JWT_TOKEN" \
#   -H "Content-Type: application/json"

echo "✅ Profile API test script completed!"
echo "Note: Replace YOUR_JWT_TOKEN_HERE with an actual JWT token to test."
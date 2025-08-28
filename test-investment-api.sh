#!/bin/bash
# Investment API Test Script
# Run this after starting the backend to test investment endpoints

echo "Testing Investment API endpoints..."

# Base URL
BASE_URL="http://localhost:8080/api"

echo "1. Testing investment suggestions endpoint (public)..."
curl -X GET "${BASE_URL}/investments/suggestions" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n2. Testing investment types endpoint (public)..."
curl -X GET "${BASE_URL}/investments/types" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n"

echo -e "\n3. Testing auth endpoint (should work)..."
curl -X POST "${BASE_URL}/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword"
  }' \
  -w "\nStatus: %{http_code}\n"

echo -e "\nAPI test completed."
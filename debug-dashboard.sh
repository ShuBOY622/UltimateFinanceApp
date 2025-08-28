#!/bin/bash

echo "=== FinanceApp Dashboard Debug Script ==="
echo ""

# Test 1: Check if backend is responding
echo "1. Testing backend connectivity..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/investments/types")
if [ "$RESPONSE" -eq 200 ]; then
    echo "✅ Backend is responding (200)"
elif [ "$RESPONSE" -eq 401 ]; then
    echo "⚠️  Backend responding but requires auth (401)"
else
    echo "❌ Backend error ($RESPONSE)"
fi

# Test 2: Check authentication endpoint
echo ""
echo "2. Testing auth endpoint..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/auth/signin")
if [ "$AUTH_RESPONSE" -eq 405 ]; then
    echo "✅ Auth endpoint accessible (Method not allowed = endpoint exists)"
else
    echo "❌ Auth endpoint issue ($AUTH_RESPONSE)"
fi

# Test 3: Test login (you'll need to provide credentials)
echo ""
echo "3. Testing login (example)..."
echo "To test login, run:"
echo "curl -X POST http://localhost:8080/api/auth/signin \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"your-email\",\"password\":\"your-password\"}'"

# Test 4: Check frontend app
echo ""
echo "4. Testing frontend app..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001")
if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo "✅ Frontend is responding (200)"
else
    echo "❌ Frontend error ($FRONTEND_RESPONSE)"
fi

echo ""
echo "=== Dashboard Crash Debug Steps ==="
echo "1. Open browser console (F12)"
echo "2. Go to Network tab"
echo "3. Navigate to Dashboard"
echo "4. Add an investment"
echo "5. Return to Dashboard and check:"
echo "   - Authentication token in localStorage"
echo "   - Failed API requests in Network tab"
echo "   - JavaScript errors in Console tab"

echo ""
echo "=== Authentication Check ==="
echo "In browser console, check if you have a valid token:"
echo "localStorage.getItem('token')"
echo "localStorage.getItem('user')"

echo ""
echo "If token is null or user is not logged in, that's the issue!"
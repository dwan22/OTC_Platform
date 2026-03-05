#!/bin/bash

echo "🌐 Setting up external access with ngrok..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "📦 ngrok not found. Installing..."
    brew install ngrok
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install ngrok via brew."
        echo "Please install manually from: https://ngrok.com/download"
        exit 1
    fi
    
    echo "✅ ngrok installed successfully!"
    echo ""
fi

# Check if ngrok is configured
if ! ngrok config check &> /dev/null; then
    echo "⚙️  ngrok needs to be configured with your auth token."
    echo ""
    echo "Steps:"
    echo "1. Sign up at: https://dashboard.ngrok.com/signup"
    echo "2. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_TOKEN"
    echo ""
    read -p "Press Enter once you've configured ngrok..."
fi

echo ""
echo "🚀 Starting ngrok tunnel to localhost:3000..."
echo ""
echo "Your public URL will appear below."
echo "Share this URL with anyone to give them access to your app."
echo ""
echo "⚠️  Keep this terminal window open!"
echo ""

ngrok http 3000

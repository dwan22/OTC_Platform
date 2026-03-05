#!/bin/bash

echo "🚀 Deploying OTC Platform"
echo ""

# Check if git is clean
if [[ -n $(git status -s) ]]; then
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    read -p "Enter commit message: " commit_msg
    git commit -m "$commit_msg"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to push to GitHub."
    echo ""
    echo "If you need authentication:"
    echo "1. Create a Personal Access Token: https://github.com/settings/tokens"
    echo "2. Use the token as your password when prompted"
    echo ""
    echo "Or use SSH:"
    echo "git remote set-url origin git@github.com:dwan22/OTC_Platform.git"
    exit 1
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your app is live! 🎉"
else
    echo ""
    echo "❌ Deployment failed. Check the logs above."
fi

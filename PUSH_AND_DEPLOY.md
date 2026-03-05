# 🚀 Push to GitHub and Deploy to Vercel

## Step 1: Push to GitHub

Since GitHub requires authentication, you'll need to push manually:

```bash
git push -u origin main
```

You'll be prompted for your GitHub credentials. If you have 2FA enabled, you'll need to use a Personal Access Token instead of your password.

### Create a Personal Access Token (if needed):

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "OTC Platform"
4. Select scopes: ✓ repo (all)
5. Click "Generate token"
6. Copy the token (you won't see it again!)
7. Use this token as your password when pushing

### Alternative: Use SSH

```bash
# Change to SSH URL
git remote set-url origin git@github.com:dwan22/OTC_Platform.git

# Push
git push -u origin main
```

## Step 2: Deploy to Vercel

Once your code is on GitHub, deploy to Vercel:

```bash
npx vercel
```

Follow the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **What's your project's name?** → `otc-platform` (or press Enter)
- **In which directory is your code located?** → Press Enter
- **Want to modify settings?** → `N`

Vercel will build and deploy your app!

## Step 3: Add Environment Variables

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Add these 4 variables:

```
NEXT_PUBLIC_INSTANT_APP_ID = 79804a5a-fce5-4e35-8548-a53f8f50c6bb
INSTANT_APP_ID = 79804a5a-fce5-4e35-8548-a53f8f50c6bb
INSTANT_ADMIN_TOKEN = 2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c
NEXT_PUBLIC_ADMIN_EMAIL = your-actual-email@example.com
```

Make sure to select all environments (Production, Preview, Development) for each!

## Step 4: Deploy to Production

```bash
npx vercel --prod
```

## 🎉 Done!

You'll get a URL like: `https://otc-platform.vercel.app`

## Quick Commands

```bash
# Push to GitHub
git push

# Deploy to Vercel production
npm run deploy

# Deploy preview
npm run deploy:preview
```

## 🔄 Future Updates

When you make changes:

```bash
# 1. Commit changes
git add .
git commit -m "Your update message"

# 2. Push to GitHub
git push

# 3. Deploy to Vercel
npm run deploy
```

## 🆘 Troubleshooting

### GitHub Authentication Failed?

**Option 1: Use Personal Access Token**
1. Create token at: https://github.com/settings/tokens
2. Use token as password when pushing

**Option 2: Use SSH**
```bash
git remote set-url origin git@github.com:dwan22/OTC_Platform.git
git push -u origin main
```

### Vercel Build Failed?

1. Check build logs in Vercel dashboard
2. Make sure environment variables are added
3. Redeploy: `npx vercel --prod`

## ✅ Verification

After deployment:
- [ ] Code is on GitHub: https://github.com/dwan22/OTC_Platform
- [ ] App is live on Vercel: `https://your-app.vercel.app`
- [ ] Environment variables are set
- [ ] Login works
- [ ] Admin panel works

---

**Start with:** `git push -u origin main`

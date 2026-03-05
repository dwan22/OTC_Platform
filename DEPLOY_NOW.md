# 🚀 Deploy Your App Now

## GitHub Repository
Your repo: https://github.com/dwan22/OTC_Platform

## Quick Deploy (2 Commands)

### 1. Push to GitHub

```bash
git push -u origin main
```

**If prompted for credentials:**
- Username: `dwan22`
- Password: Use a Personal Access Token (not your GitHub password)

**Don't have a token?** Create one here: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name: "OTC Platform"
- Select: ✓ repo (all)
- Generate and copy the token
- Use it as your password

### 2. Deploy to Vercel

```bash
npx vercel
```

Answer the prompts:
- Set up and deploy? → `Y`
- Link to existing project? → `N`
- Project name? → Press Enter
- Directory? → Press Enter
- Modify settings? → `N`

**Then add environment variables and redeploy:**

```bash
npx vercel --prod
```

## 📋 Environment Variables (Add in Vercel Dashboard)

After first deployment, add these at https://vercel.com/dashboard:

```
NEXT_PUBLIC_INSTANT_APP_ID = 79804a5a-fce5-4e35-8548-a53f8f50c6bb
INSTANT_APP_ID = 79804a5a-fce5-4e35-8548-a53f8f50c6bb
INSTANT_ADMIN_TOKEN = 2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c
NEXT_PUBLIC_ADMIN_EMAIL = your-actual-email@example.com
```

## 🎯 Alternative: Automated Script

```bash
./scripts/deploy.sh
```

This script will:
1. Commit any changes
2. Push to GitHub
3. Deploy to Vercel

## 🔐 GitHub Authentication Options

### Option 1: HTTPS with Token (Recommended)
1. Create token: https://github.com/settings/tokens
2. Use token as password when pushing

### Option 2: SSH
```bash
# Switch to SSH
git remote set-url origin git@github.com:dwan22/OTC_Platform.git

# Push
git push -u origin main
```

## ✅ Verification Steps

After deployment:

1. **Check GitHub**: https://github.com/dwan22/OTC_Platform
   - [ ] Code is visible
   - [ ] All files uploaded

2. **Check Vercel**: https://vercel.com/dashboard
   - [ ] Project created
   - [ ] Build successful
   - [ ] Environment variables added

3. **Test Your App**:
   - [ ] Visit Vercel URL
   - [ ] Login works
   - [ ] Admin panel works (with your email)

## 🌐 Your Live URLs

After deployment:
- **GitHub**: https://github.com/dwan22/OTC_Platform
- **Vercel**: `https://otc-platform.vercel.app` (or similar)

## 🔄 Future Updates

```bash
# Make changes, then:
git add .
git commit -m "Your changes"
git push
npm run deploy
```

## 🆘 Need Help?

**Can't push to GitHub?**
→ See PUSH_AND_DEPLOY.md for detailed authentication steps

**Vercel deployment failed?**
→ Check logs in Vercel dashboard
→ Make sure environment variables are added

**Still stuck?**
→ Check START_DEPLOYMENT.md for step-by-step guide

---

**Ready?** Run: `git push -u origin main`

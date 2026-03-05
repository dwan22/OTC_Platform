# 📋 Quick Commands Reference

## 🚀 Deploy to GitHub and Vercel

### Push to GitHub
```bash
git push -u origin main
```

### Deploy to Vercel
```bash
npx vercel
```

### Deploy to Production
```bash
npx vercel --prod
```

### Or use shortcuts:
```bash
npm run deploy              # Deploy to production
npm run deploy:preview      # Deploy preview
```

## 🔐 GitHub Authentication

### Create Personal Access Token
1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "OTC Platform"
4. Select: ✓ repo
5. Generate and copy token
6. Use as password when pushing

### Switch to SSH (Alternative)
```bash
git remote set-url origin git@github.com:dwan22/OTC_Platform.git
git push -u origin main
```

## 📊 Environment Variables for Vercel

Add these in Vercel Dashboard (https://vercel.com/dashboard):

```bash
NEXT_PUBLIC_INSTANT_APP_ID=79804a5a-fce5-4e35-8548-a53f8f50c6bb
INSTANT_APP_ID=79804a5a-fce5-4e35-8548-a53f8f50c6bb
INSTANT_ADMIN_TOKEN=2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c
NEXT_PUBLIC_ADMIN_EMAIL=your-actual-email@example.com
```

## 🔄 Update Workflow

```bash
# 1. Make changes
# 2. Commit
git add .
git commit -m "Your message"

# 3. Push to GitHub
git push

# 4. Deploy to Vercel
npm run deploy
```

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 📦 Database Commands

```bash
# Seed database
npm run db:seed

# Push schema
npm run schema:push

# Test connection
npm run test:connection
```

## 🔍 Vercel Commands

```bash
# Deploy
npx vercel

# Deploy to production
npx vercel --prod

# View logs
npx vercel logs

# List deployments
npx vercel ls

# Check status
npx vercel inspect
```

## 📱 Your URLs

- **GitHub**: https://github.com/dwan22/OTC_Platform
- **Local**: http://localhost:3000
- **Vercel**: (after deployment) https://otc-platform.vercel.app

## 🎯 Quick Deploy Script

```bash
./scripts/deploy.sh
```

This automated script:
1. Commits changes
2. Pushes to GitHub
3. Deploys to Vercel

## ✅ Verification Commands

```bash
# Check git status
git status

# Check remote
git remote -v

# Check Vercel status
npx vercel ls

# View Vercel logs
npx vercel logs
```

## 🆘 Troubleshooting Commands

```bash
# Reset git remote
git remote set-url origin https://github.com/dwan22/OTC_Platform.git

# Force push (careful!)
git push -f origin main

# Check Vercel login
npx vercel whoami

# Vercel login
npx vercel login

# Clear Vercel cache
npx vercel --force
```

## 📚 Documentation Files

- **DEPLOY_NOW.md** - Quick deployment guide
- **PUSH_AND_DEPLOY.md** - GitHub and Vercel steps
- **START_DEPLOYMENT.md** - Step-by-step Vercel guide
- **VERCEL_QUICK_START.md** - Fast Vercel reference
- **DEPLOY_TO_VERCEL.md** - Detailed Vercel guide

---

**Most Important Commands:**

```bash
# 1. Push to GitHub
git push -u origin main

# 2. Deploy to Vercel
npx vercel

# 3. Add env vars in dashboard, then:
npx vercel --prod
```

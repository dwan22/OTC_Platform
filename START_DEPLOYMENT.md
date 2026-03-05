# 🚀 START HERE: Deploy to Vercel

## ⚡ Quick Deploy (3 Steps)

### Step 1: Deploy
```bash
npx vercel
```

Answer the prompts (just press Enter for most):
- Set up and deploy? → `Y`
- Link to existing project? → `N`
- Project name? → Press Enter
- Directory? → Press Enter
- Modify settings? → `N`

**Wait for deployment to complete...**

### Step 2: Add Environment Variables

1. Open: https://vercel.com/dashboard
2. Click your project name
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Add these 4 variables (click "Add" for each):

```
Name: NEXT_PUBLIC_INSTANT_APP_ID
Value: 79804a5a-fce5-4e35-8548-a53f8f50c6bb
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: INSTANT_APP_ID
Value: 79804a5a-fce5-4e35-8548-a53f8f50c6bb
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: INSTANT_ADMIN_TOKEN
Value: 2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c
Environments: ✓ Production ✓ Preview ✓ Development
```

```
Name: NEXT_PUBLIC_ADMIN_EMAIL
Value: your-actual-email@example.com  ⚠️ REPLACE THIS!
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 3: Deploy to Production
```bash
npx vercel --prod
```

## 🎉 Done! Get Your URL

After deployment completes, you'll see:

```
✅ Production: https://your-app.vercel.app
```

**This is your permanent URL!** Share it with anyone.

## ✅ Test Your Deployment

1. Visit your Vercel URL
2. You should see the login page
3. Sign in with your email
4. Check that everything works

## 📱 Share Your App

Your URL: `https://your-app.vercel.app`

Anyone can:
- Access the app
- Sign in with their email
- Use all features

As admin, you can:
- See all users at `/profile`
- Monitor sign-ups

## 🔄 Update Your App Later

When you make changes:

```bash
# 1. Commit changes
git add .
git commit -m "Your update"

# 2. Deploy
npm run deploy
```

## 🆘 Need Help?

- **Build failed?** → Check logs in Vercel dashboard
- **Can't sign in?** → Make sure all 4 env variables are added
- **Admin panel not showing?** → Check `NEXT_PUBLIC_ADMIN_EMAIL` is correct

## 📚 More Info

- **VERCEL_QUICK_START.md** - Quick reference
- **DEPLOY_TO_VERCEL.md** - Detailed guide
- **DEPLOYMENT_CHECKLIST.md** - Full checklist

---

**Ready?** Run: `npx vercel`

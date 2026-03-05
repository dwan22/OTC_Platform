# ⚡ Vercel Deployment - Quick Start

## 🚀 Deploy in 3 Commands

```bash
# 1. Deploy to Vercel
npx vercel

# 2. Add environment variables in Vercel dashboard
# (See instructions below)

# 3. Deploy to production
npx vercel --prod
```

## 📋 Environment Variables to Add

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these 4 variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_INSTANT_APP_ID` | `79804a5a-fce5-4e35-8548-a53f8f50c6bb` |
| `INSTANT_APP_ID` | `79804a5a-fce5-4e35-8548-a53f8f50c6bb` |
| `INSTANT_ADMIN_TOKEN` | `2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c` |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `your-email@example.com` (⚠️ Replace with your email!) |

**Important**: Select all environments (Production, Preview, Development) for each variable!

## 🎯 Step-by-Step

### 1. First Deployment

```bash
npx vercel
```

Answer the prompts:
- Set up and deploy? → `Y`
- Link to existing project? → `N`
- Project name? → Press Enter (or type custom name)
- Directory? → Press Enter
- Modify settings? → `N`

### 2. Add Environment Variables

1. Open: https://vercel.com/dashboard
2. Click your project
3. Go to: **Settings** → **Environment Variables**
4. Add all 4 variables from the table above
5. Click **Save** for each

### 3. Deploy to Production

```bash
npx vercel --prod
```

## ✅ Your URL

You'll get a URL like:
```
https://otc-platform.vercel.app
```

**Share this URL with anyone!**

## 🔄 Future Updates

When you make changes:

```bash
# Commit changes
git add .
git commit -m "Update message"

# Deploy
npm run deploy
```

## 🆘 Troubleshooting

**Build failed?**
→ Check build logs in Vercel dashboard

**Can't sign in?**
→ Make sure all 4 environment variables are added

**Admin panel not showing?**
→ Set `NEXT_PUBLIC_ADMIN_EMAIL` to your exact email

## 📚 Full Guide

See **DEPLOY_TO_VERCEL.md** for detailed instructions.

---

**Ready?** Run: `npx vercel`

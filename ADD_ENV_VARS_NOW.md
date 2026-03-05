# ⚠️ ADD ENVIRONMENT VARIABLES NOW

## Your deployment is failing because environment variables are missing!

### 🎯 Follow These Exact Steps:

## Step 1: Go to Vercel Dashboard
Open this link: **https://vercel.com/dashboard**

## Step 2: Click Your Project
Look for **"otc-platform"** and click on it

## Step 3: Go to Settings
Click **"Settings"** in the top menu bar

## Step 4: Click Environment Variables
In the left sidebar, click **"Environment Variables"**

## Step 5: Add Each Variable

Click the **"Add New"** button and add these **ONE BY ONE**:

---

### Variable 1:
```
Key: NEXT_PUBLIC_INSTANT_APP_ID
Value: 79804a5a-fce5-4e35-8548-a53f8f50c6bb
```
**Check all boxes**: ✓ Production ✓ Preview ✓ Development
Click **"Save"**

---

### Variable 2:
```
Key: INSTANT_APP_ID
Value: 79804a5a-fce5-4e35-8548-a53f8f50c6bb
```
**Check all boxes**: ✓ Production ✓ Preview ✓ Development
Click **"Save"**

---

### Variable 3:
```
Key: INSTANT_ADMIN_TOKEN
Value: 2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c
```
**Check all boxes**: ✓ Production ✓ Preview ✓ Development
Click **"Save"**

---

### Variable 4:
```
Key: NEXT_PUBLIC_ADMIN_EMAIL
Value: your-actual-email@example.com
```
⚠️ **REPLACE** `your-actual-email@example.com` with YOUR real email!
**Check all boxes**: ✓ Production ✓ Preview ✓ Development
Click **"Save"**

---

## Step 6: Redeploy

After adding all 4 variables, go back to your terminal and run:

```bash
npx vercel --prod
```

Or in Vercel dashboard:
1. Go to **"Deployments"** tab
2. Click the three dots on the latest deployment
3. Click **"Redeploy"**

---

## ✅ Checklist

- [ ] Opened https://vercel.com/dashboard
- [ ] Clicked on "otc-platform" project
- [ ] Went to Settings → Environment Variables
- [ ] Added `NEXT_PUBLIC_INSTANT_APP_ID` with all 3 environments
- [ ] Added `INSTANT_APP_ID` with all 3 environments
- [ ] Added `INSTANT_ADMIN_TOKEN` with all 3 environments
- [ ] Added `NEXT_PUBLIC_ADMIN_EMAIL` with YOUR email and all 3 environments
- [ ] Clicked "Save" for each variable
- [ ] Redeployed with `npx vercel --prod`

---

## 🎉 After Adding Variables

Your deployment will succeed and you'll get your live URL!

**The error you're seeing is ONLY because these variables are missing.**

Once you add them, everything will work! 🚀

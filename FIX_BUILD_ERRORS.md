# 🔧 Fix Vercel Build Errors

## Common Build Errors & Solutions

### Error 1: "Module not found" or "Cannot find module"

**Solution**: Missing dependencies

```bash
# Locally
npm install

# Commit and redeploy
git add package-lock.json
git commit -m "Update dependencies"
git push
npx vercel --prod
```

### Error 2: "Environment variable not defined"

**Solution**: Add environment variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Settings → Environment Variables
4. Add all 4 required variables:
   - `NEXT_PUBLIC_INSTANT_APP_ID`
   - `INSTANT_APP_ID`
   - `INSTANT_ADMIN_TOKEN`
   - `NEXT_PUBLIC_ADMIN_EMAIL`
5. Redeploy: `npx vercel --prod`

### Error 3: "Build failed" or "Command failed"

**Solution**: Test build locally first

```bash
# Test the build
npm run build

# If it works locally, redeploy
npx vercel --prod
```

### Error 4: TypeScript errors

**Solution**: Fix TypeScript issues

```bash
# Check for errors
npm run lint

# Fix and redeploy
git add .
git commit -m "Fix TypeScript errors"
git push
npx vercel --prod
```

### Error 5: "ENOENT: no such file or directory"

**Solution**: Missing files

```bash
# Make sure all files are committed
git status
git add .
git commit -m "Add missing files"
git push
npx vercel --prod
```

## Quick Fixes

### Fix 1: Clear Vercel Cache

```bash
npx vercel --force
```

### Fix 2: Rebuild from Scratch

In Vercel dashboard:
1. Go to your project
2. Deployments
3. Click the three dots on latest deployment
4. "Redeploy"
5. Check "Use existing Build Cache" → OFF

### Fix 3: Check Build Logs

1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click the failed deployment
4. Read the error message
5. Copy the error and fix it

## Environment Variables Checklist

Make sure these are set in Vercel:

- [ ] `NEXT_PUBLIC_INSTANT_APP_ID` = `79804a5a-fce5-4e35-8548-a53f8f50c6bb`
- [ ] `INSTANT_APP_ID` = `79804a5a-fce5-4e35-8548-a53f8f50c6bb`
- [ ] `INSTANT_ADMIN_TOKEN` = `2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c`
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL` = `your-actual-email@example.com`

All should have:
- [x] Production
- [x] Preview
- [x] Development

## Test Build Locally

Before redeploying, test locally:

```bash
# Install dependencies
npm install

# Build
npm run build

# If successful, deploy
npx vercel --prod
```

## Still Having Issues?

1. **Check Vercel logs**: https://vercel.com/dashboard
2. **Copy the exact error message**
3. **Share it with me** and I'll help fix it

## Quick Redeploy

```bash
npx vercel --prod --force
```

---

**What's the error message you're seeing?**

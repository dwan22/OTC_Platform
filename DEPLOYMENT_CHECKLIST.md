# ✅ Vercel Deployment Checklist

## Before Deployment

- [x] Git repository initialized
- [x] All files committed
- [x] Vercel CLI installed
- [x] `.vercelignore` file created
- [x] `vercel.json` configuration added
- [ ] Admin email set in `.env` (⚠️ Do this now!)

## Deployment Steps

### Step 1: Set Admin Email (If Not Done)
```bash
# Edit .env and set your email
NEXT_PUBLIC_ADMIN_EMAIL="your-actual-email@example.com"
```

### Step 2: Deploy to Vercel
```bash
npx vercel
```

Follow prompts:
- [ ] Set up and deploy? → `Y`
- [ ] Link to existing project? → `N`
- [ ] Project name? → Press Enter (or custom name)
- [ ] Directory? → Press Enter
- [ ] Modify settings? → `N`

### Step 3: Add Environment Variables

Go to: https://vercel.com/dashboard

1. [ ] Click on your project
2. [ ] Go to **Settings** → **Environment Variables**
3. [ ] Add `NEXT_PUBLIC_INSTANT_APP_ID` = `79804a5a-fce5-4e35-8548-a53f8f50c6bb`
4. [ ] Add `INSTANT_APP_ID` = `79804a5a-fce5-4e35-8548-a53f8f50c6bb`
5. [ ] Add `INSTANT_ADMIN_TOKEN` = `2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c`
6. [ ] Add `NEXT_PUBLIC_ADMIN_EMAIL` = `your-email@example.com` (your actual email!)
7. [ ] Select all environments (Production, Preview, Development) for each
8. [ ] Click Save for each variable

### Step 4: Deploy to Production
```bash
npx vercel --prod
```

### Step 5: Test Your Deployment

1. [ ] Visit your Vercel URL (e.g., `https://your-app.vercel.app`)
2. [ ] Verify redirect to `/login`
3. [ ] Request magic code with your email
4. [ ] Check email for code
5. [ ] Sign in successfully
6. [ ] Visit `/profile`
7. [ ] Verify admin panel shows (if using admin email)
8. [ ] Test all main pages work

### Step 6: Share Your URL

Your permanent URL: `https://your-app.vercel.app`

- [ ] Copy the URL
- [ ] Share with team/users
- [ ] Test from different device/browser

## Post-Deployment

### Monitor Your App
- [ ] Check Vercel dashboard for analytics
- [ ] Monitor deployment logs
- [ ] Watch for any errors

### Admin Panel
- [ ] Sign in as admin
- [ ] Go to `/profile`
- [ ] Monitor users as they sign up

### Future Updates
When you make changes:
```bash
git add .
git commit -m "Your changes"
npm run deploy
```

## Quick Commands

```bash
# Deploy to production
npm run deploy

# Deploy preview (testing)
npm run deploy:preview

# View logs
npx vercel logs

# List deployments
npx vercel ls
```

## Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_INSTANT_APP_ID` | `79804a5a-fce5-4e35-8548-a53f8f50c6bb` | InstantDB app ID (public) |
| `INSTANT_APP_ID` | `79804a5a-fce5-4e35-8548-a53f8f50c6bb` | InstantDB app ID (server) |
| `INSTANT_ADMIN_TOKEN` | `2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c` | InstantDB admin token |
| `NEXT_PUBLIC_ADMIN_EMAIL` | `your-email@example.com` | Admin user email |

## Troubleshooting

### Build Failed
- [ ] Check Vercel build logs
- [ ] Verify all dependencies in `package.json`
- [ ] Test build locally: `npm run build`

### Environment Variables Not Working
- [ ] Verify all 4 variables are added
- [ ] Check spelling is exact
- [ ] Redeploy: `npx vercel --prod`

### Can't Sign In
- [ ] Enable email auth in InstantDB dashboard
- [ ] Verify `NEXT_PUBLIC_INSTANT_APP_ID` is correct
- [ ] Check browser console for errors

### Admin Panel Not Showing
- [ ] Verify `NEXT_PUBLIC_ADMIN_EMAIL` matches your sign-in email
- [ ] Email is case-sensitive
- [ ] Redeploy after adding variable

## Success Criteria

✅ Your deployment is successful when:
- [ ] App loads at Vercel URL
- [ ] Login page works
- [ ] Magic codes are received
- [ ] Sign in works
- [ ] All pages load
- [ ] Admin panel works (for admin email)
- [ ] No console errors

## Documentation

- **VERCEL_QUICK_START.md** - Quick deployment guide
- **DEPLOY_TO_VERCEL.md** - Detailed deployment guide
- **QUICK_REFERENCE.md** - Quick commands reference

## Your URLs

- **Local**: http://localhost:3000
- **Vercel**: `https://your-app.vercel.app` (after deployment)

## Next Steps After Deployment

1. [ ] Test thoroughly
2. [ ] Share URL with users
3. [ ] Monitor admin panel for new users
4. [ ] Set up custom domain (optional)
5. [ ] Configure Vercel analytics (optional)

---

**Ready to deploy?** Start with: `npx vercel`

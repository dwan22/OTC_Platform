# 🌐 Get Your External URL - Quick Guide

## 🚀 Fastest Method: ngrok (Recommended)

### Step 1: Install ngrok

```bash
brew install ngrok
```

Or run the automated script:
```bash
./scripts/setup-ngrok.sh
```

### Step 2: Sign up for ngrok (Free)

1. Visit: https://dashboard.ngrok.com/signup
2. Sign up (it's free!)
3. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken

### Step 3: Configure ngrok

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 4: Start ngrok

Make sure your dev server is running, then in a **new terminal**:

```bash
ngrok http 3000
```

### Step 5: Get Your URL! 🎉

You'll see output like:

```
Forwarding  https://abc123-def456.ngrok-free.app -> http://localhost:3000
```

**Your shareable URL**: `https://abc123-def456.ngrok-free.app`

### Share This URL

✅ Send this URL to anyone
✅ They can access your app
✅ Authentication works automatically
✅ HTTPS enabled by default

## 📋 Quick Commands

```bash
# Terminal 1: Start your app
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000
```

## ⚠️ Important Notes

- **Keep both terminals open** while sharing
- The URL changes each time you restart ngrok (free tier)
- For a permanent URL, upgrade to ngrok paid plan or use Vercel (see below)

## 🎯 Alternative: Vercel (Permanent URL)

For a permanent, production-ready URL:

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Deploy

```bash
vercel
```

### Step 3: Add Environment Variables

In the Vercel dashboard, add:
- `NEXT_PUBLIC_INSTANT_APP_ID`
- `INSTANT_APP_ID`
- `INSTANT_ADMIN_TOKEN`
- `NEXT_PUBLIC_ADMIN_EMAIL`

### Step 4: Get Your URL

Vercel gives you a permanent URL like:
`https://your-app.vercel.app`

## 🔒 Security Checklist

Before sharing:
- ✅ Set your admin email in `.env`
- ✅ Enable email auth in InstantDB dashboard
- ✅ Test login flow works
- ✅ Verify admin panel works
- ✅ All routes require authentication

## 🧪 Testing Your External URL

1. Copy the ngrok URL
2. Open in incognito/private browser
3. Test the login flow
4. Sign in with a test email
5. Verify everything works
6. Share with others!

## 📊 Monitor Users

As admin:
1. Sign in with your admin email
2. Go to `/profile`
3. See all users who have accessed the app
4. Monitor new sign-ups in real-time

## 🆘 Troubleshooting

### ngrok URL not working?
```bash
# Make sure dev server is running
npm run dev

# In new terminal
ngrok http 3000
```

### "Failed to complete tunnel connection"?
- Check your internet connection
- Try restarting ngrok
- Make sure port 3000 is not blocked

### Authentication not working on external URL?
- InstantDB auth works with any domain automatically
- Check that email auth is enabled in InstantDB dashboard
- Test in incognito mode

## 📞 Quick Help

**Current Setup:**
- Local: http://localhost:3000
- External: Get with ngrok or Vercel

**Need Help?**
- ngrok docs: https://ngrok.com/docs
- Vercel docs: https://vercel.com/docs
- See EXTERNAL_ACCESS.md for more options

## ✅ Success Checklist

- [ ] ngrok installed
- [ ] ngrok configured with auth token
- [ ] Dev server running on port 3000
- [ ] ngrok tunnel started
- [ ] External URL copied
- [ ] Tested in incognito mode
- [ ] Ready to share!

---

**Your Next Steps:**
1. Run `brew install ngrok`
2. Sign up at https://dashboard.ngrok.com/signup
3. Configure: `ngrok config add-authtoken YOUR_TOKEN`
4. Start: `ngrok http 3000`
5. Share the URL! 🎉

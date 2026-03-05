# 🚀 Quick Reference Card

## 📍 Your URLs

- **Local**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Profile/Admin**: http://localhost:3000/profile
- **External**: Get with ngrok (see below)

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Get external URL (in new terminal)
ngrok http 3000

# Setup ngrok (automated)
./scripts/setup-ngrok.sh
```

## 🔧 Admin Setup (3 Steps)

1. **Set admin email** in `.env`:
   ```
   NEXT_PUBLIC_ADMIN_EMAIL="your-email@example.com"
   ```

2. **Restart server**:
   ```bash
   npm run dev
   ```

3. **Sign in** and visit `/profile`

## 🌐 Get External URL (3 Steps)

1. **Install ngrok**:
   ```bash
   brew install ngrok
   ```

2. **Configure** (one-time):
   - Sign up: https://dashboard.ngrok.com/signup
   - Get token: https://dashboard.ngrok.com/get-started/your-authtoken
   - Run: `ngrok config add-authtoken YOUR_TOKEN`

3. **Start tunnel**:
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL and share it!

## 👑 Admin Features

**As admin, you can**:
- See "ADMIN" badge on profile
- View all registered users
- See user emails, IDs, and creation dates
- Monitor new sign-ups

**To access**: Sign in with admin email → Visit `/profile`

## 🔒 Security

- ✅ All pages require authentication
- ✅ Only admin sees user list
- ✅ Magic link codes (4-digit)
- ✅ HTTPS with ngrok/Vercel

## 📚 Documentation

- **CHANGES_SUMMARY.md** - What was changed
- **GET_EXTERNAL_URL.md** - Get public URL
- **ADMIN_SETUP.md** - Admin configuration
- **AUTH_CHECKLIST.md** - Testing guide

## 🆘 Quick Fixes

**Not seeing admin panel?**
→ Set `NEXT_PUBLIC_ADMIN_EMAIL` in `.env` and restart

**ngrok not working?**
→ Run `brew install ngrok` and configure auth token

**Can't sign in?**
→ Enable email auth in InstantDB dashboard

## ✅ What Changed

1. Subheader: "Vibe-Coded AI Company"
2. Admin panel: See all users
3. External URL: ngrok setup ready

## 🎯 Your Next Steps

1. [ ] Set admin email in `.env`
2. [ ] Restart dev server
3. [ ] Test admin panel at `/profile`
4. [ ] Install ngrok
5. [ ] Get external URL
6. [ ] Share with others!

---

**Need Help?** See CHANGES_SUMMARY.md for detailed instructions

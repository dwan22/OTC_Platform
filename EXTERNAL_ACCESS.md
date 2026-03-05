# 🌐 External Access Setup

## Option 1: Using ngrok (Recommended for Testing)

ngrok creates a secure tunnel to your localhost, giving you a public URL.

### Setup Steps:

1. **Install ngrok** (if not already installed):
   ```bash
   brew install ngrok
   ```
   
   Or download from: https://ngrok.com/download

2. **Sign up for ngrok** (free):
   - Visit: https://dashboard.ngrok.com/signup
   - Get your auth token

3. **Configure ngrok**:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

4. **Start ngrok tunnel**:
   ```bash
   ngrok http 3000
   ```

5. **Get your public URL**:
   - ngrok will display a URL like: `https://abc123.ngrok.io`
   - Share this URL with anyone
   - They can access your app at: `https://abc123.ngrok.io`

### Important Notes:
- Keep the ngrok terminal window open
- The URL changes each time you restart ngrok (unless you have a paid plan)
- Free tier has some limitations but works great for testing

## Option 2: Using Vercel (Recommended for Production)

Deploy your app to Vercel for a permanent public URL.

### Setup Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow prompts**:
   - Link to existing project or create new
   - Configure settings
   - Deploy!

4. **Get your URL**:
   - Vercel will give you a URL like: `https://your-app.vercel.app`
   - This URL is permanent and free

### Environment Variables:
Make sure to add these in Vercel dashboard:
- `NEXT_PUBLIC_INSTANT_APP_ID`
- `INSTANT_APP_ID`
- `INSTANT_ADMIN_TOKEN`
- `NEXT_PUBLIC_ADMIN_EMAIL`

## Option 3: Using Cloudflare Tunnel (Free Alternative)

1. **Install cloudflared**:
   ```bash
   brew install cloudflare/cloudflare/cloudflared
   ```

2. **Start tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

3. **Get your URL**:
   - Cloudflare will display a public URL
   - Share this URL

## Quick Start with ngrok (Easiest)

```bash
# Install ngrok
brew install ngrok

# Start your Next.js app (if not already running)
npm run dev

# In a new terminal, start ngrok
ngrok http 3000
```

You'll see output like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

**Share this URL**: `https://abc123.ngrok.io`

## Security Considerations

- ✅ All routes require authentication (protected by InstantDB)
- ✅ Only admin can see user list
- ✅ HTTPS enabled by default with ngrok/Vercel
- ⚠️ Don't share your admin email publicly
- ⚠️ Monitor user access in the admin panel

## Testing External Access

1. Start ngrok: `ngrok http 3000`
2. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
3. Open in a different browser or incognito mode
4. Test the login flow
5. Share the URL with others

## Troubleshooting

### ngrok URL not working?
- Make sure your dev server is running on port 3000
- Check that ngrok is pointing to the correct port
- Try restarting both the dev server and ngrok

### Authentication not working on external URL?
- InstantDB auth works automatically with any domain
- Make sure email auth is enabled in InstantDB dashboard
- Check browser console for errors

### Can't access admin panel?
- Make sure you're logged in with the admin email
- Check that `NEXT_PUBLIC_ADMIN_EMAIL` is set correctly in `.env`
- Restart the dev server after changing `.env`

## Current Setup

- **Local URL**: http://localhost:3000
- **Admin Email**: Set in `.env` as `NEXT_PUBLIC_ADMIN_EMAIL`
- **Auth**: InstantDB magic link (4-digit codes)

## Next Steps

1. Choose your preferred method (ngrok for testing, Vercel for production)
2. Follow the setup steps above
3. Get your public URL
4. Share with others
5. Monitor users in the admin panel

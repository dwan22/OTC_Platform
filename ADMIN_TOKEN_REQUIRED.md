# ⚠️ Admin Token Required

## The Error You're Seeing

```
Error [InstantAPIError]: Malformed parameter: ["headers" "authorization"]
```

This means your **InstantDB admin token is not valid**.

## Why This Happens

The token in your `.env` file (`2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c`) is not a valid InstantDB admin token. It looks like a UUID, but InstantDB admin tokens have a different format.

## How to Fix (2 minutes)

### Step 1: Get Your Real Admin Token

1. **Open your InstantDB dashboard:**
   
   👉 https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

2. **Click "Settings"** in the left sidebar (gear icon)

3. **Scroll down to "Admin Tokens"** section

4. **Click "Create Admin Token"** (or copy if one already exists)

5. **Copy the entire token** - it should be a long string

### Step 2: Update Your .env File

Open `.env` and replace the current token:

**Current (WRONG):**
```bash
INSTANT_ADMIN_TOKEN="2f95c8af-6d31-4ba2-8215-91b0a1ea3b6c"
```

**Replace with (CORRECT):**
```bash
INSTANT_ADMIN_TOKEN="your_actual_admin_token_from_dashboard"
```

### Step 3: Restart the Dev Server

```bash
# Kill the current server
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

### Step 4: Verify It Works

Open http://localhost:3000

You should now see:
- ✅ Dashboard loads without errors
- ✅ Metrics display correctly
- ✅ Charts render
- ✅ Recent invoices appear

## Still Having Issues?

### Can't Find Admin Tokens in Dashboard?

1. Make sure you're logged in to InstantDB
2. Select your app (ID: `79804a5a-fce5-4e35-8548-a53f8f50c6bb`)
3. Look for the Settings tab (gear icon)
4. Admin Tokens should be near the bottom of the Settings page

### Token Doesn't Work?

1. Make sure you copied the **entire token** (they can be quite long)
2. Make sure there are **no extra spaces** before or after the token
3. Make sure the token is wrapped in **quotes** in the `.env` file
4. Try **regenerating** a new token if the old one doesn't work

### Need to Push Schema First?

If you haven't pushed your schema yet:

```bash
npx instant-cli push schema
```

This creates all the database entities in InstantDB.

### Need Sample Data?

After pushing the schema, seed the database:

```bash
npm run db:seed
```

This creates 15 customers, contracts, invoices, etc.

## What the Admin Token Does

The admin token allows your **backend API routes** to:
- Query data from InstantDB
- Create/update/delete records
- Perform complex calculations
- Generate reports

Without it, all API routes will fail with authentication errors.

## Security Note

⚠️ **Never commit your admin token to git!**

The `.env` file is already in `.gitignore`, so it won't be committed. Keep your admin token secret!

## Quick Checklist

- [ ] Opened InstantDB dashboard
- [ ] Found Settings → Admin Tokens
- [ ] Created/copied admin token
- [ ] Updated `.env` file
- [ ] Restarted dev server
- [ ] Dashboard loads successfully

---

**Next**: Get your admin token from the dashboard and update `.env`! 🔑

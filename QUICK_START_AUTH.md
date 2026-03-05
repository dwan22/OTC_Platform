# Quick Start: InstantDB Authentication

## ✅ What's Been Set Up

Your OTC Platform now has complete authentication with InstantDB magic links!

### Features Added:
- 🔐 Magic link authentication with **4-digit codes**
- 📧 Email-based sign-in (no passwords needed)
- 🛡️ Protected routes - all pages require authentication
- 👤 User menu with sign-out functionality
- 🎨 Beautiful, modern login UI

## 🚀 How to Use

### 1. Access the Application

Visit: **http://localhost:3000**

You'll automatically be redirected to the login page if not authenticated.

### 2. Sign In

1. Enter your email address
2. Click "Send Magic Code"
3. Check your email for a **4-digit verification code**
4. Enter the code on the login page
5. Click "Verify & Sign In"

You'll be redirected to the dashboard!

### 3. Navigate the App

All these pages are now protected and require authentication:
- **Dashboard** - `/`
- **Customers** - `/customers`
- **Contracts** - `/contracts`
- **Subscription Tiers** - `/tiers`
- **Invoices** - `/billing/invoices`
- **Reports** - `/reports/*`

### 4. Sign Out

Click your email in the top-right corner and select "Sign Out"

## ⚙️ Configuration Required

### Enable Email Auth in InstantDB

1. Go to your InstantDB dashboard:
   ```
   https://instantdb.com/dash?s=main&t=auth&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb
   ```

2. Navigate to the **Auth** tab

3. Enable **Email** authentication

4. Configure email settings:
   - Sender name (e.g., "OTC Platform")
   - Reply-to email
   - Code expiration time (optional)

5. Save changes

## 📝 Important Notes

### Code Length
- The UI is configured for **4-digit codes**
- However, InstantDB may send 6-digit codes by default
- The actual code length is controlled by InstantDB's backend
- The UI will accept whatever code length InstantDB sends

### First Time Setup
- The first time you sign in, InstantDB will create a user account
- No registration page needed - accounts are created on first login
- User data is stored in InstantDB automatically

### Email Delivery
- Codes are sent via InstantDB's email service
- Check your spam folder if you don't receive the code
- Codes typically arrive within seconds
- Codes expire after a few minutes for security

## 🔧 Troubleshooting

### Not Receiving Codes?
1. Check spam/junk folder
2. Verify email authentication is enabled in InstantDB dashboard
3. Try a different email address
4. Check InstantDB dashboard for email delivery logs

### Stuck on Login Page?
1. Open browser console (F12) to check for errors
2. Verify `NEXT_PUBLIC_INSTANT_APP_ID` in `.env` is correct
3. Clear browser cache and cookies
4. Restart the dev server

### "Invalid Code" Error?
1. Make sure you're entering the exact code from the email
2. Codes expire quickly - request a new one if needed
3. Click "Resend code" to get a fresh code

## 📂 Key Files

```
app/
├── (protected)/              # All protected pages
│   └── layout.tsx           # Sidebar + user menu
├── login/
│   └── page.tsx             # Login page
└── layout.tsx               # Root with AuthProvider

components/
├── auth/
│   ├── auth-provider.tsx    # Auth context
│   └── protected-route.tsx  # Route protection
└── layout/
    └── user-menu.tsx        # User dropdown

lib/
└── instant.ts               # InstantDB client
```

## 🎯 Next Steps

- [ ] Enable email authentication in InstantDB dashboard
- [ ] Test the login flow
- [ ] Customize the login page styling (optional)
- [ ] Add user profile features (optional)
- [ ] Configure email templates in InstantDB (optional)

## 📚 More Information

See `AUTH_SETUP.md` for detailed documentation including:
- Architecture overview
- API reference
- Customization options
- Security notes
- Advanced features

## 🆘 Need Help?

- InstantDB Docs: https://instantdb.com/docs
- InstantDB Discord: https://discord.gg/instantdb
- Check browser console for error messages

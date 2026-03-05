# InstantDB Authentication Setup

This OTC Platform now includes InstantDB authentication with magic link (email code) sign-in.

## Features

- **Magic Link Authentication**: Users receive a 6-digit verification code via email
- **Protected Routes**: All main application routes require authentication
- **User Session Management**: Automatic session handling with InstantDB
- **Modern UI**: Beautiful, responsive login page with loading states

## How It Works

### 1. Login Flow

1. User enters their email address at `/login`
2. InstantDB sends a 6-digit verification code to their email
3. User enters the code to verify and sign in
4. User is redirected to the dashboard

### 2. Protected Routes

All routes under `app/(protected)/` require authentication:
- Dashboard (`/`)
- Customers (`/customers`)
- Contracts (`/contracts`)
- Subscription Tiers (`/tiers`)
- Invoices (`/billing/invoices`)
- All Reports (`/reports/*`)

### 3. User Menu

Once authenticated, users can:
- View their email in the top-right user menu
- Sign out from the dropdown menu

## Setup Instructions

### 1. Configure InstantDB Auth (if not already done)

Go to your InstantDB dashboard and enable email authentication:

1. Visit: https://instantdb.com/dash?s=main&t=auth&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb
2. Enable "Email" authentication method
3. Configure email settings (sender name, etc.)

### 2. Test the Authentication

1. Start the dev server: `npm run dev`
2. Visit: http://localhost:3000
3. You'll be redirected to `/login`
4. Enter your email address
5. Check your email for the 6-digit code
6. Enter the code to sign in

## File Structure

```
app/
├── (protected)/              # Protected route group
│   ├── layout.tsx           # Layout with sidebar and user menu
│   ├── page.tsx             # Dashboard (protected)
│   ├── customers/           # Customer pages (protected)
│   ├── contracts/           # Contract pages (protected)
│   ├── tiers/               # Tier pages (protected)
│   ├── billing/             # Billing pages (protected)
│   └── reports/             # Report pages (protected)
├── login/
│   └── page.tsx             # Login page (public)
└── layout.tsx               # Root layout with AuthProvider

components/
├── auth/
│   ├── auth-provider.tsx    # Auth context provider
│   └── protected-route.tsx  # Protected route wrapper
└── layout/
    └── user-menu.tsx        # User menu with sign out

lib/
├── instant.ts               # InstantDB client initialization
└── db.ts                    # Database exports
```

## API Reference

### useAuth Hook

```tsx
import { useAuth } from '@/components/auth/auth-provider'

function MyComponent() {
  const { user, isLoading, error, signOut } = useAuth()
  
  // user: Current authenticated user object (null if not signed in)
  // isLoading: Boolean indicating if auth state is loading
  // error: Any authentication errors
  // signOut: Function to sign out the current user
}
```

### InstantDB Auth Methods

```tsx
import { db } from '@/lib/instant'

// Send magic code
await db.auth.sendMagicCode({ email: 'user@example.com' })

// Sign in with code
await db.auth.signInWithMagicCode({ 
  email: 'user@example.com', 
  code: '123456' 
})

// Sign out
db.auth.signOut()
```

## Customization

### Change Code Length

InstantDB uses 6-digit codes by default. To customize the UI for 4-digit codes, update the login page:

```tsx
// In app/login/page.tsx
<input
  maxLength={4}  // Change from 6 to 4
  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
/>

// Update validation
disabled={isLoading || code.length !== 4}
```

Note: The actual code length is controlled by InstantDB's backend configuration.

### Customize Login Page

Edit `app/login/page.tsx` to customize:
- Colors and styling
- Logo and branding
- Success/error messages
- Loading states

### Add User Profile

To display more user information, you can extend the InstantDB schema with a users entity and link it to the auth system.

## Security Notes

- All authentication is handled securely by InstantDB
- Magic codes expire after a short time
- Sessions are managed automatically
- Protected routes redirect unauthenticated users to login
- Sign out clears the session completely

## Troubleshooting

### "Failed to send code"
- Check that email authentication is enabled in InstantDB dashboard
- Verify your InstantDB app ID is correct in `.env`

### "Invalid code"
- Codes expire after a few minutes
- Make sure to enter the code exactly as received
- Try requesting a new code with "Resend code"

### Redirected to login on every page load
- Check browser console for errors
- Verify `NEXT_PUBLIC_INSTANT_APP_ID` is set correctly
- Clear browser cache and cookies

## Next Steps

- Add user profile management
- Implement role-based access control
- Add OAuth providers (Google, GitHub, etc.)
- Customize email templates in InstantDB dashboard
- Add "Remember me" functionality

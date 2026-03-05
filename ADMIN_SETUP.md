# 👑 Admin Setup Guide

## Quick Setup

### 1. Set Your Admin Email

Open `.env` and replace `your-email@example.com` with your actual email:

```bash
NEXT_PUBLIC_ADMIN_EMAIL="your-actual-email@example.com"
```

**Important**: Use the exact email you'll sign in with!

### 2. Restart the Dev Server

After changing `.env`, restart your server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### 3. Sign In as Admin

1. Go to http://localhost:3000
2. Sign in with your admin email
3. Visit http://localhost:3000/profile
4. You should see the "ADMIN" badge and the Admin Panel

## Admin Features

### What Admins Can See

- ✅ **Admin Badge**: Yellow "ADMIN" badge next to your name
- ✅ **User List**: Table showing all registered users
- ✅ **User Details**: Email, User ID, creation date, status
- ✅ **User Count**: Total number of users

### Admin Panel Features

The admin panel shows:
- Email addresses of all users
- User IDs
- Account creation dates
- Active status
- Special badges (Admin, You)

### Non-Admin Users

Regular users will see:
- Their own profile information
- Authentication status
- User object (for debugging)
- **No access to user list**

## Testing Admin Access

### Test as Admin:
1. Sign in with your admin email
2. Go to `/profile`
3. You should see the Admin Panel with user list

### Test as Regular User:
1. Sign out
2. Sign in with a different email
3. Go to `/profile`
4. You should NOT see the Admin Panel

## Security

- ✅ Admin email is checked on the client side
- ✅ Only the admin email can see the user list
- ✅ Admin status is determined by environment variable
- ✅ All users must authenticate to access any page

## Changing Admin

To change the admin user:

1. Update `NEXT_PUBLIC_ADMIN_EMAIL` in `.env`
2. Restart the dev server
3. Sign in with the new admin email

## Multiple Admins (Optional)

To add multiple admins, you can modify the check in `app/(protected)/profile/page.tsx`:

```typescript
// Current (single admin):
const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL

// Multiple admins:
const adminEmails = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'second-admin@example.com',
  'third-admin@example.com'
]
const isAdmin = adminEmails.includes(user?.email)
```

## Troubleshooting

### Not seeing Admin Panel?
- Check that `NEXT_PUBLIC_ADMIN_EMAIL` is set in `.env`
- Make sure you restarted the dev server after changing `.env`
- Verify you're signed in with the exact admin email
- Check for typos in the email address

### User list is empty?
- Users only appear after they sign in at least once
- Try signing in with a different email to test
- Check browser console for errors

### Admin badge not showing?
- Clear browser cache
- Sign out and sign in again
- Check that the email matches exactly (case-sensitive)

## What's Changed

1. ✅ Subheader changed to "Vibe-Coded AI Company"
2. ✅ Admin email configured in `.env`
3. ✅ Admin panel added to profile page
4. ✅ User list visible only to admin
5. ✅ Admin badge displayed for admin user

## Next Steps

1. Set your admin email in `.env`
2. Restart the dev server
3. Sign in and visit `/profile`
4. Test the admin panel
5. Share the app URL (see EXTERNAL_ACCESS.md)

# Setup Instructions - InstantDB OTC Platform

Follow these steps to get your OTC Platform running with InstantDB.

## Prerequisites

- Node.js 20 or higher
- An InstantDB account (free at https://instantdb.com)

## Step-by-Step Setup

### Step 1: Get Your InstantDB Admin Token

This is the **most important step**!

1. Go to your InstantDB dashboard:
   https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

2. Click on "Settings" in the left sidebar

3. Scroll down to "Admin Tokens" section

4. Click "Create Admin Token" (or copy existing one)

5. Copy the token - it looks like: `admin_xxxxxxxxxxxxxxxxxxxxxxxx`

⚠️ **IMPORTANT**: Keep this token secret! Don't commit it to git.

### Step 2: Update Environment Variables

Open the `.env` file and replace `YOUR_ADMIN_TOKEN_HERE`:

```bash
NEXT_PUBLIC_INSTANT_APP_ID="79804a5a-fce5-4e35-8548-a53f8f50c6bb"
INSTANT_APP_ID="79804a5a-fce5-4e35-8548-a53f8f50c6bb"
INSTANT_ADMIN_TOKEN="admin_YOUR_ACTUAL_TOKEN_HERE"  # ← Paste your token here
NODE_ENV="development"
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16 with Turbopack
- React 19
- InstantDB SDK
- All UI components and dependencies

### Step 4: Push Schema to InstantDB

```bash
npx instant-cli push schema
```

You'll see output like:

```
Planning schema...
The following changes will be applied to your production schema:
ADD ENTITY customers.id
ADD ENTITY contracts.id
...
OK to proceed? yes
Schema updated!
```

This creates all your database tables (entities) and relationships in InstantDB.

### Step 5: Seed Sample Data

```bash
npm run db:seed
```

This creates:
- 15 customers (Startup Co, Growth Corp, Enterprise Inc, etc.)
- 15 active contracts with various tiers
- 6 months of invoices and payments
- Revenue recognition schedules
- Journal entries
- AR reserves

You'll see:

```
🌱 Starting InstantDB seed...
Creating subscription tiers...
Creating customers...
Creating contracts...
...
✅ Seed completed successfully!
```

### Step 6: Start the Development Server

```bash
npm run dev
```

You'll see:

```
▲ Next.js 16.1.6 (Turbopack)
- Local:        http://localhost:3000
- Experiments:  serverActions

✓ Starting...
✓ Ready in 1.2s
```

### Step 7: Open the Application

Navigate to: **http://localhost:3000**

You should see the Executive Dashboard with:
- ARR and MRR metrics
- Active customer count
- AR aging summary
- Recent invoices

## Verify Everything Works

### Test 1: View Customers

1. Click "Customers" in the sidebar
2. You should see 15 customers listed
3. Click on "Enterprise Inc"
4. View their contracts, invoices, and payments

### Test 2: Check Reports

1. Go to "Reports" → "AR Aging"
2. Verify aging buckets show data
3. Check reserve calculations

### Test 3: Real-time Updates

1. Open http://localhost:3000 in two browser windows
2. In Window 1, go to Customers
3. In Window 2, stay on Dashboard
4. Click "New Customer" in Window 1
5. Fill out the form and submit
6. Watch the customer count update in Window 2 instantly!

## Common Issues

### Issue: "INSTANT_ADMIN_TOKEN environment variable is required"

**Solution**: You forgot to add your admin token to `.env`. Go back to Step 1 and Step 2.

### Issue: Schema push fails with "Not authenticated"

**Solution**: Login to InstantDB CLI:

```bash
npx instant-cli login
```

Then try again:

```bash
npm run schema:push
```

### Issue: Seed script fails

**Solution**: Make sure schema is pushed first:

```bash
npm run schema:push
npm run db:seed
```

### Issue: Port 3000 already in use

**Solution**: Kill the process and restart:

```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

### Issue: Module not found errors

**Solution**: Clean install:

```bash
rm -rf node_modules package-lock.json .next
npm install
```

## What to Explore

### 1. Dashboard (/)
- Real-time ARR/MRR metrics
- MRR trend chart
- AR aging visualization
- Recent invoice activity

### 2. Customers (/customers)
- Customer directory
- Create new customers
- View customer details with tabs for contracts, invoices, payments

### 3. Contracts (/contracts)
- All subscription contracts
- Custom pricing examples
- Volume rebate terms
- Revenue recognition schedules

### 4. Billing
- **Invoices** (/billing/invoices): All invoices with payment status
- **Payments** (/billing/payments): Payment history and methods

### 5. Reports
- **AR Aging** (/reports/ar-aging): Aging analysis with reserves
- **Revenue Recognition** (/reports/revenue-recognition): ASC 606 schedules
- **Balance Sheet** (/reports/balance-sheet): Reconciliation and trial balance
- **P&L Flux** (/reports/pnl-flux): Budget vs actual analysis

## Sample Data Highlights

### Volume Rebate Example
- Customer: **Strategic Partners LLC**
- Contract: 150 subscriptions
- Rebate tiers:
  - 50+ subs: 5% discount
  - 100+ subs: 10% discount
  - 200+ subs: 15% discount

### Custom Pricing Example
- Customer: **Enterprise Inc**
- Custom pricing: $2,699/month (vs $2,999 standard)
- Volume rebate: 10% at 100+ subscriptions

### Overdue Invoices
- Several invoices are overdue to demonstrate AR aging
- Some have partial payments
- Reserve calculations reflect aging

## Next Steps

### 1. Customize for Your Business

Edit `instant.schema.ts` to add:
- Custom fields
- Additional entities
- New relationships

Then push changes:

```bash
npm run schema:push
```

### 2. Add More Sample Data

Edit `scripts/seed.ts` to:
- Add more customers
- Create different contract scenarios
- Test edge cases

Then re-seed:

```bash
npm run db:seed
```

### 3. Deploy to Production

#### Option A: Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_INSTANT_APP_ID`
   - `INSTANT_APP_ID`
   - `INSTANT_ADMIN_TOKEN`
4. Deploy!

#### Option B: Other Platforms

Works on any platform supporting Next.js 16:
- Netlify
- Railway
- Render
- AWS Amplify

### 4. Secure Your App

Update `instant.perms.ts` to add proper permissions:

```typescript
const rules = {
  customers: {
    allow: {
      view: 'auth.id != null',  // Only authenticated users
      create: 'auth.role == "admin"',  // Only admins can create
      update: 'auth.role == "admin"',
      delete: 'false',  // No one can delete
    },
  },
  // ... other entities
}
```

Push permissions:

```bash
npx instant-cli push perms
```

## Development Commands

```bash
# Start dev server with Turbopack (fast!)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push schema changes
npm run schema:push

# Seed database
npm run db:seed

# Run linter
npm run lint
```

## InstantDB Dashboard Features

Visit: https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

From the dashboard you can:
- 📊 Browse all your data
- 🔍 Run queries
- ✏️ Edit records manually
- 📈 View usage metrics
- 🔐 Manage permissions
- 🔑 Generate admin tokens
- 📝 Update schema

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│           Next.js 16 (Turbopack)                │
├─────────────────────────────────────────────────┤
│  Client Components (Real-time)                  │
│  - Direct InstantDB queries                     │
│  - Optimistic updates                           │
│  - Live synchronization                         │
├─────────────────────────────────────────────────┤
│  API Routes (Server-side)                       │
│  - Complex calculations                         │
│  - InstantDB Admin SDK                          │
│  - Financial analytics                          │
├─────────────────────────────────────────────────┤
│  Business Logic Layer                           │
│  - Revenue recognition (ASC 606)                │
│  - AR aging calculations                        │
│  - Forecasting (ARR/MRR)                        │
│  - Journal entry generation                     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              InstantDB Cloud                    │
│  - Real-time database                           │
│  - Type-safe queries                            │
│  - Automatic sync                               │
│  - Offline support                              │
└─────────────────────────────────────────────────┘
```

## Key Accounting Features

All accounting features from the PostgreSQL version are preserved:

✅ **ASC 606 Revenue Recognition**
- Performance obligation tracking
- Monthly revenue schedules
- Deferred revenue management

✅ **AR Aging Analysis**
- Standard aging buckets
- Reserve calculations by bucket
- Bad debt expense forecasting

✅ **Financial Reporting**
- Balance sheet reconciliation
- Trial balance
- P&L flux analysis
- Subledger to GL reconciliation

✅ **Journal Entries**
- Automatic GL posting
- Complete audit trail
- Double-entry bookkeeping

## Migration Benefits

### Developer Experience
- 🚀 **10x faster** development with Turbopack
- 🎯 **Type-safe** queries with full intellisense
- 🔄 **Real-time** updates without polling
- 🛠️ **Simpler** architecture, less boilerplate

### Deployment
- ☁️ **Serverless** - no database to manage
- 💰 **Lower costs** - no database hosting
- 🌍 **Global CDN** - fast everywhere
- 📈 **Auto-scaling** - handles any load

### User Experience
- ⚡ **Instant updates** across all users
- 📱 **Offline support** - works without internet
- 🎨 **Smooth UI** - optimistic updates
- 🔄 **Live collaboration** - see changes in real-time

## Need Help?

- **InstantDB Docs**: https://instantdb.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Your App Dashboard**: https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

Happy coding! 🎉

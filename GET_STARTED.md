# 🚀 Get Started with Your OTC Platform

Your Order-to-Cash platform has been successfully migrated to **InstantDB** and upgraded to **Next.js 16**!

## ⚡ Quick Start (3 Steps)

### 1️⃣ Get Your Admin Token

Visit your InstantDB dashboard:
👉 https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

1. Click **"Settings"** in the left sidebar
2. Scroll to **"Admin Tokens"**
3. Click **"Create Admin Token"** (or copy existing)
4. Copy the token (starts with `admin_...`)

### 2️⃣ Add Token to .env

Open `.env` and replace `YOUR_ADMIN_TOKEN_HERE`:

```bash
INSTANT_ADMIN_TOKEN="admin_paste_your_token_here"
```

### 3️⃣ Run These Commands

```bash
# Push schema to InstantDB
npx instant-cli push schema

# Seed with sample data
npm run db:seed

# Start the app
npm run dev
```

Open http://localhost:3000 and you're done! 🎉

## What You Get

### Real-time Features
- ⚡ **Instant updates** across all users
- 📱 **Offline support** - works without internet
- 🔄 **Live sync** - no manual refresh needed
- 🎯 **Type-safe** - full TypeScript intellisense

### Accounting Features
- 📊 **ASC 606 Revenue Recognition** - GAAP compliant
- 📈 **AR Aging Analysis** - with reserve calculations
- 💰 **Balance Sheet Reconciliation** - subledger to GL
- 📉 **P&L Flux Analysis** - budget vs actual
- 📝 **Journal Entries** - complete audit trail

### Sample Data Included
- 15 customers across different industries
- 15 active contracts with various tiers
- 6 months of invoices and payments
- Volume rebate examples
- Custom pricing scenarios
- Overdue invoices for aging analysis

## Tech Stack Highlights

- **Next.js 16** - Latest version with Turbopack (5-10x faster)
- **React 19** - Newest React features
- **InstantDB** - Real-time, serverless database
- **TypeScript** - Full type safety
- **Tailwind CSS** - Modern, responsive design
- **Shadcn/ui** - Beautiful component library
- **Recharts** - Financial visualizations

## Explore the Platform

### Dashboard (/)
Real-time metrics: ARR, MRR, active customers, AR aging

### Customers (/customers)
- View all customers
- Create new customers (real-time form)
- See contracts, invoices, payments per customer

### Contracts (/contracts)
- Subscription agreements
- Custom pricing and rebates
- Revenue recognition schedules

### Billing
- **Invoices** (/billing/invoices): Track all invoices
- **Payments** (/billing/payments): Payment history

### Reports
- **AR Aging** (/reports/ar-aging): Aging buckets with reserves
- **Revenue Recognition** (/reports/revenue-recognition): ASC 606 schedules
- **Balance Sheet** (/reports/balance-sheet): Reconciliation
- **P&L Flux** (/reports/pnl-flux): Variance analysis

## Test Real-time Updates

1. Open http://localhost:3000 in **two browser windows**
2. Window 1: Go to Customers
3. Window 2: Stay on Dashboard
4. Window 1: Click "New Customer" and create one
5. Window 2: Watch the customer count update **instantly**!

This is the power of InstantDB - no polling, no refresh needed.

## Deployment

### Vercel (One-Click Deploy)

1. Push to GitHub
2. Import in Vercel
3. Add these environment variables:
   - `NEXT_PUBLIC_INSTANT_APP_ID` = `79804a5a-fce5-4e35-8548-a53f8f50c6bb`
   - `INSTANT_APP_ID` = `79804a5a-fce5-4e35-8548-a53f8f50c6bb`
   - `INSTANT_ADMIN_TOKEN` = your admin token
4. Deploy!

No database configuration needed - InstantDB handles everything.

## Need Help?

### Documentation
- 📚 [InstantDB Docs](https://instantdb.com/docs)
- 📚 [Next.js 16 Docs](https://nextjs.org/docs)

### Your Dashboard
- 🎛️ [InstantDB Dashboard](https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb)

### Detailed Guides
- `SETUP_INSTRUCTIONS.md` - Step-by-step setup
- `MIGRATION_COMPLETE.md` - What changed and why
- `README.md` - Complete feature documentation
- `QUICKSTART.md` - Quick reference guide

## Troubleshooting

**Problem**: "INSTANT_ADMIN_TOKEN environment variable is required"
**Solution**: Get your admin token from the dashboard (see Step 1 above)

**Problem**: Schema push fails
**Solution**: Login first: `npx instant-cli login`

**Problem**: Seed fails
**Solution**: Push schema first: `npm run schema:push`

**Problem**: Build errors
**Solution**: Clean install: `rm -rf .next node_modules && npm install`

## What's Different from PostgreSQL?

### Before
- 🐌 Docker containers to manage
- 🐌 PostgreSQL installation required
- 🐌 Manual database migrations
- 🐌 No real-time updates
- 🐌 Complex deployment

### After
- ⚡ No containers needed
- ⚡ Zero database setup
- ⚡ Automatic schema sync
- ⚡ Real-time by default
- ⚡ Deploy in seconds

## Performance

- **Turbopack**: 5-10x faster Fast Refresh
- **React 19**: Improved rendering performance
- **InstantDB**: Optimistic updates feel instant
- **Static Generation**: Pre-rendered pages load fast

## Security

- ✅ Admin token is in `.env` (not committed to git)
- ✅ Permissions configured in `instant.perms.ts`
- ✅ Type-safe queries prevent injection attacks
- ✅ HTTPS by default on InstantDB

## Next Steps

1. **Get your admin token** (see Step 1 above)
2. **Run the setup commands** (see Step 3 above)
3. **Explore the platform** at http://localhost:3000
4. **Deploy to production** when ready!

---

**Ready to go?** Just follow the 3 steps at the top! 🚀

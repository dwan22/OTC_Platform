# Quick Start Guide

Get the OTC Platform running in under 3 minutes with InstantDB!

## Prerequisites

- Node.js 20+
- An InstantDB account (the app is already configured)

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Push Schema to InstantDB

```bash
npx instant-cli push schema
```

When prompted:
- Login to InstantDB if needed
- Confirm the schema changes
- The CLI will create all entities and relationships

### 3. Seed the Database

```bash
npm run db:seed
```

This creates:
- 15 sample customers
- 15 active contracts
- 6 months of invoices and payments
- Revenue recognition schedules
- Journal entries
- AR reserves

### 4. Start the Development Server

```bash
npm run dev
```

The app will start with **Turbopack** for ultra-fast hot reload!

### 5. Open the Application

Navigate to: **http://localhost:3000**

## What's Different from PostgreSQL Version?

### ✅ Advantages

1. **No Database Setup**: No Docker, no PostgreSQL installation
2. **Real-time Updates**: Changes sync instantly across all users
3. **Simpler Deployment**: Just deploy to Vercel, no database hosting needed
4. **Type-safe**: Full TypeScript support with schema
5. **Offline Support**: Works without internet, syncs when reconnected
6. **Faster Development**: Turbopack + InstantDB = blazing fast

### 🔄 Changes

1. **Database**: PostgreSQL → InstantDB
2. **ORM**: Prisma → InstantDB queries
3. **Next.js**: 14.2 → 16.1 (with Turbopack)
4. **React**: 18 → 19
5. **Deployment**: Docker → Serverless (Vercel/Netlify)

## Explore the Features

### 1. Executive Dashboard (/)
- Real-time ARR and MRR metrics
- MRR growth trends
- AR aging summary
- Recent invoice activity

### 2. Customer Management (/customers)
- View customer details
- Track contracts and billing
- Monitor payment history
- **Real-time updates** when data changes

### 3. Revenue Recognition (/reports/revenue-recognition)
- ASC 606 compliant schedules
- Deferred revenue tracking
- Monthly recognition trends
- Performance obligation status

### 4. AR Aging Analysis (/reports/ar-aging)
- Aging buckets with reserve calculations
- Customer-level aging detail
- Reserve coverage ratios
- Collection effectiveness metrics

### 5. Balance Sheet Reconciliation (/reports/balance-sheet)
- AR subledger reconciliation
- Deferred revenue roll-forward
- Trial balance
- Variance analysis

### 6. P&L Flux Analysis (/reports/pnl-flux)
- Budget vs actual comparison
- Variance explanations
- Revenue and expense trends
- Net income analysis

## Sample Scenarios to Test

### Volume Rebates
1. Go to Customers
2. Click on "Strategic Partners LLC"
3. View Contracts tab
4. See tiered rebates (5%, 10%, 15%)

### AR Aging
1. Go to Reports > AR Aging
2. See invoices in different aging buckets
3. View reserve calculations (1% to 60% by bucket)
4. Check customer-level detail

### Revenue Recognition
1. Go to Reports > Revenue Recognition
2. See monthly recognition schedules
3. Track deferred revenue balance
4. View ASC 606 compliance

### Financial Reconciliation
1. Go to Reports > Balance Sheet
2. View subledger to GL reconciliation
3. Check for variances (should be $0)
4. Review trial balance

## Real-time Demo

To see real-time updates in action:

1. Open the app in two browser windows
2. In one window, navigate to Customers
3. In another window, open the Dashboard
4. Make changes in one window
5. Watch updates appear instantly in the other!

## InstantDB Dashboard

View and manage your data directly:

https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

From the dashboard you can:
- Browse all entities and data
- Run queries
- Update schema
- Manage permissions
- View usage metrics

## Development with Turbopack

Next.js 16 includes Turbopack as the default bundler:

- **5-10x faster** Fast Refresh
- **2-5x faster** builds
- Better error messages
- Improved caching

Just run `npm run dev` and enjoy the speed!

## Troubleshooting

### Schema push fails

```bash
# Login to InstantDB
npx instant-cli login

# Push schema again
npm run schema:push
```

### Seed script fails

Make sure schema is pushed first:
```bash
npm run schema:push
npm run db:seed
```

### Module not found errors

```bash
rm -rf node_modules package-lock.json .next
npm install
```

### Port already in use

```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

## Next Steps

1. **Explore the codebase**
   - Check `lib/` for business logic
   - Review `app/` for page components
   - Examine `instant.schema.ts` for data model

2. **Customize for your needs**
   - Modify subscription tiers
   - Adjust reserve percentages
   - Add custom reports

3. **Deploy to production**
   - Push to GitHub
   - Connect to Vercel
   - Deploy with one click
   - No database configuration needed!

## Key Files

- `instant.schema.ts` - Database schema definition
- `instant.perms.ts` - Permissions configuration
- `lib/db.ts` - InstantDB client setup
- `lib/instant-backend.ts` - Backend query utilities
- `scripts/seed.ts` - Sample data generator

## Performance Tips

1. **Use indexes**: Already configured for common queries
2. **Batch transactions**: Group multiple updates together
3. **Optimize queries**: Only fetch needed fields
4. **Cache API routes**: Use Next.js caching when appropriate

## Support

- **InstantDB Docs**: https://instantdb.com/docs
- **Next.js 16 Docs**: https://nextjs.org/docs
- **Code Comments**: Inline documentation throughout

Enjoy your real-time Order-to-Cash platform! 🚀

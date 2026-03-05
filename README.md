# OTC Platform - Order to Cash Management System

A comprehensive Order-to-Cash platform built for AI subscription businesses, featuring ASC 606 compliant revenue recognition, AR aging analysis, and complete financial reporting. Now powered by **InstantDB** for real-time data synchronization and **Next.js 16** with Turbopack.

## Features

### CRM & Customer Management
- Customer master data with billing contacts and payment terms
- Subscription tier management (Basic, Pro, Enterprise)
- Custom contract terms with volume-based rebates
- Contract lifecycle tracking and renewal management
- **Real-time updates** across all users

### Billing & Collections
- Automated invoice generation based on subscription tiers
- Custom pricing for high-profile customers
- Volume rebate calculations and application
- Payment tracking and allocation
- Dunning management for overdue accounts

### Revenue Recognition (ASC 606 Compliant)
- Performance obligation identification
- Transaction price allocation
- Revenue schedule creation with monthly recognition
- Deferred revenue tracking and roll-forward
- Contract modification handling
- Automated journal entry generation

### Balance Sheet Reconciliation
- Accounts Receivable subledger
- Deferred Revenue subledger
- Automatic GL posting
- Month-end close automation
- Reconciliation reports with variance analysis

### AR Aging Analysis
- Standard aging buckets: Current, 1-30, 31-60, 61-90, 90+ days
- Reserve calculations by bucket (1%, 5%, 15%, 35%, 60%)
- Bad debt expense forecasting
- Collection effectiveness tracking
- Customer risk scoring

### Financial Forecasting & Analytics
- Annual Recurring Revenue (ARR) tracking
- Monthly Recurring Revenue (MRR) trends
- Customer Lifetime Value (LTV) calculations
- Churn analysis
- Revenue waterfall analysis
- P&L flux analysis (budget vs actual with variance explanations)

## Tech Stack

- **Frontend**: Next.js 16 with App Router, React 19, Turbopack
- **Database**: InstantDB (real-time, serverless)
- **Styling**: Tailwind CSS with Shadcn/ui components
- **Backend**: Next.js API Routes with InstantDB Admin SDK
- **Charts**: Recharts for financial visualizations
- **Forms**: React Hook Form with Zod validation

## Why InstantDB?

- **Real-time synchronization**: All users see updates instantly
- **No database setup**: Serverless, fully managed
- **Type-safe**: Full TypeScript support with schema
- **Offline-first**: Works without internet connection
- **Simple API**: Intuitive queries and transactions

## Getting Started

### Prerequisites

- Node.js 20+
- An InstantDB account (free at https://instantdb.com)

### Quick Start

1. **Clone and navigate to the project**
   ```bash
   cd "OTC Platform"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your InstantDB app**
   
   The `.env` file is already configured with your app ID:
   ```
   NEXT_PUBLIC_INSTANT_APP_ID="79804a5a-fce5-4e35-8548-a53f8f50c6bb"
   INSTANT_APP_ID="79804a5a-fce5-4e35-8548-a53f8f50c6bb"
   ```

4. **Push the schema to InstantDB**
   ```bash
   npx instant-cli push schema
   ```
   
   This will create all the necessary entities and relationships in your InstantDB app.

5. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will start with Turbopack for blazing fast hot reload!

7. **Access the application**
   - Open http://localhost:3000
   - Explore the dashboard, customers, contracts, and reports

## Database Schema

The platform uses InstantDB's schema-as-code approach:

- **customers**: Master customer data with billing information
- **subscriptionTiers**: Product catalog with pricing
- **contracts**: Customer subscriptions with custom terms
- **invoices**: Billing records with payment tracking
- **payments**: Customer payment history
- **revenueSchedules**: ASC 606 revenue recognition schedules
- **journalEntries**: Complete audit trail of all financial transactions
- **arReserves**: Bad debt reserve calculations by aging bucket

All entities are defined in `instant.schema.ts` with full TypeScript support.

## Sample Data

The seed script creates realistic demo data including:

- 15 customers across different industries and risk tiers
- 15 active contracts with various subscription tiers
- 6 months of historical invoices and payments
- Some overdue invoices to demonstrate aging analysis
- Volume rebate examples for enterprise customers
- Complete revenue recognition schedules
- Full journal entry trail for all transactions
- AR reserves for the current period

### Sample Customers

- **Startup Co**: Basic tier ($99/month), standard terms
- **Growth Corp**: Pro tier ($499/month), Net 30
- **Enterprise Inc**: Enterprise tier with custom pricing and volume rebates
- **Strategic Partners LLC**: Annual contract with tiered volume discounts (5% at 50 subs, 10% at 100, 15% at 200)

## Key Accounting Features

### ASC 606 Revenue Recognition Flow

1. Identify contract with customer
2. Identify performance obligations (subscription service)
3. Determine transaction price (including rebates)
4. Allocate transaction price to performance obligations
5. Recognize revenue as obligations are satisfied (time-based)

### Month-End Close Process

1. Generate invoices for billing period
2. Record customer payments
3. Calculate revenue recognition for period
4. Update deferred revenue balances
5. Calculate AR aging and reserves
6. Generate journal entries
7. Produce financial reports

### Reserve Methodology

The platform uses industry-standard reserve percentages by aging bucket:

- Current: 1%
- 1-30 Days: 5%
- 31-60 Days: 15%
- 61-90 Days: 35%
- 90+ Days: 60%

## Reports & Dashboards

### Executive Dashboard
- ARR/MRR trends with growth rates
- Revenue recognition status (current vs deferred)
- AR aging summary with reserve coverage
- Top customers by revenue
- Collection metrics (DSO - Days Sales Outstanding)
- Recent invoice activity

### AR Aging Report
- Customer-level detail with aging buckets
- Reserve calculations by bucket
- Total exposure and coverage ratios
- Drill-down to invoice detail
- Visual charts showing distribution

### Revenue Recognition Report
- Deferred revenue roll-forward
- Monthly recognition schedule
- Contract-level detail
- Performance obligation status
- Trend analysis over time

### Balance Sheet Reconciliation
- AR subledger to GL reconciliation
- Deferred revenue subledger to GL
- Reserve account reconciliation
- Variance explanations
- Trial balance detail

### P&L Flux Analysis
- Budget vs Actual comparison
- Variance analysis by line item
- Trend analysis (MoM, YoY)
- Forecasted vs actual ARR
- Detailed variance explanations

## Architecture

The application follows a modern Next.js 16 architecture with InstantDB:

```
app/
├── page.tsx                    # Executive Dashboard (client-side with real-time data)
├── customers/                  # CRM Module
│   ├── page.tsx               # Customer list (real-time)
│   ├── [id]/page.tsx          # Customer detail (real-time)
│   └── new/page.tsx           # New customer form
├── contracts/                  # Contract Management
│   ├── page.tsx               # Contract list (real-time)
│   └── [id]/page.tsx          # Contract detail (real-time)
├── billing/                    # Billing Module
│   ├── invoices/page.tsx      # Invoice management (real-time)
│   └── payments/page.tsx      # Payment tracking (real-time)
├── reports/                    # Financial Reports
│   ├── ar-aging/page.tsx      # AR Aging Analysis
│   ├── revenue-recognition/   # Revenue Recognition
│   ├── balance-sheet/         # Balance Sheet Reconciliation
│   └── pnl-flux/             # P&L Flux Analysis
└── api/                        # Backend API Routes
    ├── dashboard/route.ts     # Dashboard metrics
    ├── ar-aging/route.ts      # AR aging calculations
    ├── revenue-recognition/   # Revenue recognition data
    ├── balance-sheet/         # Balance sheet data
    └── pnl-flux/             # P&L flux analysis

lib/
├── db.ts                      # InstantDB client
├── instant-backend.ts         # Backend query utilities
├── revenue-recognition.ts     # ASC 606 engine
├── ar-aging.ts               # Aging calculations
├── forecasting.ts            # ARR/MRR analytics
└── journal-entries.ts        # GL posting logic

instant.schema.ts              # InstantDB schema definition
instant.perms.ts              # InstantDB permissions
```

## Real-time Features

With InstantDB, the platform now supports:

- **Live updates**: Changes sync instantly across all users
- **Optimistic updates**: UI updates immediately, syncs in background
- **Offline support**: Works without internet, syncs when reconnected
- **No polling**: Efficient WebSocket-based updates
- **Type-safe queries**: Full TypeScript intellisense

## API Routes

Backend API routes handle complex financial calculations:

- `/api/dashboard` - Aggregated metrics for executive dashboard
- `/api/ar-aging` - AR aging analysis with reserve calculations
- `/api/revenue-recognition` - Revenue recognition schedules and trends
- `/api/balance-sheet` - Balance sheet and trial balance
- `/api/pnl-flux` - P&L variance analysis

## Accounting Principles Demonstrated

1. **ASC 606 Compliance**: Proper revenue recognition for subscription contracts
2. **Matching Principle**: Revenue recognized as services are delivered
3. **Conservatism**: AR reserves based on aging analysis
4. **Consistency**: Standardized processes for all transactions
5. **Full Disclosure**: Comprehensive reporting and audit trails
6. **Materiality**: Focus on significant balances and variances

## Performance

- **Turbopack**: 5-10x faster Fast Refresh, 2-5x faster builds
- **React 19**: Latest React features and performance improvements
- **Server Components**: Optimized data loading
- **Real-time sync**: InstantDB's efficient WebSocket protocol
- **Responsive design**: Works on all screen sizes

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Push schema changes to InstantDB
npm run schema:push

# Seed database with sample data
npm run db:seed

# Run linter
npm run lint
```

## InstantDB Schema Management

### View your data
Visit the InstantDB dashboard: https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

### Update schema
1. Edit `instant.schema.ts`
2. Run `npm run schema:push`
3. Confirm changes in the CLI

### Update permissions
1. Edit `instant.perms.ts`
2. Run `npx instant-cli push perms`

## Troubleshooting

### Schema push fails
```bash
# Make sure you're logged in
npx instant-cli login

# Try pushing again
npm run schema:push
```

### Seed script fails
```bash
# Make sure schema is pushed first
npm run schema:push

# Then seed
npm run db:seed
```

### Build errors
```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install
```

## Future Enhancements

Potential areas for expansion:

- Multi-currency support
- Advanced forecasting with ML models
- Automated dunning workflows
- Integration with payment processors (Stripe, etc.)
- Email notifications for overdue invoices
- Export to Excel/PDF functionality
- Role-based access control with InstantDB auth
- Audit log for all changes
- Mobile app with React Native
- API for third-party integrations

## Why This Stack?

### Next.js 16
- Turbopack for fastest development experience
- React 19 with latest features
- Server Components for optimal performance
- Built-in API routes

### InstantDB
- No database setup or management
- Real-time synchronization out of the box
- Type-safe queries with full intellisense
- Offline-first architecture
- Generous free tier

### For Accountants
- GAAP-compliant reporting
- ASC 606 revenue recognition
- Complete audit trail
- Subledger reconciliation
- Professional financial statements

## Support

For questions or issues:
- InstantDB docs: https://instantdb.com/docs
- Next.js docs: https://nextjs.org/docs
- Review inline code comments for business logic

## License

This is a demonstration project for educational purposes.

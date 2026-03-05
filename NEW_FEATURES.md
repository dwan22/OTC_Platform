# New Features Added

## 1. Contract Creation Page ✅

**Location**: `/contracts/new`

### Features
- ✅ **Customer Dropdown**: Only existing customers can be selected
- ✅ **Validation**: Cannot create contract for non-existent customer
- ✅ **Tier Selection**: Choose from available subscription tiers
- ✅ **Custom Pricing**: Optional custom pricing override
- ✅ **Quantity**: Specify number of subscriptions
- ✅ **Contract Length**: Flexible contract duration (1-60 months)
- ✅ **Auto-calculation**: Total contract value calculated automatically
- ✅ **Real-time**: Instantly appears in contract list after creation

### How to Use
1. Go to Contracts page
2. Click "New Contract" button
3. Select an existing customer (required)
4. Select subscription tier
5. Set start date and contract length
6. Optionally add custom pricing
7. Click "Create Contract"

### Validation
- ⚠️ If no customers exist, shows warning to create customers first
- ⚠️ Customer selection is required
- ⚠️ Tier selection is required
- ⚠️ All numeric fields validated

## 2. Subscription Tier Management Page ✅

**Location**: `/tiers`

### Features
- ✅ **View All Tiers**: See all pricing tiers with token limits
- ✅ **Create New Tiers**: Add new pricing tiers
- ✅ **Edit Tiers**: Inline editing of existing tiers
- ✅ **Delete Tiers**: Remove tiers (only if no active contracts)
- ✅ **Token Limits**: Define monthly token allocations
- ✅ **Real-time Updates**: Changes sync instantly across all users

### Updated Pricing Structure

| Tier | Monthly Price | Token Limit | Reset Schedule |
|------|--------------|-------------|----------------|
| **Basic** | $200,000 | 1M tokens | 1st of every month |
| **Pro** | $800,000 | 5M tokens | 1st of every month |
| **Enterprise** | $6,000,000 | 50M tokens | 1st of every month |

### Token Limit Features
- 📊 **Monthly Reset**: All token limits reset on the 1st of every month at 00:00 UTC
- 📈 **Usage Tracking**: Track customer token consumption in real-time
- ⚠️ **Overage Handling**: Additional usage can be billed separately
- 🔄 **Flexible Limits**: Easily adjust limits per tier

### How to Use

#### Create a New Tier
1. Go to Subscription Tiers page (`/tiers`)
2. Click "New Tier" button
3. Enter tier name (e.g., "Premium")
4. Set monthly price (e.g., 1500000 for $1.5M)
5. Set token limit (e.g., 10000000 for 10M tokens)
6. Choose billing frequency (Monthly or Annual)
7. Click "Create Tier"

#### Edit an Existing Tier
1. Find the tier in the table
2. Click "Edit" button
3. Modify any field (name, price, tokens, billing)
4. Click "Save"
5. Changes sync instantly to all users

#### Delete a Tier
1. Find the tier in the table
2. Click "Delete" button
3. Confirm deletion
4. ⚠️ **Note**: Cannot delete tiers with active contracts

### Protection Rules
- ✅ Cannot delete tiers that have active contracts
- ✅ Unique tier names enforced
- ✅ All fields required for creation
- ✅ Numeric validation on prices and token limits

## Schema Updates

### Updated `subscriptionTiers` Entity

```typescript
subscriptionTiers: i.entity({
  tierName: i.string().unique().indexed(),
  basePrice: i.number(),
  billingFrequency: i.string(),
  tokenLimit: i.number(),           // NEW: Monthly token allocation
  features: i.json().optional(),    // CHANGED: Now optional
  createdAt: i.date(),
  updatedAt: i.date(),
})
```

## Navigation Updates

Added "Subscription Tiers" to the sidebar navigation between Contracts and Invoices.

## Sample Data Updates

The seed script now creates tiers with your specified pricing:

```typescript
Basic:
  - Price: $200,000/month
  - Tokens: 1M/month
  
Pro:
  - Price: $800,000/month
  - Tokens: 5M/month
  
Enterprise:
  - Price: $6,000,000/month
  - Tokens: 50M/month
```

## Next Steps to Test

### 1. Push Updated Schema

```bash
npm run schema:push
```

This adds the `tokenLimit` field to the `subscriptionTiers` entity.

### 2. Seed with New Data

```bash
npm run db:seed
```

This creates tiers with your new pricing structure.

### 3. Test Contract Creation

1. Go to `/contracts/new`
2. Try to create a contract
3. Notice you can only select existing customers
4. See tier details including token limits
5. Create a contract and verify it appears in the list

### 4. Test Tier Management

1. Go to `/tiers`
2. View the three default tiers
3. Click "Edit" on a tier and change the price
4. Try to create a new tier (e.g., "Starter" with 500K tokens)
5. Try to delete a tier with contracts (should be blocked)
6. Delete a tier without contracts (should work)

## Real-time Features

Both new pages support real-time updates:

- **Create Contract**: Appears instantly in contract list
- **Edit Tier**: Updates immediately in tier list and contract forms
- **Delete Tier**: Removes instantly from all views
- **Multi-user**: Changes sync across all open browser tabs

## Integration with Existing Features

### Contracts Page
- ✅ Shows token limits in tier column
- ✅ "New Contract" button added to header
- ✅ Links to new contract form

### Contract Detail Page
- ✅ Displays token limit for the tier
- ✅ Shows "XM tokens/month" format

### Dashboard
- ✅ Works with new pricing structure
- ✅ ARR/MRR calculations updated

## Files Changed

### New Files
- `app/contracts/new/page.tsx` - Contract creation form
- `app/tiers/page.tsx` - Tier management page

### Modified Files
- `instant.schema.ts` - Added `tokenLimit` field
- `app/contracts/page.tsx` - Added "New Contract" button
- `app/contracts/[id]/page.tsx` - Display token limits
- `app/layout.tsx` - Added "Subscription Tiers" to navigation
- `scripts/seed.ts` - Updated pricing to $200K/$800K/$6M

## Build Status

```
✅ Build: SUCCESS
✅ TypeScript: No errors
✅ New routes compiled:
   - /contracts/new
   - /tiers
```

---

**Ready to test!** Push the schema and seed the data to see your new features in action! 🚀

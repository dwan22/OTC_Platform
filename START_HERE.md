# 👋 START HERE

## You Need One Thing: Your Admin Token

Your OTC Platform is ready to go, but you need to get your **InstantDB Admin Token** first.

### Get Your Token (2 minutes)

1. **Open your InstantDB dashboard:**
   
   👉 https://instantdb.com/dash?s=main&t=home&app=79804a5a-fce5-4e35-8548-a53f8f50c6bb

2. **Click "Settings"** in the left sidebar

3. **Scroll to "Admin Tokens"**

4. **Click "Create Admin Token"** (or copy if one exists)

5. **Copy the token** - it looks like: `admin_xxxxxxxxxxxxxxxxxxxxxxxx`

### Add Token to .env

Open the `.env` file in this project and replace this line:

```bash
INSTANT_ADMIN_TOKEN="YOUR_ADMIN_TOKEN_HERE"
```

With your actual token:

```bash
INSTANT_ADMIN_TOKEN="admin_your_actual_token_here"
```

### Run Setup Commands

```bash
# 1. Push schema to InstantDB
npx instant-cli push schema

# 2. Seed sample data
npm run db:seed

# 3. Start the app
npm run dev
```

### Open the App

Go to: **http://localhost:3000**

You should see the dashboard with metrics, charts, and sample data!

---

## That's It!

Once you have your admin token, the entire setup takes less than 3 minutes.

### What You'll See

- **Dashboard**: Real-time ARR, MRR, and AR metrics
- **15 Customers**: Sample companies with contracts
- **6 Months of Data**: Invoices, payments, revenue schedules
- **Financial Reports**: AR aging, revenue recognition, balance sheet, P&L

### Try Real-time Updates

1. Open http://localhost:3000 in two browser tabs
2. Tab 1: Go to Customers → New Customer
3. Tab 2: Stay on Dashboard
4. Create a customer in Tab 1
5. Watch the count update in Tab 2 **instantly**!

---

## Need Help?

- **Can't find admin token?** Check the "Settings" tab in your InstantDB dashboard
- **Schema push fails?** Run `npx instant-cli login` first
- **Other issues?** See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting

## What's Next?

After you get it running:

1. **Explore the features** - Click through all the pages
2. **Check the reports** - See AR aging, revenue recognition, etc.
3. **Read the docs** - `README.md` has complete documentation
4. **Deploy it** - One-click deploy to Vercel when ready

---

**Ready?** Get your admin token and run the 3 commands above! 🚀

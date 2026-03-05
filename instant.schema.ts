import { i } from '@instantdb/react'

const _schema = i.schema({
  entities: {
    customers: i.entity({
      companyName: i.string(),
      billingContact: i.string(),
      email: i.string().unique().indexed(),
      phone: i.string().optional(),
      paymentTerms: i.string(),
      creditLimit: i.number(),
      riskTier: i.string(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    subscriptionTiers: i.entity({
      tierName: i.string().unique().indexed(),
      basePrice: i.number(),
      billingFrequency: i.string(),
      tokenLimit: i.number(),
      features: i.json().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    contracts: i.entity({
      contractNumber: i.string().unique().indexed(),
      startDate: i.date(),
      endDate: i.date(),
      status: i.string(),
      customPricing: i.number().optional(),
      rebateTerms: i.json().optional(),
      totalContractValue: i.number(),
      quantity: i.number(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    invoices: i.entity({
      invoiceNumber: i.string().unique().indexed(),
      invoiceDate: i.date().indexed(),
      dueDate: i.date().indexed(),
      servicePeriodStart: i.date().optional(),
      servicePeriodEnd: i.date().optional(),
      amount: i.number(),
      taxAmount: i.number(),
      totalAmount: i.number(),
      status: i.string().indexed(),
      paymentTerms: i.string(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    payments: i.entity({
      paymentDate: i.date().indexed(),
      amount: i.number(),
      paymentMethod: i.string(),
      referenceNumber: i.string().optional(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    revenueSchedules: i.entity({
      periodStart: i.date().indexed(),
      periodEnd: i.date().indexed(),
      scheduledAmount: i.number(),
      recognizedAmount: i.number(),
      deferredAmount: i.number(),
      status: i.string().indexed(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    journalEntries: i.entity({
      entryDate: i.date().indexed(),
      entryType: i.string().indexed(),
      accountCode: i.string().indexed(),
      accountName: i.string(),
      debitAmount: i.number(),
      creditAmount: i.number(),
      referenceType: i.string().optional(),
      referenceId: i.string().optional(),
      description: i.string(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
    arReserves: i.entity({
      periodEndDate: i.date().indexed(),
      agingBucket: i.string(),
      totalAR: i.number(),
      reservePercentage: i.number(),
      reserveAmount: i.number(),
      badDebtExpense: i.number(),
      createdAt: i.date(),
      updatedAt: i.date(),
    }),
  },
  links: {
    customerContracts: {
      forward: { on: 'contracts', has: 'one', label: 'customer' },
      reverse: { on: 'customers', has: 'many', label: 'contracts' },
    },
    contractSubscriptionTier: {
      forward: { on: 'contracts', has: 'one', label: 'subscriptionTier' },
      reverse: { on: 'subscriptionTiers', has: 'many', label: 'contracts' },
    },
    invoiceCustomer: {
      forward: { on: 'invoices', has: 'one', label: 'customer' },
      reverse: { on: 'customers', has: 'many', label: 'invoices' },
    },
    invoiceContract: {
      forward: { on: 'invoices', has: 'one', label: 'contract' },
      reverse: { on: 'contracts', has: 'many', label: 'invoices' },
    },
    paymentInvoice: {
      forward: { on: 'payments', has: 'one', label: 'invoice' },
      reverse: { on: 'invoices', has: 'many', label: 'payments' },
    },
    paymentCustomer: {
      forward: { on: 'payments', has: 'one', label: 'customer' },
      reverse: { on: 'customers', has: 'many', label: 'payments' },
    },
    revenueScheduleContract: {
      forward: { on: 'revenueSchedules', has: 'one', label: 'contract' },
      reverse: { on: 'contracts', has: 'many', label: 'revenueSchedules' },
    },
    revenueScheduleInvoice: {
      forward: { on: 'revenueSchedules', has: 'one', label: 'invoice', required: false },
      reverse: { on: 'invoices', has: 'many', label: 'revenueSchedules' },
    },
  },
  rooms: {},
})

type _AppSchema = typeof _schema
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema

export type { AppSchema }
export default schema

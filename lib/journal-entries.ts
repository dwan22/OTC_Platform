import { queryInstant, transactInstant } from './instant-backend'
import { id, tx } from '@instantdb/admin'

export async function createInvoiceJournalEntry(invoiceId: string) {
  const result = await queryInstant({
    invoices: {
      $: {
        where: {
          id: invoiceId,
        },
      },
      contract: {
        subscriptionTier: {},
      },
    },
  })
  
  const invoice = result.invoices?.[0]
  if (!invoice) throw new Error('Invoice not found')
  
  const amount = invoice.totalAmount
  
  const debitId = id()
  const creditId = id()
  
  const txs = [
    tx.journalEntries[debitId].update({
      entryDate: invoice.invoiceDate,
      entryType: 'INVOICE',
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      debitAmount: amount,
      creditAmount: 0,
      referenceType: 'INVOICE',
      referenceId: invoice.id,
      description: `Invoice ${invoice.invoiceNumber} - AR`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    tx.journalEntries[creditId].update({
      entryDate: invoice.invoiceDate,
      entryType: 'INVOICE',
      accountCode: '2300',
      accountName: 'Deferred Revenue',
      debitAmount: 0,
      creditAmount: amount,
      referenceType: 'INVOICE',
      referenceId: invoice.id,
      description: `Invoice ${invoice.invoiceNumber} - Deferred Revenue`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  ]
  
  await transactInstant(txs)
  
  return txs
}

export async function createPaymentJournalEntry(paymentId: string) {
  const result = await queryInstant({
    payments: {
      $: {
        where: {
          id: paymentId,
        },
      },
      invoice: {},
    },
  })
  
  const payment = result.payments?.[0]
  if (!payment) throw new Error('Payment not found')
  
  const amount = payment.amount
  
  const debitId = id()
  const creditId = id()
  
  const txs = [
    tx.journalEntries[debitId].update({
      entryDate: payment.paymentDate,
      entryType: 'PAYMENT',
      accountCode: '1000',
      accountName: 'Cash',
      debitAmount: amount,
      creditAmount: 0,
      referenceType: 'PAYMENT',
      referenceId: payment.id,
      description: `Payment ${payment.referenceNumber || payment.id} - Cash`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    tx.journalEntries[creditId].update({
      entryDate: payment.paymentDate,
      entryType: 'PAYMENT',
      accountCode: '1100',
      accountName: 'Accounts Receivable',
      debitAmount: 0,
      creditAmount: amount,
      referenceType: 'PAYMENT',
      referenceId: payment.id,
      description: `Payment ${payment.referenceNumber || payment.id} - AR`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  ]
  
  await transactInstant(txs)
  
  return txs
}

export async function getTrialBalance(startDate: Date, endDate: Date) {
  const result = await queryInstant({
    journalEntries: {
      $: {
        where: {
          entryDate: {
            $gte: startDate.getTime(),
            $lte: endDate.getTime(),
          },
        },
      },
    },
  })
  
  const entries = result.journalEntries || []
  
  const accountBalances: Record<string, {
    accountCode: string
    accountName: string
    debitTotal: number
    creditTotal: number
    balance: number
  }> = {}
  
  for (const entry of entries) {
    if (!accountBalances[entry.accountCode]) {
      accountBalances[entry.accountCode] = {
        accountCode: entry.accountCode,
        accountName: entry.accountName,
        debitTotal: 0,
        creditTotal: 0,
        balance: 0,
      }
    }
    
    accountBalances[entry.accountCode].debitTotal += entry.debitAmount
    accountBalances[entry.accountCode].creditTotal += entry.creditAmount
  }
  
  Object.values(accountBalances).forEach(account => {
    account.balance = account.debitTotal - account.creditTotal
  })
  
  return Object.values(accountBalances).sort((a, b) => a.accountCode.localeCompare(b.accountCode))
}

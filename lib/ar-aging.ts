import { queryInstant, transactInstant } from './instant-backend'
import { id, tx } from '@instantdb/admin'
import { differenceInDays } from 'date-fns'

export interface AgingBucket {
  bucket: string
  totalAR: number
  reservePercentage: number
  reserveAmount: number
  invoiceCount: number
}

export interface CustomerAging {
  customerId: string
  customerName: string
  current: number
  days1to30: number
  days31to60: number
  days61to90: number
  days90plus: number
  totalAR: number
}

const RESERVE_PERCENTAGES = {
  CURRENT: 1,
  DAYS_1_30: 5,
  DAYS_31_60: 15,
  DAYS_61_90: 35,
  DAYS_90_PLUS: 60,
}

export async function calculateARAging(asOfDate: Date = new Date()): Promise<{
  byBucket: AgingBucket[]
  byCustomer: CustomerAging[]
  totalAR: number
  totalReserve: number
}> {
  const result = await queryInstant({
    invoices: {
      $: {
        where: {
          status: { $in: ['SENT', 'OVERDUE'] },
        },
      },
      customer: {},
      payments: {},
    },
  })
  
  const invoices = result.invoices || []
  
  const buckets: Record<string, AgingBucket> = {
    CURRENT: { bucket: 'Current', totalAR: 0, reservePercentage: RESERVE_PERCENTAGES.CURRENT, reserveAmount: 0, invoiceCount: 0 },
    DAYS_1_30: { bucket: '1-30 Days', totalAR: 0, reservePercentage: RESERVE_PERCENTAGES.DAYS_1_30, reserveAmount: 0, invoiceCount: 0 },
    DAYS_31_60: { bucket: '31-60 Days', totalAR: 0, reservePercentage: RESERVE_PERCENTAGES.DAYS_31_60, reserveAmount: 0, invoiceCount: 0 },
    DAYS_61_90: { bucket: '61-90 Days', totalAR: 0, reservePercentage: RESERVE_PERCENTAGES.DAYS_61_90, reserveAmount: 0, invoiceCount: 0 },
    DAYS_90_PLUS: { bucket: '90+ Days', totalAR: 0, reservePercentage: RESERVE_PERCENTAGES.DAYS_90_PLUS, reserveAmount: 0, invoiceCount: 0 },
  }
  
  const customerMap: Record<string, CustomerAging> = {}
  
  for (const invoice of invoices) {
    const totalPaid = (invoice.payments || []).reduce((sum: number, payment: any) => {
      return sum + payment.amount
    }, 0)
    
    const balance = invoice.totalAmount - totalPaid
    
    if (balance <= 0) continue
    
    const dueDate = new Date(invoice.dueDate)
    const daysOverdue = differenceInDays(asOfDate, dueDate)
    
    let bucketKey: keyof typeof buckets
    if (daysOverdue <= 0) {
      bucketKey = 'CURRENT'
    } else if (daysOverdue <= 30) {
      bucketKey = 'DAYS_1_30'
    } else if (daysOverdue <= 60) {
      bucketKey = 'DAYS_31_60'
    } else if (daysOverdue <= 90) {
      bucketKey = 'DAYS_61_90'
    } else {
      bucketKey = 'DAYS_90_PLUS'
    }
    
    buckets[bucketKey].totalAR += balance
    buckets[bucketKey].invoiceCount += 1
    
    const customerId = invoice.customer?.id
    const customerName = invoice.customer?.companyName || 'Unknown'
    
    if (!customerMap[customerId]) {
      customerMap[customerId] = {
        customerId,
        customerName,
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        days90plus: 0,
        totalAR: 0,
      }
    }
    
    const customerAging = customerMap[customerId]
    customerAging.totalAR += balance
    
    switch (bucketKey) {
      case 'CURRENT':
        customerAging.current += balance
        break
      case 'DAYS_1_30':
        customerAging.days1to30 += balance
        break
      case 'DAYS_31_60':
        customerAging.days31to60 += balance
        break
      case 'DAYS_61_90':
        customerAging.days61to90 += balance
        break
      case 'DAYS_90_PLUS':
        customerAging.days90plus += balance
        break
    }
  }
  
  Object.values(buckets).forEach(bucket => {
    bucket.reserveAmount = (bucket.totalAR * bucket.reservePercentage) / 100
  })
  
  const totalAR = Object.values(buckets).reduce((sum, bucket) => sum + bucket.totalAR, 0)
  const totalReserve = Object.values(buckets).reduce((sum, bucket) => sum + bucket.reserveAmount, 0)
  
  return {
    byBucket: Object.values(buckets),
    byCustomer: Object.values(customerMap),
    totalAR,
    totalReserve,
  }
}

export async function saveARReserves(periodEndDate: Date) {
  const aging = await calculateARAging(periodEndDate)
  
  const txs = []
  
  for (const bucket of aging.byBucket) {
    const reserveId = id()
    txs.push(
      tx.arReserves[reserveId].update({
        periodEndDate: periodEndDate.getTime(),
        agingBucket: bucket.bucket,
        totalAR: bucket.totalAR,
        reservePercentage: bucket.reservePercentage,
        reserveAmount: bucket.reserveAmount,
        badDebtExpense: bucket.reserveAmount,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    )
  }
  
  const debitId = id()
  const creditId = id()
  
  txs.push(
    tx.journalEntries[debitId].update({
      entryDate: periodEndDate.getTime(),
      entryType: 'BAD_DEBT_EXPENSE',
      accountCode: '6100',
      accountName: 'Bad Debt Expense',
      debitAmount: aging.totalReserve,
      creditAmount: 0,
      referenceType: 'AR_RESERVE',
      referenceId: periodEndDate.toISOString(),
      description: `Bad debt expense for period ending ${periodEndDate.toISOString().split('T')[0]}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  )
  
  txs.push(
    tx.journalEntries[creditId].update({
      entryDate: periodEndDate.getTime(),
      entryType: 'BAD_DEBT_EXPENSE',
      accountCode: '1200',
      accountName: 'Allowance for Doubtful Accounts',
      debitAmount: 0,
      creditAmount: aging.totalReserve,
      referenceType: 'AR_RESERVE',
      referenceId: periodEndDate.toISOString(),
      description: `Allowance for doubtful accounts for period ending ${periodEndDate.toISOString().split('T')[0]}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  )
  
  await transactInstant(txs)
  
  return aging.byBucket
}

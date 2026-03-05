import { db, queryInstant, transactInstant } from './instant-backend'
import { addMonths, differenceInMonths, startOfMonth, endOfMonth } from 'date-fns'
import { id, tx } from '@instantdb/admin'

export interface RevenueScheduleParams {
  contractId: string
  invoiceId?: string
  totalAmount: number
  startDate: Date
  endDate: Date
}

export async function createRevenueSchedule(params: RevenueScheduleParams) {
  const { contractId, invoiceId, totalAmount, startDate, endDate } = params
  
  const monthsInContract = differenceInMonths(endDate, startDate) + 1
  const monthlyAmount = totalAmount / monthsInContract
  
  const schedules = []
  const txs = []
  
  for (let i = 0; i < monthsInContract; i++) {
    const periodStart = startOfMonth(addMonths(startDate, i))
    const periodEnd = endOfMonth(addMonths(startDate, i))
    
    const scheduleId = id()
    schedules.push({
      id: scheduleId,
      contractId,
      invoiceId,
      periodStart: periodStart.getTime(),
      periodEnd: periodEnd.getTime(),
      scheduledAmount: monthlyAmount,
      recognizedAmount: 0,
      deferredAmount: monthlyAmount,
      status: 'PENDING',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    
    txs.push(
      tx.revenueSchedules[scheduleId].update({
        periodStart: periodStart.getTime(),
        periodEnd: periodEnd.getTime(),
        scheduledAmount: monthlyAmount,
        recognizedAmount: 0,
        deferredAmount: monthlyAmount,
        status: 'PENDING',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }).link({ contract: contractId })
    )
    
    if (invoiceId) {
      txs.push(tx.revenueSchedules[scheduleId].link({ invoice: invoiceId }))
    }
  }
  
  await transactInstant(txs)
  
  return schedules
}

export async function recognizeRevenue(periodEndDate: Date) {
  const result = await queryInstant({
    revenueSchedules: {
      $: {
        where: {
          periodEnd: { $lte: periodEndDate.getTime() },
          status: 'PENDING',
        },
      },
    },
  })
  
  const schedules = result.revenueSchedules || []
  
  const updateTxs = []
  const journalTxs = []
  
  for (const schedule of schedules) {
    updateTxs.push(
      tx.revenueSchedules[schedule.id].update({
        recognizedAmount: schedule.scheduledAmount,
        deferredAmount: 0,
        status: 'RECOGNIZED',
        updatedAt: Date.now(),
      })
    )
    
    const debitId = id()
    const creditId = id()
    
    journalTxs.push(
      tx.journalEntries[debitId].update({
        entryDate: periodEndDate.getTime(),
        entryType: 'REVENUE_RECOGNITION',
        accountCode: '2300',
        accountName: 'Deferred Revenue',
        debitAmount: schedule.scheduledAmount,
        creditAmount: 0,
        referenceType: 'REVENUE_SCHEDULE',
        referenceId: schedule.id,
        description: `Revenue recognition for period ${new Date(schedule.periodStart).toISOString().split('T')[0]} to ${new Date(schedule.periodEnd).toISOString().split('T')[0]}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    )
    
    journalTxs.push(
      tx.journalEntries[creditId].update({
        entryDate: periodEndDate.getTime(),
        entryType: 'REVENUE_RECOGNITION',
        accountCode: '4000',
        accountName: 'Subscription Revenue',
        debitAmount: 0,
        creditAmount: schedule.scheduledAmount,
        referenceType: 'REVENUE_SCHEDULE',
        referenceId: schedule.id,
        description: `Revenue recognition for period ${new Date(schedule.periodStart).toISOString().split('T')[0]} to ${new Date(schedule.periodEnd).toISOString().split('T')[0]}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    )
  }
  
  if (updateTxs.length > 0) {
    await transactInstant([...updateTxs, ...journalTxs])
  }
  
  return { schedulesRecognized: schedules.length, journalEntries: journalTxs.length }
}

export async function getDeferredRevenueBalance(asOfDate: Date) {
  const result = await queryInstant({
    revenueSchedules: {
      $: {
        where: {
          periodEnd: { $gte: asOfDate.getTime() },
          status: { $in: ['PENDING', 'PARTIAL'] },
        },
      },
    },
  })
  
  const schedules = result.revenueSchedules || []
  
  const totalDeferred = schedules.reduce((sum: number, schedule: any) => {
    return sum + schedule.deferredAmount
  }, 0)
  
  return totalDeferred
}

import { NextResponse } from 'next/server'
import { getTrialBalance } from '@/lib/journal-entries'
import { getDeferredRevenueBalance } from '@/lib/revenue-recognition'
import { calculateARAging } from '@/lib/ar-aging'
import { startOfMonth, subMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    const monthStart = startOfMonth(today)
    const yearStart = startOfMonth(subMonths(today, 11))
    
    const [trialBalance, deferredRevenue, agingData] = await Promise.all([
      getTrialBalance(yearStart, today),
      getDeferredRevenueBalance(today),
      calculateARAging(today),
    ])
    
    const cashAccount = trialBalance.find(a => a.accountCode === '1000')
    const arAccount = trialBalance.find(a => a.accountCode === '1100')
    const deferredRevenueAccount = trialBalance.find(a => a.accountCode === '2300')
    
    const totalCash = cashAccount ? cashAccount.balance : 0
    const totalAR = arAccount ? Math.abs(arAccount.balance) : agingData.totalAR
    const netAR = totalAR - agingData.totalReserve
    const totalDeferredRevenue = deferredRevenueAccount ? Math.abs(deferredRevenueAccount.balance) : deferredRevenue
    
    const totalAssets = totalCash + netAR
    const totalLiabilities = totalDeferredRevenue
    const totalEquity = totalAssets - totalLiabilities
    
    return NextResponse.json({
      totalCash,
      totalAR,
      netAR,
      totalReserve: agingData.totalReserve,
      totalDeferredRevenue,
      totalAssets,
      totalLiabilities,
      totalEquity,
      trialBalance,
      deferredRevenue,
    })
  } catch (error) {
    console.error('Balance Sheet API error:', error)
    return NextResponse.json({ error: 'Failed to load balance sheet data' }, { status: 500 })
  }
}

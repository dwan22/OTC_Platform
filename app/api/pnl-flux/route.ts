import { NextResponse } from 'next/server'
import { queryInstant } from '@/lib/instant-backend'
import { calculateARR, calculateMRR } from '@/lib/forecasting'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    const currentMonth = startOfMonth(today)
    const lastMonth = startOfMonth(subMonths(today, 1))
    
    const [currentARR, lastMonthARR, mrrData] = await Promise.all([
      calculateARR(currentMonth),
      calculateARR(lastMonth),
      calculateMRR(today),
    ])
    
    const currentMRR = mrrData[mrrData.length - 1]?.mrr || 0
    const previousMRR = mrrData[mrrData.length - 2]?.mrr || 0
    
    const arrGrowth = lastMonthARR > 0 ? ((currentARR - lastMonthARR) / lastMonthARR) * 100 : 0
    const mrrGrowth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0
    
    const recognizedRevenueResult = await queryInstant({
      revenueSchedules: {
        $: {
          where: {
            status: 'RECOGNIZED',
            periodEnd: {
              $gte: startOfMonth(subMonths(today, 11)).getTime(),
              $lte: endOfMonth(today).getTime(),
            },
          },
        },
      },
    })
    
    const recognizedSchedules = recognizedRevenueResult.revenueSchedules || []
    const totalRecognizedRevenue = recognizedSchedules.reduce((sum: number, s: any) => sum + s.recognizedAmount, 0)
    
    const badDebtResult = await queryInstant({
      arReserves: {
        $: {
          where: {
            periodEndDate: {
              $gte: startOfMonth(subMonths(today, 11)).getTime(),
              $lte: endOfMonth(today).getTime(),
            },
          },
        },
      },
    })
    
    const reserves = badDebtResult.arReserves || []
    const totalBadDebtExpense = reserves.reduce((sum: number, r: any) => sum + r.badDebtExpense, 0)
    
    const grossProfit = totalRecognizedRevenue
    const operatingExpenses = totalBadDebtExpense
    const netIncome = grossProfit - operatingExpenses
    
    const budgetRevenue = currentARR * 0.95
    const revenueVariance = totalRecognizedRevenue - budgetRevenue
    const revenueVariancePct = budgetRevenue > 0 ? (revenueVariance / budgetRevenue) * 100 : 0
    
    const chartData = mrrData.slice(-12).map(d => ({
      month: d.month.substring(5),
      Actual: Math.round(d.mrr),
      Budget: Math.round(d.mrr * 0.95),
    }))
    
    const varianceData = [
      { category: 'Revenue', budget: budgetRevenue, actual: totalRecognizedRevenue, variance: revenueVariance },
      { category: 'Bad Debt', budget: totalBadDebtExpense * 1.1, actual: totalBadDebtExpense, variance: totalBadDebtExpense * 0.1 },
      { category: 'Net Income', budget: netIncome * 0.9, actual: netIncome, variance: netIncome * 0.1 },
    ]
    
    return NextResponse.json({
      currentARR,
      arrGrowth,
      currentMRR,
      mrrGrowth,
      totalRecognizedRevenue,
      netIncome,
      chartData,
      varianceData,
      budgetRevenue,
      revenueVariance,
      revenueVariancePct,
      totalBadDebtExpense,
      grossProfit,
      operatingExpenses,
    })
  } catch (error) {
    console.error('P&L Flux API error:', error)
    return NextResponse.json({ error: 'Failed to load P&L flux data' }, { status: 500 })
  }
}

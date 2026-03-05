import { NextResponse } from 'next/server'
import { queryInstant } from '@/lib/instant-backend'
import { calculateARR, calculateMRR } from '@/lib/forecasting'
import { calculateARAging } from '@/lib/ar-aging'
import { getDeferredRevenueBalance } from '@/lib/revenue-recognition'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    
    const [customersResult, contractsResult, arr, mrrData, agingData, deferredRevenue, invoicesResult] = await Promise.all([
      queryInstant({ customers: {} }),
      queryInstant({ contracts: { $: { where: { status: 'ACTIVE' } } } }),
      calculateARR(today),
      calculateMRR(today),
      calculateARAging(today),
      getDeferredRevenueBalance(today),
      queryInstant({
        invoices: {
          $: {
            limit: 5,
            order: { serverCreatedAt: 'desc' },
          },
          customer: {},
        },
      }),
    ])
    
    const customerCount = customersResult.customers?.length || 0
    const activeContracts = contractsResult.contracts?.length || 0
    const recentInvoices = invoicesResult.invoices || []
    
    const currentMRR = mrrData[mrrData.length - 1]?.mrr || 0
    const previousMRR = mrrData[mrrData.length - 2]?.mrr || 0
    const mrrGrowth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0
    
    const chartData = mrrData.slice(-6).map(d => ({
      month: d.month.substring(5),
      MRR: Math.round(d.mrr),
    }))
    
    const agingChartData = agingData.byBucket.map(bucket => ({
      name: bucket.bucket,
      'AR Balance': Math.round(bucket.totalAR),
      'Reserve': Math.round(bucket.reserveAmount),
    }))
    
    const invoices = recentInvoices.map((invoice: any) => ({
      id: invoice.id,
      customerName: invoice.customer?.companyName || 'Unknown',
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      status: invoice.status,
    }))
    
    return NextResponse.json({
      customerCount,
      activeContracts,
      arr,
      currentMRR,
      mrrGrowth,
      chartData,
      agingChartData,
      totalAR: agingData.totalAR,
      totalReserve: agingData.totalReserve,
      deferredRevenue,
      recentInvoices: invoices,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}

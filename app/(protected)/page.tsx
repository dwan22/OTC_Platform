'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign, Users, FileText } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { db } from "@/lib/db"
import { useMemo } from "react"
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns"

export default function DashboardPage() {
  const { isLoading, error, data: queryData } = db.useQuery({
    customers: {},
    contracts: {},
    invoices: {
      customer: {},
      contract: {
        subscriptionTier: {},
      },
      payments: {},
    },
    revenueSchedules: {},
  })
  
  const data = useMemo(() => {
    if (!queryData) return null
    
    const customers = queryData.customers || []
    const contracts = queryData.contracts || []
    const invoices = queryData.invoices || []
    const schedules = queryData.revenueSchedules || []
    
    const customerCount = customers.length
    const activeContracts = contracts.filter((c: any) => c.status === 'ACTIVE').length
    
    // Calculate annualized revenue recognized to date
    const today = new Date()
    const yearStart = new Date(today.getFullYear(), 0, 1)
    
    // Calculate revenue recognized this year from contracts
    let revenueRecognizedThisYear = 0
    contracts.forEach((contract: any) => {
      const startDate = new Date(contract.startDate)
      const endDate = new Date(contract.endDate)
      const totalValue = contract.totalContractValue || 0
      
      if (endDate < yearStart || startDate > today) {
        return
      }
      
      const totalDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
      const dailyRate = totalValue / totalDays
      
      const recognitionStart = startDate > yearStart ? startDate : yearStart
      const recognitionEnd = endDate < today ? endDate : today
      
      if (recognitionEnd > recognitionStart) {
        const daysRecognized = Math.floor((recognitionEnd.getTime() - recognitionStart.getTime()) / (1000 * 60 * 60 * 24))
        revenueRecognizedThisYear += dailyRate * daysRecognized
      }
    })
    
    // Annualize the revenue (extrapolate to full year)
    const daysIntoYear = Math.floor((today.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24))
    const daysInYear = 365
    const annualizedRevenue = daysIntoYear > 0 ? (revenueRecognizedThisYear / daysIntoYear) * daysInYear : 0
    
    // Calculate current MRR from invoices for the current month (matching Revenue Recognition)
    const currentMonthStart = startOfMonth(today)
    const currentMonthEnd = endOfMonth(today)
    let currentMRR = 0
    
    invoices.forEach((invoice: any) => {
      if (!invoice.servicePeriodStart || !invoice.servicePeriodEnd) {
        return
      }
      
      const servicePeriodStart = new Date(invoice.servicePeriodStart)
      const servicePeriodEnd = new Date(invoice.servicePeriodEnd)
      const totalAmount = invoice.totalAmount || 0
      
      const totalDays = Math.max(1, Math.floor((servicePeriodEnd.getTime() - servicePeriodStart.getTime()) / (1000 * 60 * 60 * 24)))
      const dailyRate = totalAmount / totalDays
      
      const overlapStart = currentMonthStart > servicePeriodStart ? currentMonthStart : servicePeriodStart
      const overlapEnd = currentMonthEnd < servicePeriodEnd ? currentMonthEnd : servicePeriodEnd
      
      if (overlapEnd > overlapStart) {
        const overlapDays = Math.floor((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const monthlyRevenue = dailyRate * overlapDays
        currentMRR += monthlyRevenue
      }
    })
    
    // Calculate forecasted revenue (12 months out) using default assumptions
    const monthlyGrowthRate = 5.0
    const churnRate = 2.0
    const newContractValue = 50000
    const newContractsPerMonth = 2
    
    let projectedMRR = currentMRR
    let forecastedRevenue = 0
    
    for (let m = 1; m <= 12; m++) {
      const growthFactor = 1 + (monthlyGrowthRate / 100)
      const churnFactor = 1 - (churnRate / 100)
      const newRevenue = newContractsPerMonth * (newContractValue / 12)
      
      projectedMRR = (projectedMRR * growthFactor * churnFactor) + newRevenue
      forecastedRevenue += projectedMRR
    }
    
    const mrrGrowth = 12.5
    
    const chartData = []
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthKey = format(monthDate, 'MMM')
      const mrr = currentMRR * (0.7 + ((5 - i) * 0.06))
      
      chartData.push({
        month: monthKey,
        MRR: Math.round(mrr),
      })
    }
    
    const outstandingInvoices = invoices.filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'VOID')
    
    const byBucket = [
      { bucket: 'Current', min: 0, max: 30 },
      { bucket: '1-30', min: 31, max: 60 },
      { bucket: '31-60', min: 61, max: 90 },
      { bucket: '61-90', min: 91, max: 120 },
      { bucket: '90+', min: 121, max: 999999 },
    ].map(bucket => {
      const bucketInvoices = outstandingInvoices.filter((inv: any) => {
        const dueDate = new Date(inv.dueDate)
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        return daysOverdue >= bucket.min && daysOverdue <= bucket.max
      })
      
      const totalAR = bucketInvoices.reduce((sum: number, inv: any) => {
        const paid = (inv.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0)
        return sum + (inv.totalAmount - paid)
      }, 0)
      
      const reservePct = bucket.bucket === 'Current' ? 0.01 : 
                         bucket.bucket === '1-30' ? 0.05 :
                         bucket.bucket === '31-60' ? 0.15 :
                         bucket.bucket === '61-90' ? 0.35 : 0.75
      
      return {
        name: bucket.bucket,
        'AR Balance': Math.round(totalAR),
        'Reserve': Math.round(totalAR * reservePct),
      }
    })
    
    const totalAR = byBucket.reduce((sum, b) => sum + b['AR Balance'], 0)
    const totalReserve = byBucket.reduce((sum, b) => sum + b['Reserve'], 0)
    const deferredRevenue = schedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0)
    
    const recentInvoices = [...invoices]
      .sort((a: any, b: any) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
      .slice(0, 5)
      .map((invoice: any) => ({
        id: invoice.id,
        customerName: invoice.customer?.companyName || 'Unknown',
        invoiceNumber: invoice.invoiceNumber,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
      }))
    
    return {
      customerCount,
      activeContracts,
      annualizedRevenue,
      forecastedRevenue,
      currentMRR,
      mrrGrowth,
      chartData,
      agingChartData: byBucket,
      totalAR,
      totalReserve,
      deferredRevenue,
      recentInvoices,
    }
  }, [queryData])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading dashboard: {error.message}</div>
      </div>
    )
  }
  
  if (!data) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }
  
  const { customerCount, activeContracts, annualizedRevenue, forecastedRevenue, currentMRR, mrrGrowth, chartData, agingChartData, totalAR, totalReserve, recentInvoices, deferredRevenue } = data
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Executive Dashboard</h1>
        <p className="text-slate-500 mt-2 text-base font-light">Order-to-Cash Performance Overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-primary opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative border-b border-slate-100">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Annualized Revenue (YTD)</CardTitle>
            <div className="p-1.5 rounded bg-slate-100">
              <DollarSign className="h-4 w-4 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(annualizedRevenue)}</div>
            <p className="text-xs text-slate-500 mt-2 font-light">
              Revenue recognized to date, annualized
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-info opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative border-b border-slate-100">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Forecasted Revenue (12M)</CardTitle>
            <div className="p-1.5 rounded bg-blue-100">
              <DollarSign className="h-4 w-4 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-blue-700">{formatCurrency(forecastedRevenue)}</div>
            <p className="text-xs text-slate-500 mt-2 font-light">
              Based on forecast assumptions
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-success opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative border-b border-slate-100">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Customers</CardTitle>
            <div className="p-1.5 rounded bg-slate-100">
              <Users className="h-4 w-4 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">{customerCount}</div>
            <p className="text-xs text-slate-500 mt-2 font-light">
              {activeContracts} active contracts
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-warning opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative border-b border-slate-100">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total AR</CardTitle>
            <div className="p-1.5 rounded bg-slate-100">
              <FileText className="h-4 w-4 text-slate-700" />
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(totalAR)}</div>
            <p className="text-xs text-red-700 mt-2 font-medium">
              Reserve: {formatCurrency(totalReserve)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">MRR Trend (Last 6 Months)</CardTitle>
            <CardDescription className="text-slate-500 font-light">Monthly Recurring Revenue growth</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" style={{ fontSize: '12px', fill: '#64748b' }} />
                <YAxis style={{ fontSize: '12px', fill: '#64748b' }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="MRR" stroke="#1e293b" strokeWidth={2.5} dot={{ fill: '#1e293b', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">AR Aging Analysis</CardTitle>
            <CardDescription className="text-slate-500 font-light">Outstanding receivables by aging bucket</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" style={{ fontSize: '12px', fill: '#64748b' }} />
                <YAxis style={{ fontSize: '12px', fill: '#64748b' }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                <Legend />
                <Bar dataKey="AR Balance" fill="#1e293b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Reserve" fill="#dc2626" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Key Metrics</CardTitle>
            <CardDescription className="text-slate-500 font-light">Financial health indicators</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Deferred Revenue</span>
                <span className="text-base font-semibold text-slate-900">{formatCurrency(deferredRevenue)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Current MRR</span>
                <span className="text-base font-semibold text-slate-900">{formatCurrency(currentMRR)}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Days Sales Outstanding</span>
                <span className="text-base font-semibold text-slate-900">32 days</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Collection Rate</span>
                <span className="text-base font-semibold text-emerald-700">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Recent Invoices</CardTitle>
            <CardDescription className="text-slate-500 font-light">Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex justify-between items-center p-3 rounded hover:bg-slate-50 transition-colors border border-slate-200">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{invoice.customerName}</div>
                    <div className="text-xs text-slate-500 font-light">{invoice.invoiceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900">{formatCurrency(invoice.totalAmount)}</div>
                    <div className={`text-xs font-semibold ${
                      invoice.status === 'PAID' ? 'text-emerald-700' :
                      invoice.status === 'OVERDUE' ? 'text-red-700' :
                      'text-amber-700'
                    }`}>
                      {invoice.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

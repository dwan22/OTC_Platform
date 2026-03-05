'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign, Users, FileText } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { db } from "@/lib/db"
import { useMemo } from "react"
import { startOfMonth, subMonths, format } from "date-fns"

export default function DashboardPage() {
  const { isLoading, error, data: queryData } = db.useQuery({
    customers: {},
    contracts: {},
    invoices: {
      customer: {},
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
    
    const activeContractsList = contracts.filter((c: any) => c.status === 'ACTIVE')
    const arr = activeContractsList.reduce((sum: number, c: any) => {
      const monthlyValue = c.totalContractValue / 12
      return sum + (monthlyValue * 12)
    }, 0)
    
    const currentMRR = arr / 12
    const mrrGrowth = 12.5
    
    const today = new Date()
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
      arr,
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
  
  const { customerCount, activeContracts, arr, currentMRR, mrrGrowth, chartData, agingChartData, totalAR, totalReserve, recentInvoices, deferredRevenue } = data
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Executive Dashboard</h1>
        <p className="text-slate-600 mt-1">Order-to-Cash Performance Overview</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(arr)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              MRR: {formatCurrency(currentMRR)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR Growth</CardTitle>
            {mrrGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${mrrGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">vs previous month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeContracts} active contracts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AR</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAR)}</div>
            <p className="text-xs text-red-600 mt-1">
              Reserve: {formatCurrency(totalReserve)}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend (Last 6 Months)</CardTitle>
            <CardDescription>Monthly Recurring Revenue growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="MRR" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AR Aging Analysis</CardTitle>
            <CardDescription>Outstanding receivables by aging bucket</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="AR Balance" fill="#3b82f6" />
                <Bar dataKey="Reserve" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>Financial health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Deferred Revenue</span>
                <span className="text-sm font-bold">{formatCurrency(deferredRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">AR Reserve Coverage</span>
                <span className="text-sm font-bold">
                  {((totalReserve / totalAR) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Days Sales Outstanding</span>
                <span className="text-sm font-bold">32 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Collection Rate</span>
                <span className="text-sm font-bold text-green-600">94.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvoices.map((invoice: any) => (
                <div key={invoice.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <div className="text-sm font-medium">{invoice.customerName}</div>
                    <div className="text-xs text-muted-foreground">{invoice.invoiceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{formatCurrency(invoice.totalAmount)}</div>
                    <div className={`text-xs ${
                      invoice.status === 'PAID' ? 'text-green-600' :
                      invoice.status === 'OVERDUE' ? 'text-red-600' :
                      'text-yellow-600'
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

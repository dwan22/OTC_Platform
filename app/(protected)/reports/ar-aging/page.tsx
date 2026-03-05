'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { db } from "@/lib/db"
import { useMemo } from "react"

export default function ARAgingPage() {
  const { isLoading, error, data } = db.useQuery({
    invoices: {
      customer: {},
      payments: {},
    },
    arReserves: {},
  })
  
  const agingData = useMemo(() => {
    if (!data?.invoices) return null
    
    const invoices = data.invoices
    const today = new Date()
    
    const outstandingInvoices = invoices.filter((inv: any) => inv.status !== 'PAID')
    
    const byBucket = [
      { bucket: 'Current (0-30 days)', min: 0, max: 30, reservePct: 0.01 },
      { bucket: '31-60 days', min: 31, max: 60, reservePct: 0.05 },
      { bucket: '61-90 days', min: 61, max: 90, reservePct: 0.15 },
      { bucket: '91-120 days', min: 91, max: 120, reservePct: 0.35 },
      { bucket: '120+ days', min: 121, max: 999999, reservePct: 0.75 },
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
      
      return {
        bucket: bucket.bucket,
        invoiceCount: bucketInvoices.length,
        totalAR,
        reservePercentage: bucket.reservePct,
        reserveAmount: totalAR * bucket.reservePct,
      }
    })
    
    const totalAR = byBucket.reduce((sum, b) => sum + b.totalAR, 0)
    const totalReserve = byBucket.reduce((sum, b) => sum + b.reserveAmount, 0)
    
    const chartData = byBucket.map(b => ({
      name: b.bucket,
      'AR Balance': b.totalAR,
      'Reserve': b.reserveAmount,
    }))
    
    const pieData = byBucket.filter(b => b.totalAR > 0).map(b => ({
      name: b.bucket,
      value: b.totalAR,
    }))
    
    const customerMap = new Map()
    outstandingInvoices.forEach((inv: any) => {
      const customerId = inv.customer?.id
      const customerName = inv.customer?.companyName || 'Unknown'
      
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          current: 0,
          days1to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90plus: 0,
          totalAR: 0,
        })
      }
      
      const customer = customerMap.get(customerId)
      const dueDate = new Date(inv.dueDate)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const paid = (inv.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0)
      const balance = inv.totalAmount - paid
      
      if (daysOverdue <= 30) customer.current += balance
      else if (daysOverdue <= 60) customer.days1to30 += balance
      else if (daysOverdue <= 90) customer.days31to60 += balance
      else if (daysOverdue <= 120) customer.days61to90 += balance
      else customer.days90plus += balance
      
      customer.totalAR += balance
    })
    
    const byCustomer = Array.from(customerMap.values())
    
    return {
      totalAR,
      totalReserve,
      byBucket,
      chartData,
      pieData,
      byCustomer,
    }
  }, [data])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading AR aging data...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading AR aging data: {error.message}</div>
      </div>
    )
  }
  
  if (!agingData) {
    return (
      <div className="p-8">
        <div className="text-muted-foreground">No data available</div>
      </div>
    )
  }
  
  const chartData = agingData.chartData || []
  const pieData = agingData.pieData || []
  
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#991b1b']
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">AR Aging Analysis</h1>
        <p className="text-slate-600 mt-1">Accounts receivable aging with reserve calculations</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total AR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(agingData.totalAR)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Reserve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(agingData.totalReserve)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Reserve Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent((agingData.totalReserve / agingData.totalAR) * 100)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Net AR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(agingData.totalAR - agingData.totalReserve)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>AR Aging by Bucket</CardTitle>
            <CardDescription>Outstanding receivables and reserves</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
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
        
        <Card>
          <CardHeader>
            <CardTitle>AR Distribution</CardTitle>
            <CardDescription>Breakdown by aging bucket</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Aging Bucket Summary</CardTitle>
          <CardDescription>Reserve calculations by aging category</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aging Bucket</TableHead>
                <TableHead className="text-right">Invoice Count</TableHead>
                <TableHead className="text-right">Total AR</TableHead>
                <TableHead className="text-right">Reserve %</TableHead>
                <TableHead className="text-right">Reserve Amount</TableHead>
                <TableHead className="text-right">Net AR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agingData.byBucket.map((bucket: any) => (
                <TableRow key={bucket.bucket}>
                  <TableCell className="font-medium">{bucket.bucket}</TableCell>
                  <TableCell className="text-right">{bucket.invoiceCount}</TableCell>
                  <TableCell className="text-right">{formatCurrency(bucket.totalAR)}</TableCell>
                  <TableCell className="text-right">{formatPercent(bucket.reservePercentage)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(bucket.reserveAmount)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(bucket.totalAR - bucket.reserveAmount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-slate-50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {agingData.byBucket.reduce((sum: number, b: any) => sum + b.invoiceCount, 0)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(agingData.totalAR)}</TableCell>
                <TableCell className="text-right">
                  {formatPercent((agingData.totalReserve / agingData.totalAR) * 100)}
                </TableCell>
                <TableCell className="text-right text-red-600">{formatCurrency(agingData.totalReserve)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(agingData.totalAR - agingData.totalReserve)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Aging Detail</CardTitle>
          <CardDescription>AR aging by customer</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">1-30 Days</TableHead>
                <TableHead className="text-right">31-60 Days</TableHead>
                <TableHead className="text-right">61-90 Days</TableHead>
                <TableHead className="text-right">90+ Days</TableHead>
                <TableHead className="text-right">Total AR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agingData.byCustomer.map((customer: any) => (
                <TableRow key={customer.customerId}>
                  <TableCell className="font-medium">{customer.customerName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(customer.current)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(customer.days1to30)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(customer.days31to60)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(customer.days61to90)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(customer.days90plus)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(customer.totalAR)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

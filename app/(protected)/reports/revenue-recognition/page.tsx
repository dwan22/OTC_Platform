'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { db } from "@/lib/db"
import { useMemo } from "react"
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns"
import { Info } from "lucide-react"

export default function RevenueRecognitionPage() {
  const { isLoading, error, data: queryData } = db.useQuery({
    contracts: {
      customer: {},
      subscriptionTier: {},
    },
    revenueSchedules: {
      contract: {
        customer: {},
      },
    },
  })
  
  const data = useMemo(() => {
    if (!queryData?.contracts) return null
    
    const allContracts = queryData.contracts
    const contracts = allContracts.filter((c: any) => c.status !== 'VOID')
    const today = new Date()
    
    // Generate revenue schedules from contracts (straight-line based on contract dates)
    const contractSchedules = contracts.flatMap((contract: any) => {
      const startDate = new Date(contract.startDate)
      const endDate = new Date(contract.endDate)
      const totalValue = contract.totalContractValue || 0
      
      // Calculate total days in contract
      const totalDays = Math.max(1, Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
      
      // Calculate daily revenue rate
      const dailyRate = totalValue / totalDays
      
      // Calculate how much should be recognized so far
      const daysPassed = Math.min(totalDays, Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))))
      const recognizedAmount = dailyRate * daysPassed
      const deferredAmount = totalValue - recognizedAmount
      
      return {
        id: contract.id,
        customerName: contract.customer?.companyName || 'Unknown',
        contractNumber: contract.contractNumber,
        periodStart: contract.startDate,
        periodEnd: contract.endDate,
        scheduledAmount: totalValue,
        recognizedAmount: Math.max(0, recognizedAmount),
        deferredAmount: Math.max(0, deferredAmount),
        status: today > endDate ? 'RECOGNIZED' : (today < startDate ? 'PENDING' : 'IN_PROGRESS'),
      }
    })
    
    const schedules = contractSchedules
    
    const totalScheduled = schedules.reduce((sum: number, s: any) => sum + s.scheduledAmount, 0)
    const totalRecognized = schedules.reduce((sum: number, s: any) => sum + s.recognizedAmount, 0)
    const totalDeferred = schedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0)
    
    // Calculate monthly revenue waterfall
    const monthlyMap = new Map()
    
    for (let i = -6; i <= 11; i++) {
      const monthDate = i < 0 ? subMonths(today, Math.abs(i)) : addMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthKey = format(monthDate, 'MMM yyyy')
      
      let monthRevenue = 0
      
      // Calculate revenue for this month from all active contracts
      contracts.forEach((contract: any) => {
        const contractStart = new Date(contract.startDate)
        const contractEnd = new Date(contract.endDate)
        const totalValue = contract.totalContractValue || 0
        
        // Skip if contract doesn't overlap with this month
        if (contractEnd < monthStart || contractStart > monthEnd) {
          return
        }
        
        // Calculate days in this month that the contract is active
        const effectiveStart = contractStart > monthStart ? contractStart : monthStart
        const effectiveEnd = contractEnd < monthEnd ? contractEnd : monthEnd
        
        const daysInMonth = Math.max(1, Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
        const totalContractDays = Math.max(1, Math.floor((contractEnd.getTime() - contractStart.getTime()) / (1000 * 60 * 60 * 24)) + 1)
        
        // Calculate pro-rated revenue for this month
        const dailyRate = totalValue / totalContractDays
        const monthlyRevenue = dailyRate * daysInMonth
        
        // Debug logging
        console.log(`Contract ${contract.contractNumber}: Month ${monthKey}, Days in month: ${daysInMonth}, Daily rate: ${dailyRate.toFixed(2)}, Monthly revenue: ${monthlyRevenue.toFixed(2)}`)
        
        monthRevenue += monthlyRevenue
      })
      
      const isPast = monthEnd < today
      const isCurrent = monthStart <= today && monthEnd >= today
      const isFuture = monthStart > today
      
      monthlyMap.set(monthKey, {
        month: monthKey,
        revenue: monthRevenue,
        type: isPast ? 'Recognized' : (isCurrent ? 'Current' : 'Forecasted'),
        isPast,
        isCurrent,
        isFuture,
      })
    }
    
    const monthlyData = Array.from(monthlyMap.values())
    
    const schedulesWithDetails = schedules.map((s: any) => ({
      id: s.id,
      customerName: s.customerName,
      contractNumber: s.contractNumber,
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      scheduledAmount: s.scheduledAmount,
      recognizedAmount: s.recognizedAmount,
      deferredAmount: s.deferredAmount,
      status: s.status,
    }))
    
    return {
      totalScheduled,
      totalRecognized,
      totalDeferred,
      monthlyData,
      schedules: schedulesWithDetails,
    }
  }, [queryData])
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading revenue recognition data...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading revenue data: {error.message}</div>
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
  
  const { totalScheduled, totalRecognized, totalDeferred, monthlyData, schedules } = data
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Revenue Recognition</h1>
        <p className="text-slate-600 mt-1">ASC 606 compliant revenue recognition tracking</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
              <div className="group relative">
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Total contract value across all active contracts that will be recognized over time
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalScheduled)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Revenue Recognized</CardTitle>
              <div className="group relative">
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Revenue that has been earned to date based on service delivery (straight-line recognition)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecognized)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Deferred Revenue</CardTitle>
              <div className="group relative">
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Revenue that has been billed but not yet earned (liability on balance sheet)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalDeferred)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Recognition Rate</CardTitle>
              <div className="group relative">
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg z-10">
                  Percentage of total scheduled revenue that has been recognized to date
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((totalRecognized / totalScheduled) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue Recognition Trend</CardTitle>
          <CardDescription>Historical, current, and forecasted revenue by month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="#3b82f6"
                name="Monthly Revenue"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monthly Revenue Waterfall</CardTitle>
          <CardDescription>Revenue earned and forecasted by month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyData.map((month: any) => (
                <TableRow key={month.month} className={month.isCurrent ? 'bg-blue-50' : ''}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(month.revenue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      month.isPast ? 'default' :
                      month.isCurrent ? 'secondary' :
                      'outline'
                    }
                    className={
                      month.isPast ? 'bg-green-600' :
                      month.isCurrent ? 'bg-blue-600 text-white' :
                      'text-slate-600 border-slate-300'
                    }
                    >
                      {month.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-bold bg-slate-50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(monthlyData.reduce((sum: number, m: any) => sum + m.revenue, 0))}
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Revenue Schedule Detail</CardTitle>
          <CardDescription>Performance obligation tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contract</TableHead>
                <TableHead>Period Start</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead className="text-right">Scheduled</TableHead>
                <TableHead className="text-right">Recognized</TableHead>
                <TableHead className="text-right">Deferred</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule: any) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.customerName}</TableCell>
                  <TableCell>{schedule.contractNumber}</TableCell>
                  <TableCell>{formatDate(schedule.periodStart)}</TableCell>
                  <TableCell>{formatDate(schedule.periodEnd)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(schedule.scheduledAmount)}
                  </TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatCurrency(schedule.recognizedAmount)}
                  </TableCell>
                  <TableCell className="text-right text-blue-600">
                    {formatCurrency(schedule.deferredAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={schedule.status === 'RECOGNIZED' ? 'default' : 'secondary'}>
                      {schedule.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

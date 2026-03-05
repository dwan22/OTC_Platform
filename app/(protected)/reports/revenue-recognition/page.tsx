'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { db } from "@/lib/db"
import { useMemo } from "react"
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns"

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
    
    const contracts = queryData.contracts
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
    
    const today = new Date()
    const monthlyMap = new Map()
    
    for (let i = -6; i <= 5; i++) {
      const monthDate = i < 0 ? subMonths(today, Math.abs(i)) : addMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthKey = format(monthDate, 'MMM yyyy')
      
      const monthSchedules = schedules.filter((s: any) => {
        const periodStart = new Date(s.periodStart)
        return periodStart >= monthStart && periodStart <= monthEnd
      })
      
      const isPast = i < 0
      const isCurrent = i === 0
      
      monthlyMap.set(monthKey, {
        month: monthKey,
        Recognized: isPast || isCurrent ? monthSchedules.reduce((sum: number, s: any) => sum + s.recognizedAmount, 0) : 0,
        Deferred: monthSchedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0),
        type: isPast ? 'past' : (isCurrent ? 'current' : 'future'),
      })
    }
    
    const monthlyData = Array.from(monthlyMap.values())
    
    const schedulesWithDetails = schedules.map((s: any) => ({
      id: s.id,
      customerName: s.contract?.customer?.companyName || 'Unknown',
      contractNumber: s.contract?.contractNumber || 'N/A',
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
            <CardTitle className="text-sm font-medium">Total Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalScheduled)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Revenue Recognized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRecognized)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Deferred Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalDeferred)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recognition Rate</CardTitle>
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
          <CardDescription>Past 6 months (recognized) and upcoming 6 months (deferred)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="Recognized" stroke="#10b981" strokeWidth={2} name="Recognized (Past)" />
              <Line type="monotone" dataKey="Deferred" stroke="#3b82f6" strokeWidth={2} name="Deferred (Future)" />
            </LineChart>
          </ResponsiveContainer>
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

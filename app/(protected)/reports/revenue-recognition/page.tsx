'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts"
import { db } from "@/lib/db"
import { useMemo, useState } from "react"
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns"
import { Info, Settings } from "lucide-react"

export default function RevenueRecognitionPage() {
  const [forecastAssumptions, setForecastAssumptions] = useState({
    monthlyGrowthRate: 5.0,
    churnRate: 2.0,
    newContractValue: 50000,
    newContractsPerMonth: 2,
  })
  
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
    
    const { monthlyGrowthRate, churnRate, newContractValue, newContractsPerMonth } = forecastAssumptions
    
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
    
    // Calculate the current MRR from active contracts
    let currentMRR = 0
    contracts.forEach((contract: any) => {
      const contractStart = new Date(contract.startDate)
      const contractEnd = new Date(contract.endDate)
      const totalValue = contract.totalContractValue || 0
      
      if (contractStart <= today && contractEnd > today) {
        const contractStartMonth = new Date(contractStart.getFullYear(), contractStart.getMonth(), 1)
        const contractEndMonth = new Date(contractEnd.getFullYear(), contractEnd.getMonth(), 1)
        
        let totalMonths = 0
        let currentMonth = new Date(contractStart.getFullYear(), contractStart.getMonth(), 1)
        
        while (currentMonth < contractEndMonth) {
          totalMonths++
          currentMonth = addMonths(currentMonth, 1)
        }
        
        currentMRR += totalValue / totalMonths
      }
    })
    
    for (let i = -6; i <= 11; i++) {
      const monthDate = i < 0 ? subMonths(today, Math.abs(i)) : addMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      const monthKey = format(monthDate, 'MMM yyyy')
      
      let monthRevenue = 0
      let forecastRevenue = 0
      
      const isPast = monthEnd < today
      const isCurrent = monthStart <= today && monthEnd >= today
      const isFuture = monthStart > today
      
      if (isFuture) {
        const monthsInFuture = i
        let projectedMRR = currentMRR
        
        for (let m = 1; m <= monthsInFuture; m++) {
          const growthFactor = 1 + (monthlyGrowthRate / 100)
          const churnFactor = 1 - (churnRate / 100)
          const newRevenue = newContractsPerMonth * (newContractValue / 12)
          
          projectedMRR = (projectedMRR * growthFactor * churnFactor) + newRevenue
        }
        
        forecastRevenue = projectedMRR
      } else {
        contracts.forEach((contract: any) => {
          const contractStart = new Date(contract.startDate)
          const contractEnd = new Date(contract.endDate)
          const totalValue = contract.totalContractValue || 0
          
          const contractStartMonth = new Date(contractStart.getFullYear(), contractStart.getMonth(), 1)
          const contractEndMonth = new Date(contractEnd.getFullYear(), contractEnd.getMonth(), 1)
          
          if (monthStart < contractStartMonth || monthStart >= contractEndMonth) {
            return
          }
          
          let totalMonths = 0
          let currentMonth = new Date(contractStart.getFullYear(), contractStart.getMonth(), 1)
          
          while (currentMonth < contractEndMonth) {
            totalMonths++
            currentMonth = addMonths(currentMonth, 1)
          }
          
          const monthlyRevenue = totalValue / totalMonths
          monthRevenue += monthlyRevenue
        })
      }
      
      monthlyMap.set(monthKey, {
        month: monthKey,
        revenue: monthRevenue,
        forecast: forecastRevenue,
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
  }, [queryData, forecastAssumptions])
  
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
      <div className="mb-4 p-4 bg-green-100 border-2 border-green-500 rounded-lg">
        <p className="text-green-900 font-bold">✅ PAGE UPDATED - If you see this, the forecast assumptions panel should be visible below!</p>
        <p className="text-sm text-green-800 mt-1">Scroll down to see the blue "📊 Forecast Assumptions" section with 4 input fields</p>
      </div>
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Revenue Recognition</h1>
        <p className="text-slate-500 mt-2 text-base font-light">ASC 606 compliant revenue recognition tracking with forecasting</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-primary opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="pb-3 relative border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Scheduled</CardTitle>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded shadow-xl z-10">
                  Total contract value across all active contracts that will be recognized over time
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">{formatCurrency(totalScheduled)}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-success opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="pb-3 relative border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue Recognized</CardTitle>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded shadow-xl z-10">
                  Revenue that has been earned to date based on service delivery (straight-line recognition)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-emerald-700">{formatCurrency(totalRecognized)}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-info opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="pb-3 relative border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deferred Revenue</CardTitle>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded shadow-xl z-10">
                  Revenue that has been billed but not yet earned (liability on balance sheet)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-sky-700">{formatCurrency(totalDeferred)}</div>
          </CardContent>
        </Card>
        
        <Card className="card-hover border border-slate-200 shadow-sm overflow-hidden relative bg-white">
          <div className="absolute inset-0 gradient-warning opacity-[0.02] pointer-events-none"></div>
          <CardHeader className="pb-3 relative border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recognition Rate</CardTitle>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-slate-400 cursor-help" />
                <div className="invisible group-hover:visible absolute left-0 top-6 w-64 p-3 bg-slate-900 text-white text-xs rounded shadow-xl z-10">
                  Percentage of total scheduled revenue that has been recognized to date
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="relative pt-4">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              {((totalRecognized / totalScheduled) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8 border-2 border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="border-b-2 border-blue-200 bg-blue-100">
          <div className="flex items-center gap-3">
            <Settings className="h-7 w-7 text-blue-700" />
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-blue-900">📊 Forecast Assumptions</CardTitle>
              <CardDescription className="text-blue-700 font-medium">Adjust these parameters to see real-time forecast updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-4 rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                📈 Monthly Growth Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={forecastAssumptions.monthlyGrowthRate}
                onChange={(e) => setForecastAssumptions(prev => ({
                  ...prev,
                  monthlyGrowthRate: parseFloat(e.target.value) || 0
                }))}
                className="w-full text-lg font-semibold border-2 border-blue-300 focus:border-blue-500"
              />
              <p className="text-xs text-slate-600 mt-2 font-medium">Expected growth in existing contracts</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                📉 Churn Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                value={forecastAssumptions.churnRate}
                onChange={(e) => setForecastAssumptions(prev => ({
                  ...prev,
                  churnRate: parseFloat(e.target.value) || 0
                }))}
                className="w-full text-lg font-semibold border-2 border-blue-300 focus:border-blue-500"
              />
              <p className="text-xs text-slate-600 mt-2 font-medium">Expected monthly customer attrition</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                💰 New Contract Value ($)
              </label>
              <Input
                type="number"
                step="1000"
                value={forecastAssumptions.newContractValue}
                onChange={(e) => setForecastAssumptions(prev => ({
                  ...prev,
                  newContractValue: parseFloat(e.target.value) || 0
                }))}
                className="w-full text-lg font-semibold border-2 border-blue-300 focus:border-blue-500"
              />
              <p className="text-xs text-slate-600 mt-2 font-medium">Average annual contract value</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border-2 border-slate-200 hover:border-blue-400 transition-colors">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                🎯 New Contracts/Month
              </label>
              <Input
                type="number"
                step="1"
                value={forecastAssumptions.newContractsPerMonth}
                onChange={(e) => setForecastAssumptions(prev => ({
                  ...prev,
                  newContractsPerMonth: parseInt(e.target.value) || 0
                }))}
                className="w-full text-lg font-semibold border-2 border-blue-300 focus:border-blue-500"
              />
              <p className="text-xs text-slate-600 mt-2 font-medium">Expected new contracts per month</p>
            </div>
          </div>
          
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-100 to-blue-50 border-2 border-blue-300 rounded-lg shadow-md">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-blue-700 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-base font-bold text-blue-900 mb-2">💡 How Forecasting Works</h4>
                <p className="text-sm text-blue-900 font-medium">
                  The forecast uses your current MRR and applies the growth rate, churn rate, and new contract assumptions 
                  to project future revenue. <span className="font-bold text-blue-700">Try changing the values above to see real-time updates in the chart below!</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-8 border border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Revenue Recognition Trend</CardTitle>
          <CardDescription className="text-slate-500 font-light">Historical, current, and forecasted revenue by month</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} style={{ fontSize: '12px', fill: '#64748b' }} />
              <YAxis style={{ fontSize: '12px', fill: '#64748b' }} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '6px', border: '1px solid #e2e8f0' }} />
              <Legend />
              <Bar 
                dataKey="revenue" 
                fill="url(#colorRevenue)"
                name="Actual Revenue"
                radius={[2, 2, 0, 0]}
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#3b82f6" 
                strokeWidth={2.5}
                strokeDasharray="5 5"
                name="Forecasted Revenue"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity={0.9}/>
                  <stop offset="100%" stopColor="#475569" stopOpacity={0.7}/>
                </linearGradient>
              </defs>
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="mb-8 border border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Monthly Revenue Waterfall</CardTitle>
          <CardDescription className="text-slate-500 font-light">Revenue earned and forecasted by month</CardDescription>
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
                <TableRow key={month.month} className={month.isCurrent ? 'bg-slate-50' : ''}>
                  <TableCell className="font-medium text-slate-700">{month.month}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {formatCurrency(month.revenue)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      month.isPast ? 'default' :
                      month.isCurrent ? 'secondary' :
                      'outline'
                    }
                    className={
                      month.isPast ? 'bg-emerald-700 hover:bg-emerald-800' :
                      month.isCurrent ? 'bg-slate-700 text-white hover:bg-slate-800' :
                      'text-slate-600 border-slate-300'
                    }
                    >
                      {month.type}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="font-semibold bg-slate-50 border-t-2 border-slate-200">
                <TableCell className="text-slate-900">Total</TableCell>
                <TableCell className="text-right text-slate-900">
                  {formatCurrency(monthlyData.reduce((sum: number, m: any) => sum + m.revenue, 0))}
                </TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Revenue Schedule Detail</CardTitle>
          <CardDescription className="text-slate-500 font-light">Performance obligation tracking</CardDescription>
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
                  <TableCell className="font-medium text-slate-700">{schedule.customerName}</TableCell>
                  <TableCell className="text-slate-600">{schedule.contractNumber}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(schedule.periodStart)}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(schedule.periodEnd)}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    {formatCurrency(schedule.scheduledAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-emerald-700">
                    {formatCurrency(schedule.recognizedAmount)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sky-700">
                    {formatCurrency(schedule.deferredAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={schedule.status === 'RECOGNIZED' ? 'default' : 'secondary'}
                      className={schedule.status === 'RECOGNIZED' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                    >
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

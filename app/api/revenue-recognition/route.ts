import { NextResponse } from 'next/server'
import { queryInstant } from '@/lib/instant-backend'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    
    const result = await queryInstant({
      revenueSchedules: {
        $: {
          limit: 100,
          order: { periodStart: 'desc' },
        },
        contract: {
          customer: {},
        },
      },
    })
    
    const schedules = result.revenueSchedules || []
    
    const totalScheduled = schedules.reduce((sum: number, s: any) => sum + s.scheduledAmount, 0)
    const totalRecognized = schedules.reduce((sum: number, s: any) => sum + s.recognizedAmount, 0)
    const totalDeferred = schedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0)
    
    const monthlyData = []
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(today, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthResult = await queryInstant({
        revenueSchedules: {
          $: {
            where: {
              periodStart: {
                $gte: monthStart.getTime(),
                $lte: monthEnd.getTime(),
              },
            },
          },
        },
      })
      
      const monthSchedules = monthResult.revenueSchedules || []
      
      const recognized = monthSchedules.reduce((sum: number, s: any) => sum + s.recognizedAmount, 0)
      const deferred = monthSchedules.reduce((sum: number, s: any) => sum + s.deferredAmount, 0)
      
      monthlyData.push({
        month: monthStart.toISOString().substring(5, 7),
        Recognized: Math.round(recognized),
        Deferred: Math.round(deferred),
      })
    }
    
    const schedulesData = schedules.map((schedule: any) => ({
      id: schedule.id,
      customerName: schedule.contract?.customer?.companyName || 'Unknown',
      contractNumber: schedule.contract?.contractNumber || 'N/A',
      periodStart: new Date(schedule.periodStart).toISOString(),
      periodEnd: new Date(schedule.periodEnd).toISOString(),
      scheduledAmount: schedule.scheduledAmount,
      recognizedAmount: schedule.recognizedAmount,
      deferredAmount: schedule.deferredAmount,
      status: schedule.status,
    }))
    
    return NextResponse.json({
      totalScheduled,
      totalRecognized,
      totalDeferred,
      monthlyData,
      schedules: schedulesData,
    })
  } catch (error) {
    console.error('Revenue Recognition API error:', error)
    return NextResponse.json({ error: 'Failed to load revenue recognition data' }, { status: 500 })
  }
}

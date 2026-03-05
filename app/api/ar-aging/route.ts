import { NextResponse } from 'next/server'
import { calculateARAging } from '@/lib/ar-aging'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const today = new Date()
    const agingData = await calculateARAging(today)
    
    const chartData = agingData.byBucket.map(bucket => ({
      name: bucket.bucket,
      'AR Balance': Math.round(bucket.totalAR),
      'Reserve': Math.round(bucket.reserveAmount),
    }))
    
    const pieData = agingData.byBucket.map(bucket => ({
      name: bucket.bucket,
      value: Math.round(bucket.totalAR),
    }))
    
    return NextResponse.json({
      ...agingData,
      chartData,
      pieData,
    })
  } catch (error) {
    console.error('AR Aging API error:', error)
    return NextResponse.json({ error: 'Failed to load AR aging data' }, { status: 500 })
  }
}

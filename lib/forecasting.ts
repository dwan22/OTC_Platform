import { queryInstant } from './instant-backend'
import { startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'

export interface MRRData {
  month: string
  mrr: number
  newMRR: number
  expansionMRR: number
  contractionMRR: number
  churnedMRR: number
}

export interface ARRData {
  month: string
  arr: number
}

export async function calculateMRR(asOfDate: Date = new Date()): Promise<MRRData[]> {
  const months = 12
  const data: MRRData[] = []
  
  for (let i = months - 1; i >= 0; i--) {
    const monthDate = subMonths(asOfDate, i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    
    const result = await queryInstant({
      contracts: {
        $: {
          where: {
            startDate: { $lte: monthEnd.getTime() },
            endDate: { $gte: monthStart.getTime() },
            status: 'ACTIVE',
          },
        },
        subscriptionTier: {},
      },
    })
    
    const contracts = result.contracts || []
    
    let mrr = 0
    
    for (const contract of contracts) {
      const price = contract.customPricing || contract.subscriptionTier?.basePrice || 0
      
      const monthlyPrice = contract.subscriptionTier?.billingFrequency === 'ANNUAL' 
        ? price / 12 
        : price
      
      mrr += monthlyPrice * contract.quantity
    }
    
    data.push({
      month: monthStart.toISOString().split('T')[0].substring(0, 7),
      mrr,
      newMRR: 0,
      expansionMRR: 0,
      contractionMRR: 0,
      churnedMRR: 0,
    })
  }
  
  return data
}

export async function calculateARR(asOfDate: Date = new Date()): Promise<number> {
  const monthStart = startOfMonth(asOfDate)
  const monthEnd = endOfMonth(asOfDate)
  
  const result = await queryInstant({
    contracts: {
      $: {
        where: {
          startDate: { $lte: monthEnd.getTime() },
          endDate: { $gte: monthStart.getTime() },
          status: 'ACTIVE',
        },
      },
      subscriptionTier: {},
    },
  })
  
  const contracts = result.contracts || []
  
  let mrr = 0
  
  for (const contract of contracts) {
    const price = contract.customPricing || contract.subscriptionTier?.basePrice || 0
    
    const monthlyPrice = contract.subscriptionTier?.billingFrequency === 'ANNUAL' 
      ? price / 12 
      : price
    
    mrr += monthlyPrice * contract.quantity
  }
  
  return mrr * 12
}

export async function calculateChurnRate(asOfDate: Date = new Date()): Promise<number> {
  const monthStart = startOfMonth(asOfDate)
  const monthEnd = endOfMonth(asOfDate)
  const previousMonthStart = startOfMonth(subMonths(asOfDate, 1))
  
  const [previousResult, churnedResult] = await Promise.all([
    queryInstant({
      contracts: {
        $: {
          where: {
            startDate: { $lte: previousMonthStart.getTime() },
            status: 'ACTIVE',
          },
        },
      },
    }),
    queryInstant({
      contracts: {
        $: {
          where: {
            endDate: { $gte: monthStart.getTime(), $lte: monthEnd.getTime() },
            status: { $in: ['CANCELLED', 'EXPIRED'] },
          },
        },
      },
    }),
  ])
  
  const previousMonthContracts = previousResult.contracts?.length || 0
  const churnedContracts = churnedResult.contracts?.length || 0
  
  if (previousMonthContracts === 0) return 0
  
  return (churnedContracts / previousMonthContracts) * 100
}

export async function calculateLTV(customerId: string): Promise<number> {
  const result = await queryInstant({
    contracts: {
      $: {
        where: {
          'customer.id': customerId,
        },
      },
      subscriptionTier: {},
    },
  })
  
  const contracts = result.contracts || []
  
  const totalRevenue = contracts.reduce((sum: number, contract: any) => {
    return sum + contract.totalContractValue
  }, 0)
  
  return totalRevenue
}

export interface RevenueWaterfallData {
  period: string
  beginningARR: number
  newARR: number
  expansionARR: number
  contractionARR: number
  churnedARR: number
  endingARR: number
}

export async function calculateRevenueWaterfall(startDate: Date, endDate: Date): Promise<RevenueWaterfallData[]> {
  const data: RevenueWaterfallData[] = []
  
  let currentDate = startOfMonth(startDate)
  const end = startOfMonth(endDate)
  
  while (currentDate <= end) {
    const previousMonth = subMonths(currentDate, 1)
    const beginningARR = await calculateARR(previousMonth)
    const endingARR = await calculateARR(currentDate)
    
    data.push({
      period: currentDate.toISOString().split('T')[0].substring(0, 7),
      beginningARR,
      newARR: 0,
      expansionARR: 0,
      contractionARR: 0,
      churnedARR: 0,
      endingARR,
    })
    
    currentDate = addMonths(currentDate, 1)
  }
  
  return data
}

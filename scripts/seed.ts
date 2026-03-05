import { init, id, tx } from '@instantdb/admin'
import { addMonths, subMonths, addDays } from 'date-fns'
import { config } from 'dotenv'

config()

const APP_ID = process.env.INSTANT_APP_ID || '79804a5a-fce5-4e35-8548-a53f8f50c6bb'
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  throw new Error('INSTANT_ADMIN_TOKEN environment variable is required')
}

const db = init({ 
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
})

async function main() {
  console.log('🌱 Starting InstantDB seed...')
  console.log(`📱 App ID: ${APP_ID}`)

  const today = new Date()
  const txs = []

  const tierIds = {
    basic: id(),
    pro: id(),
    enterprise: id(),
    enterpriseAnnual: id(),
  }

  console.log('Creating subscription tiers...')
  txs.push(
    tx.subscriptionTiers[tierIds.basic].update({
      tierName: 'Basic',
      basePrice: 200000,
      tokenLimit: 1000000,
      billingFrequency: 'MONTHLY',
      features: {
        tokens: '1M tokens/month',
        resetDate: '1st of every month',
        support: 'Email',
        sla: '99%',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    tx.subscriptionTiers[tierIds.pro].update({
      tierName: 'Pro',
      basePrice: 800000,
      tokenLimit: 5000000,
      billingFrequency: 'MONTHLY',
      features: {
        tokens: '5M tokens/month',
        resetDate: '1st of every month',
        support: 'Priority Email',
        sla: '99.5%',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    tx.subscriptionTiers[tierIds.enterprise].update({
      tierName: 'Enterprise',
      basePrice: 6000000,
      tokenLimit: 50000000,
      billingFrequency: 'MONTHLY',
      features: {
        tokens: '50M tokens/month',
        resetDate: '1st of every month',
        support: '24/7 Phone & Email',
        sla: '99.9%',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
    tx.subscriptionTiers[tierIds.enterpriseAnnual].update({
      tierName: 'Enterprise Annual',
      basePrice: 6000000,
      tokenLimit: 50000000,
      billingFrequency: 'ANNUAL',
      features: {
        tokens: '50M tokens/month',
        resetDate: '1st of every month',
        support: '24/7 Phone & Email',
        sla: '99.9%',
        discount: '17% vs monthly',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  )

  const customers = [
    { companyName: 'Startup Co', billingContact: 'John Smith', email: 'billing@startup.co', phone: '555-0101', paymentTerms: 'NET_30', creditLimit: 5000, riskTier: 'LOW' },
    { companyName: 'Growth Corp', billingContact: 'Jane Doe', email: 'ap@growthcorp.com', phone: '555-0102', paymentTerms: 'NET_30', creditLimit: 25000, riskTier: 'LOW' },
    { companyName: 'Enterprise Inc', billingContact: 'Bob Johnson', email: 'finance@enterprise.inc', phone: '555-0103', paymentTerms: 'NET_45', creditLimit: 100000, riskTier: 'LOW' },
    { companyName: 'Strategic Partners LLC', billingContact: 'Alice Williams', email: 'accounting@strategic.com', phone: '555-0104', paymentTerms: 'NET_60', creditLimit: 250000, riskTier: 'LOW' },
    { companyName: 'TechVenture Labs', billingContact: 'Michael Chen', email: 'billing@techventure.io', phone: '555-0105', paymentTerms: 'NET_30', creditLimit: 15000, riskTier: 'MEDIUM' },
    { companyName: 'DataFlow Systems', billingContact: 'Sarah Martinez', email: 'ap@dataflow.com', phone: '555-0106', paymentTerms: 'NET_30', creditLimit: 50000, riskTier: 'LOW' },
    { companyName: 'CloudScale Inc', billingContact: 'David Lee', email: 'finance@cloudscale.io', phone: '555-0107', paymentTerms: 'NET_30', creditLimit: 75000, riskTier: 'LOW' },
    { companyName: 'InnovateTech', billingContact: 'Emily Brown', email: 'billing@innovatetech.com', phone: '555-0108', paymentTerms: 'NET_30', creditLimit: 10000, riskTier: 'MEDIUM' },
    { companyName: 'AI Solutions Group', billingContact: 'James Wilson', email: 'ap@aisolutions.com', phone: '555-0109', paymentTerms: 'NET_45', creditLimit: 150000, riskTier: 'LOW' },
    { companyName: 'Digital Dynamics', billingContact: 'Lisa Anderson', email: 'finance@digitaldynamics.com', phone: '555-0110', paymentTerms: 'NET_30', creditLimit: 30000, riskTier: 'LOW' },
    { companyName: 'FutureTech Ventures', billingContact: 'Robert Taylor', email: 'billing@futuretech.vc', phone: '555-0111', paymentTerms: 'NET_30', creditLimit: 20000, riskTier: 'MEDIUM' },
    { companyName: 'SmartData Analytics', billingContact: 'Jennifer White', email: 'ap@smartdata.io', phone: '555-0112', paymentTerms: 'NET_30', creditLimit: 40000, riskTier: 'LOW' },
    { companyName: 'NexGen Software', billingContact: 'Christopher Moore', email: 'finance@nexgen.com', phone: '555-0113', paymentTerms: 'NET_30', creditLimit: 35000, riskTier: 'LOW' },
    { companyName: 'Quantum Computing Co', billingContact: 'Amanda Garcia', email: 'billing@quantum.co', phone: '555-0114', paymentTerms: 'NET_45', creditLimit: 200000, riskTier: 'LOW' },
    { companyName: 'ByteStream Technologies', billingContact: 'Daniel Martinez', email: 'ap@bytestream.tech', phone: '555-0115', paymentTerms: 'NET_30', creditLimit: 25000, riskTier: 'MEDIUM' },
  ]

  console.log('Creating customers...')
  const customerIds = customers.map(() => id())
  
  customers.forEach((customer, i) => {
    txs.push(
      tx.customers[customerIds[i]].update({
        ...customer,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    )
  })

  const contracts = [
    { customerId: customerIds[0], tierId: tierIds.basic, contractNumber: 'CNT-2025-001', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 1, tcv: 200000 * 12 },
    { customerId: customerIds[1], tierId: tierIds.pro, contractNumber: 'CNT-2025-002', startDate: subMonths(today, 5), endDate: addMonths(today, 7), quantity: 1, tcv: 800000 * 12 },
    { customerId: customerIds[2], tierId: tierIds.enterprise, contractNumber: 'CNT-2025-003', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 1, tcv: 5400000 * 12, customPricing: 5400000, rebateTerms: { type: 'volume', tiers: [{ minQuantity: 100, discountPercent: 10 }] } },
    { customerId: customerIds[3], tierId: tierIds.enterpriseAnnual, contractNumber: 'CNT-2025-004', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 150, tcv: 6000000 * 12, customPricing: 5000000, rebateTerms: { type: 'volume', tiers: [{ minQuantity: 50, discountPercent: 5 }, { minQuantity: 100, discountPercent: 10 }, { minQuantity: 200, discountPercent: 15 }] } },
    { customerId: customerIds[4], tierId: tierIds.pro, contractNumber: 'CNT-2025-005', startDate: subMonths(today, 4), endDate: addMonths(today, 8), quantity: 1, tcv: 800000 * 12 },
    { customerId: customerIds[5], tierId: tierIds.enterprise, contractNumber: 'CNT-2025-006', startDate: subMonths(today, 5), endDate: addMonths(today, 7), quantity: 1, tcv: 6000000 * 12 },
    { customerId: customerIds[6], tierId: tierIds.enterprise, contractNumber: 'CNT-2025-007', startDate: subMonths(today, 3), endDate: addMonths(today, 9), quantity: 2, tcv: 6000000 * 12 * 2 },
    { customerId: customerIds[7], tierId: tierIds.basic, contractNumber: 'CNT-2025-008', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 1, tcv: 200000 * 12 },
    { customerId: customerIds[8], tierId: tierIds.enterpriseAnnual, contractNumber: 'CNT-2025-009', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 1, tcv: 6000000 * 12 },
    { customerId: customerIds[9], tierId: tierIds.pro, contractNumber: 'CNT-2025-010', startDate: subMonths(today, 5), endDate: addMonths(today, 7), quantity: 1, tcv: 800000 * 12 },
    { customerId: customerIds[10], tierId: tierIds.pro, contractNumber: 'CNT-2025-011', startDate: subMonths(today, 4), endDate: addMonths(today, 8), quantity: 1, tcv: 800000 * 12 },
    { customerId: customerIds[11], tierId: tierIds.enterprise, contractNumber: 'CNT-2025-012', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 1, tcv: 6000000 * 12 },
    { customerId: customerIds[12], tierId: tierIds.pro, contractNumber: 'CNT-2025-013', startDate: subMonths(today, 3), endDate: addMonths(today, 9), quantity: 1, tcv: 800000 * 12 },
    { customerId: customerIds[13], tierId: tierIds.enterpriseAnnual, contractNumber: 'CNT-2025-014', startDate: subMonths(today, 6), endDate: addMonths(today, 6), quantity: 3, tcv: 6000000 * 12 * 3 },
    { customerId: customerIds[14], tierId: tierIds.pro, contractNumber: 'CNT-2025-015', startDate: subMonths(today, 5), endDate: addMonths(today, 7), quantity: 1, tcv: 800000 * 12 },
  ]

  console.log('Creating contracts...')
  const contractIds = contracts.map(() => id())
  
  contracts.forEach((contract, i) => {
    const contractTx = tx.contracts[contractIds[i]].update({
      contractNumber: contract.contractNumber,
      startDate: contract.startDate.getTime(),
      endDate: contract.endDate.getTime(),
      status: 'ACTIVE',
      totalContractValue: contract.tcv,
      quantity: contract.quantity,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...(contract.customPricing && { customPricing: contract.customPricing }),
      ...(contract.rebateTerms && { rebateTerms: contract.rebateTerms }),
    })
      .link({ customer: contract.customerId })
      .link({ subscriptionTier: contract.tierId })
    
    txs.push(contractTx)
  })

  console.log('Creating invoices and payments...')
  let invoiceCounter = 1
  
  for (let monthOffset = 6; monthOffset >= 0; monthOffset--) {
    const invoiceDate = subMonths(today, monthOffset)
    
    for (let i = 0; i < contracts.length; i++) {
      const contract = contracts[i]
      
      if (invoiceDate >= contract.startDate && invoiceDate <= contract.endDate) {
        const customer = customers[i]
        const tierId = contract.tierId
        
        let amount = contract.customPricing || 0
        
        if (!amount) {
          if (tierId === tierIds.basic) amount = 200000
          else if (tierId === tierIds.pro) amount = 800000
          else if (tierId === tierIds.enterprise) amount = 6000000
          else if (tierId === tierIds.enterpriseAnnual) amount = 6000000
        }
        
        amount = amount * contract.quantity
        
        const dueDate = customer.paymentTerms === 'NET_30' 
          ? addDays(invoiceDate, 30)
          : customer.paymentTerms === 'NET_45'
          ? addDays(invoiceDate, 45)
          : addDays(invoiceDate, 60)
        
        let status = 'SENT'
        if (dueDate < today) {
          status = 'OVERDUE'
        }
        if (monthOffset <= 1) {
          status = 'PAID'
        }
        
        const invoiceId = id()
        const invoiceNum = `INV-2025-${String(invoiceCounter).padStart(4, '0')}`
        
        txs.push(
          tx.invoices[invoiceId].update({
            invoiceNumber: invoiceNum,
            invoiceDate: invoiceDate.getTime(),
            dueDate: dueDate.getTime(),
            amount,
            taxAmount: 0,
            totalAmount: amount,
            status,
            paymentTerms: customer.paymentTerms,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
            .link({ customer: customerIds[i] })
            .link({ contract: contractIds[i] })
        )
        
        txs.push(
          tx.journalEntries[id()].update({
            entryDate: invoiceDate.getTime(),
            entryType: 'INVOICE',
            accountCode: '1100',
            accountName: 'Accounts Receivable',
            debitAmount: amount,
            creditAmount: 0,
            referenceType: 'INVOICE',
            referenceId: invoiceId,
            description: `Invoice ${invoiceNum}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
          tx.journalEntries[id()].update({
            entryDate: invoiceDate.getTime(),
            entryType: 'INVOICE',
            accountCode: '2300',
            accountName: 'Deferred Revenue',
            debitAmount: 0,
            creditAmount: amount,
            referenceType: 'INVOICE',
            referenceId: invoiceId,
            description: `Invoice ${invoiceNum}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
        
        if (status === 'PAID') {
          const paymentDate = addDays(invoiceDate, 15)
          const paymentId = id()
          
          txs.push(
            tx.payments[paymentId].update({
              paymentDate: paymentDate.getTime(),
              amount,
              paymentMethod: 'ACH',
              referenceNumber: `PAY-${invoiceNum.replace('INV-', '')}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
              .link({ invoice: invoiceId })
              .link({ customer: customerIds[i] })
          )
          
          txs.push(
            tx.journalEntries[id()].update({
              entryDate: paymentDate.getTime(),
              entryType: 'PAYMENT',
              accountCode: '1000',
              accountName: 'Cash',
              debitAmount: amount,
              creditAmount: 0,
              referenceType: 'PAYMENT',
              referenceId: paymentId,
              description: `Payment PAY-${invoiceNum.replace('INV-', '')}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
            tx.journalEntries[id()].update({
              entryDate: paymentDate.getTime(),
              entryType: 'PAYMENT',
              accountCode: '1100',
              accountName: 'Accounts Receivable',
              debitAmount: 0,
              creditAmount: amount,
              referenceType: 'PAYMENT',
              referenceId: paymentId,
              description: `Payment PAY-${invoiceNum.replace('INV-', '')}`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          )
        } else if (status === 'OVERDUE' && Math.random() > 0.5) {
          const paymentDate = addDays(dueDate, 5)
          const partialAmount = amount * 0.5
          const paymentId = id()
          
          txs.push(
            tx.payments[paymentId].update({
              paymentDate: paymentDate.getTime(),
              amount: partialAmount,
              paymentMethod: 'ACH',
              referenceNumber: `PAY-${invoiceNum.replace('INV-', '')}-PARTIAL`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
              .link({ invoice: invoiceId })
              .link({ customer: customerIds[i] })
          )
          
          txs.push(
            tx.journalEntries[id()].update({
              entryDate: paymentDate.getTime(),
              entryType: 'PAYMENT',
              accountCode: '1000',
              accountName: 'Cash',
              debitAmount: partialAmount,
              creditAmount: 0,
              referenceType: 'PAYMENT',
              referenceId: paymentId,
              description: `Payment PAY-${invoiceNum.replace('INV-', '')}-PARTIAL`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            }),
            tx.journalEntries[id()].update({
              entryDate: paymentDate.getTime(),
              entryType: 'PAYMENT',
              accountCode: '1100',
              accountName: 'Accounts Receivable',
              debitAmount: 0,
              creditAmount: partialAmount,
              referenceType: 'PAYMENT',
              referenceId: paymentId,
              description: `Payment PAY-${invoiceNum.replace('INV-', '')}-PARTIAL`,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
          )
        }
        
        invoiceCounter++
      }
    }
  }

  console.log('Creating revenue schedules...')
  for (let i = 0; i < contracts.length; i++) {
    const contract = contracts[i]
    const monthsInContract = 12
    const monthlyAmount = contract.tcv / monthsInContract
    
    for (let m = 0; m < monthsInContract; m++) {
      const periodStart = addMonths(contract.startDate, m)
      const periodEnd = addMonths(periodStart, 1)
      
      const isPast = periodEnd < today
      
      const scheduleId = id()
      
      txs.push(
        tx.revenueSchedules[scheduleId].update({
          periodStart: periodStart.getTime(),
          periodEnd: periodEnd.getTime(),
          scheduledAmount: monthlyAmount,
          recognizedAmount: isPast ? monthlyAmount : 0,
          deferredAmount: isPast ? 0 : monthlyAmount,
          status: isPast ? 'RECOGNIZED' : 'PENDING',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }).link({ contract: contractIds[i] })
      )
      
      if (isPast) {
        txs.push(
          tx.journalEntries[id()].update({
            entryDate: periodEnd.getTime(),
            entryType: 'REVENUE_RECOGNITION',
            accountCode: '2300',
            accountName: 'Deferred Revenue',
            debitAmount: monthlyAmount,
            creditAmount: 0,
            referenceType: 'REVENUE_SCHEDULE',
            referenceId: scheduleId,
            description: `Revenue recognition for ${periodStart.toISOString().split('T')[0]}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
          tx.journalEntries[id()].update({
            entryDate: periodEnd.getTime(),
            entryType: 'REVENUE_RECOGNITION',
            accountCode: '4000',
            accountName: 'Subscription Revenue',
            debitAmount: 0,
            creditAmount: monthlyAmount,
            referenceType: 'REVENUE_SCHEDULE',
            referenceId: scheduleId,
            description: `Revenue recognition for ${periodStart.toISOString().split('T')[0]}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        )
      }
    }
  }

  console.log('Creating AR reserves...')
  const agingBuckets = [
    { bucket: 'Current', totalAR: 15000, reservePercentage: 1, reserveAmount: 150 },
    { bucket: '1-30 Days', totalAR: 8000, reservePercentage: 5, reserveAmount: 400 },
    { bucket: '31-60 Days', totalAR: 5000, reservePercentage: 15, reserveAmount: 750 },
    { bucket: '61-90 Days', totalAR: 2000, reservePercentage: 35, reserveAmount: 700 },
    { bucket: '90+ Days', totalAR: 1000, reservePercentage: 60, reserveAmount: 600 },
  ]

  for (const bucket of agingBuckets) {
    txs.push(
      tx.arReserves[id()].update({
        periodEndDate: today.getTime(),
        agingBucket: bucket.bucket,
        totalAR: bucket.totalAR,
        reservePercentage: bucket.reservePercentage,
        reserveAmount: bucket.reserveAmount,
        badDebtExpense: bucket.reserveAmount,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    )
  }

  console.log(`📦 Executing ${txs.length} transactions...`)
  
  const batchSize = 100
  for (let i = 0; i < txs.length; i += batchSize) {
    const batch = txs.slice(i, i + batchSize)
    console.log(`   Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(txs.length / batchSize)}...`)
    await db.transact(batch)
  }

  console.log('✅ Seed completed successfully!')
  console.log(`   - ${customers.length} customers`)
  console.log(`   - ${contracts.length} contracts`)
  console.log(`   - Revenue schedules and journal entries created`)
  console.log(`   - AR reserves initialized`)
}

main()
  .then(() => {
    console.log('🎉 All done!')
    process.exit(0)
  })
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })

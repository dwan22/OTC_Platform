'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { use } from "react"

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const { isLoading, error, data } = db.useQuery({
    contracts: {
      $: {
        where: { id },
      },
      customer: {},
      subscriptionTier: {},
      invoices: {},
      revenueSchedules: {},
    },
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading contract...</p>
        </div>
      </div>
    )
  }
  
  if (error || !data?.contracts?.[0]) {
    return (
      <div className="p-8">
        <div className="text-red-600">Contract not found</div>
      </div>
    )
  }
  
  const contract = data.contracts[0]
  
  const totalInvoiced = (contract.invoices || []).reduce((sum: number, invoice: any) => {
    return sum + invoice.totalAmount
  }, 0)
  
  const totalRecognized = (contract.revenueSchedules || []).reduce((sum: number, schedule: any) => {
    return sum + schedule.recognizedAmount
  }, 0)
  
  const totalDeferred = (contract.revenueSchedules || []).reduce((sum: number, schedule: any) => {
    return sum + schedule.deferredAmount
  }, 0)
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/contracts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{contract.contractNumber}</h1>
            <p className="text-slate-600 mt-1">{contract.customer?.companyName}</p>
          </div>
          <Badge variant={contract.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {contract.status}
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Contract Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(contract.totalContractValue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
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
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
            <CardDescription>Subscription terms and pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Subscription Tier</div>
                <div className="text-base">{contract.subscriptionTier?.tierName || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Billing Frequency</div>
                <div className="text-base">{contract.subscriptionTier?.billingFrequency || 'N/A'}</div>
              </div>
              {contract.subscriptionTier?.tokenLimit && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Token Limit</div>
                  <div className="text-base">
                    {(contract.subscriptionTier.tokenLimit / 1000000).toFixed(0)}M tokens/month
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                <div className="text-base">{formatDate(contract.startDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">End Date</div>
                <div className="text-base">{formatDate(contract.endDate)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Quantity</div>
                <div className="text-base">{contract.quantity}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Base Price</div>
                <div className="text-base">
                  {formatCurrency(contract.subscriptionTier?.basePrice || 0)}
                </div>
              </div>
              {contract.customPricing && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Custom Pricing</div>
                  <div className="text-base font-semibold text-blue-600">
                    {formatCurrency(contract.customPricing)}
                  </div>
                </div>
              )}
            </div>
            
            {contract.rebateTerms && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">Rebate Terms</div>
                <pre className="text-xs bg-slate-100 p-3 rounded">
                  {JSON.stringify(contract.rebateTerms, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Company</div>
                <div className="text-base">{contract.customer?.companyName || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Contact</div>
                <div className="text-base">{contract.customer?.billingContact || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Email</div>
                <div className="text-base">{contract.customer?.email || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Payment Terms</div>
                <div className="text-base">{contract.customer?.paymentTerms?.replace('_', ' ') || 'N/A'}</div>
              </div>
            </div>
            {contract.customer && (
              <div className="pt-4">
                <Link href={`/customers/${contract.customer.id}`}>
                  <Button variant="outline" size="sm">View Customer</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue Recognition Schedule</CardTitle>
          <CardDescription>ASC 606 compliant revenue recognition</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period Start</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Recognized</TableHead>
                <TableHead>Deferred</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(contract.revenueSchedules || []).map((schedule: any) => (
                <TableRow key={schedule.id}>
                  <TableCell>{formatDate(schedule.periodStart)}</TableCell>
                  <TableCell>{formatDate(schedule.periodEnd)}</TableCell>
                  <TableCell>{formatCurrency(schedule.scheduledAmount)}</TableCell>
                  <TableCell className="text-green-600">
                    {formatCurrency(schedule.recognizedAmount)}
                  </TableCell>
                  <TableCell className="text-blue-600">
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
      
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Billing history for this contract</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(contract.invoices || []).map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'PAID' ? 'default' :
                      invoice.status === 'OVERDUE' ? 'destructive' :
                      'secondary'
                    }>
                      {invoice.status}
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

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import { id } from "@instantdb/react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Save, X, CheckCircle, RotateCcw } from "lucide-react"
import { useState } from "react"
import { addDays } from "date-fns"

export default function InvoicesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customerId: '',
    contractId: '',
    amount: '',
    taxAmount: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    servicePeriodStart: new Date().toISOString().split('T')[0],
    servicePeriodEnd: '',
    paymentTerms: 'NET_30',
  })
  
  const { isLoading, error, data } = db.useQuery({
    invoices: {
      customer: {},
      contract: {},
      payments: {},
    },
    customers: {},
    contracts: {
      customer: {},
      subscriptionTier: {},
    },
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading invoices: {error.message}</div>
      </div>
    )
  }
  
  const invoices = data?.invoices || []
  const customers = data?.customers || []
  const contracts = data?.contracts || []
  
  const sortedInvoices = [...invoices].sort((a: any, b: any) => {
    return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
  })
  
  const filteredContracts = formData.customerId 
    ? contracts.filter((c: any) => c.customer?.id === formData.customerId)
    : []
  
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear()
    const count = invoices.length + 1
    return `INV-${year}-${String(count).padStart(4, '0')}`
  }
  
  const calculateDueDate = (invoiceDate: string, terms: string) => {
    const date = new Date(invoiceDate)
    switch (terms) {
      case 'NET_15':
        return addDays(date, 15).toISOString().split('T')[0]
      case 'NET_30':
        return addDays(date, 30).toISOString().split('T')[0]
      case 'NET_60':
        return addDays(date, 60).toISOString().split('T')[0]
      case 'DUE_ON_RECEIPT':
        return invoiceDate
      default:
        return addDays(date, 30).toISOString().split('T')[0]
    }
  }
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId || !formData.amount || !formData.servicePeriodStart || !formData.servicePeriodEnd) {
      alert('Please fill in all required fields including service period')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const invoiceId = id()
      const amount = parseFloat(formData.amount)
      const taxAmount = formData.taxAmount ? parseFloat(formData.taxAmount) : 0
      const totalAmount = amount + taxAmount
      const dueDate = calculateDueDate(formData.invoiceDate, formData.paymentTerms)
      
      console.log('Creating invoice with data:', {
        invoiceNumber: generateInvoiceNumber(),
        amount,
        taxAmount,
        totalAmount,
        invoiceDate: new Date(formData.invoiceDate).getTime(),
        dueDate: new Date(dueDate).getTime(),
      })
      
      const invoiceData: any = {
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date(formData.invoiceDate).getTime(),
        dueDate: new Date(dueDate).getTime(),
        amount,
        taxAmount,
        totalAmount,
        status: 'PENDING',
        paymentTerms: formData.paymentTerms,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      
      if (formData.servicePeriodStart) {
        invoiceData.servicePeriodStart = new Date(formData.servicePeriodStart).getTime()
      }
      if (formData.servicePeriodEnd) {
        invoiceData.servicePeriodEnd = new Date(formData.servicePeriodEnd).getTime()
      }
      
      const invoiceTx = db.tx.invoices[invoiceId]
        .update(invoiceData)
        .link({ customer: formData.customerId })
      
      if (formData.contractId) {
        invoiceTx.link({ contract: formData.contractId })
      }
      
      const transactions: any[] = [invoiceTx]
      
      if (formData.servicePeriodStart && formData.servicePeriodEnd) {
        const revenueScheduleId = id()
        const servicePeriodStart = new Date(formData.servicePeriodStart)
        const servicePeriodEnd = new Date(formData.servicePeriodEnd)
        const isPastService = servicePeriodEnd < new Date()
        
        const revenueScheduleTx = db.tx.revenueSchedules[revenueScheduleId]
          .update({
            periodStart: servicePeriodStart.getTime(),
            periodEnd: servicePeriodEnd.getTime(),
            scheduledAmount: totalAmount,
            recognizedAmount: isPastService ? totalAmount : 0,
            deferredAmount: isPastService ? 0 : totalAmount,
            status: isPastService ? 'RECOGNIZED' : 'PENDING',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({ invoice: invoiceId })
        
        if (formData.contractId) {
          revenueScheduleTx.link({ contract: formData.contractId })
        }
        
        transactions.push(revenueScheduleTx)
      }
      
      const result = await db.transact(transactions)
      
      console.log('Invoice created successfully:', result)
      
      setFormData({
        customerId: '',
        contractId: '',
        amount: '',
        taxAmount: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        servicePeriodStart: new Date().toISOString().split('T')[0],
        servicePeriodEnd: '',
        paymentTerms: 'NET_30',
      })
      setIsCreating(false)
      setIsSubmitting(false)
    } catch (error: any) {
      console.error('Error creating invoice:', error)
      alert(`Failed to create invoice: ${error.message}`)
      setIsSubmitting(false)
    }
  }
  
  const handleMarkAsPaid = async (invoice: any) => {
    const totalPaid = (invoice.payments || []).reduce((sum: number, payment: any) => {
      return sum + payment.amount
    }, 0)
    const balance = invoice.totalAmount - totalPaid
    
    // If balance is 0 (already has payment records), just update status
    if (balance <= 0) {
      if (!confirm(`Mark invoice ${invoice.invoiceNumber} as PAID?\n\nThis invoice already has payment records. Status will be updated to PAID.`)) {
        return
      }
      
      try {
        await db.transact([
          db.tx.invoices[invoice.id].update({
            status: 'PAID',
            updatedAt: Date.now(),
          })
        ])
        
        console.log('Invoice status updated to PAID')
      } catch (error: any) {
        console.error('Error updating invoice status:', error)
        alert(`Failed to mark invoice as paid: ${error.message}`)
      }
      return
    }
    
    // If there's a balance, create a payment record
    if (!confirm(`Mark invoice ${invoice.invoiceNumber} as PAID?\n\nThis will create a payment record for ${formatCurrency(balance)}`)) {
      return
    }
    
    try {
      const paymentId = id()
      
      const transactions = [
        db.tx.invoices[invoice.id].update({
          status: 'PAID',
          updatedAt: Date.now(),
        }),
        db.tx.payments[paymentId]
          .update({
            paymentDate: Date.now(),
            amount: balance,
            paymentMethod: 'ACH',
            referenceNumber: `AUTO-${invoice.invoiceNumber}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({ invoice: invoice.id })
          .link({ customer: invoice.customer.id })
      ]
      
      await db.transact(transactions)
      
      console.log('Invoice marked as paid and payment created')
    } catch (error: any) {
      console.error('Error marking invoice as paid:', error)
      alert(`Failed to mark invoice as paid: ${error.message}`)
    }
  }
  
  const handleReopenInvoice = async (invoice: any) => {
    if (!confirm(`Reopen invoice ${invoice.invoiceNumber}?\n\nThis will change the status back to PENDING.`)) {
      return
    }
    
    try {
      await db.transact([
        db.tx.invoices[invoice.id].update({
          status: 'PENDING',
          updatedAt: Date.now(),
        })
      ])
      
      console.log('Invoice reopened successfully')
    } catch (error: any) {
      console.error('Error reopening invoice:', error)
      alert(`Failed to reopen invoice: ${error.message}`)
    }
  }
  
  const totalInvoiced = invoices.reduce((sum: number, invoice: any) => {
    return sum + invoice.totalAmount
  }, 0)
  
  const totalPaid = invoices.reduce((sum: number, invoice: any) => {
    const paid = (invoice.payments || []).reduce((pSum: number, payment: any) => {
      return pSum + payment.amount
    }, 0)
    return sum + paid
  }, 0)
  
  const totalOutstanding = totalInvoiced - totalPaid
  
  const overdueInvoices = invoices.filter((inv: any) => inv.status === 'OVERDUE').length
  
  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-1">Manage customer invoices and billing</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
            </>
          )}
        </Button>
      </div>
      
      {isCreating && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
            <CardDescription>Generate an invoice for a customer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, customerId: value, contractId: '' })
                    }}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contract">Contract (Optional)</Label>
                  <Select
                    value={formData.contractId}
                    onValueChange={(value) => setFormData({ ...formData, contractId: value })}
                    disabled={!formData.customerId || isSubmitting}
                  >
                    <SelectTrigger id="contract">
                      <SelectValue placeholder="Select a contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredContracts.map((contract: any) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.contractNumber} - {contract.subscriptionTier?.tierName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={formData.invoiceDate}
                    onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms *</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="paymentTerms">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DUE_ON_RECEIPT">Due on Receipt</SelectItem>
                      <SelectItem value="NET_15">Net 15</SelectItem>
                      <SelectItem value="NET_30">Net 30</SelectItem>
                      <SelectItem value="NET_60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servicePeriodStart">Service Period Start *</Label>
                  <Input
                    id="servicePeriodStart"
                    type="date"
                    value={formData.servicePeriodStart}
                    onChange={(e) => setFormData({ ...formData, servicePeriodStart: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="servicePeriodEnd">Service Period End *</Label>
                  <Input
                    id="servicePeriodEnd"
                    type="date"
                    value={formData.servicePeriodEnd}
                    onChange={(e) => setFormData({ ...formData, servicePeriodEnd: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData({ ...formData, taxAmount: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Invoice'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false)
                    setFormData({
                      customerId: '',
                      contractId: '',
                      amount: '',
                      taxAmount: '',
                      invoiceDate: new Date().toISOString().split('T')[0],
                      servicePeriodStart: new Date().toISOString().split('T')[0],
                      servicePeriodEnd: '',
                      paymentTerms: 'NET_30',
                    })
                  }}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">invoices</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>Complete invoice history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedInvoices.map((invoice: any) => {
                const totalPaid = (invoice.payments || []).reduce((sum: number, payment: any) => {
                  return sum + payment.amount
                }, 0)
                const balance = invoice.totalAmount - totalPaid
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customer?.companyName || 'Unknown'}</TableCell>
                    <TableCell>{formatDate(invoice.invoiceDate)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                    <TableCell className="text-green-600">{formatCurrency(totalPaid)}</TableCell>
                    <TableCell className={balance > 0 ? 'text-orange-600 font-medium' : ''}>
                      {formatCurrency(balance)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        invoice.status === 'PAID' ? 'default' :
                        invoice.status === 'OVERDUE' ? 'destructive' :
                        'secondary'
                      }>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {invoice.status !== 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsPaid(invoice)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Paid
                          </Button>
                        )}
                        {invoice.status === 'PAID' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReopenInvoice(invoice)}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reopen
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

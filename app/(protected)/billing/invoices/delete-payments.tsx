'use client'

import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export function DeletePaymentsUtility() {
  const [result, setResult] = useState<string>('')
  
  const { data } = db.useQuery({
    invoices: {
      payments: {},
    },
  })
  
  const deleteDecemberPayments = async () => {
    if (!data?.invoices) {
      setResult('No invoices found')
      return
    }
    
    // Find December 2025 invoice (you can adjust the filter as needed)
    const decemberInvoice = data.invoices.find((inv: any) => 
      inv.invoiceNumber?.includes('DEC') || 
      inv.invoiceNumber?.includes('12') ||
      (inv.servicePeriodStart && new Date(inv.servicePeriodStart).getMonth() === 11 && 
       new Date(inv.servicePeriodStart).getFullYear() === 2025)
    )
    
    if (!decemberInvoice) {
      setResult('December invoice not found')
      return
    }
    
    if (!decemberInvoice.payments || decemberInvoice.payments.length === 0) {
      setResult(`Invoice ${decemberInvoice.invoiceNumber} has no payments to delete`)
      return
    }
    
    if (!confirm(`Delete ${decemberInvoice.payments.length} payment(s) from invoice ${decemberInvoice.invoiceNumber}?`)) {
      return
    }
    
    try {
      const transactions: any[] = []
      
      decemberInvoice.payments.forEach((payment: any) => {
        transactions.push(db.tx.payments[payment.id].delete())
      })
      
      await db.transact(transactions)
      
      setResult(`✓ Deleted ${decemberInvoice.payments.length} payment(s) from invoice ${decemberInvoice.invoiceNumber}`)
    } catch (error: any) {
      setResult(`Error: ${error.message}`)
    }
  }
  
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">Delete December Invoice Payments</CardTitle>
        <CardDescription>One-time utility to zero out payments for December invoice</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={deleteDecemberPayments} variant="destructive">
          Delete December Payments
        </Button>
        {result && (
          <div className="mt-4 p-3 bg-white rounded border">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

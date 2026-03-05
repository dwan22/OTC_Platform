'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/db"
import { id, tx } from "@instantdb/react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NewCustomerPage() {
  const router = useRouter()
  const [paymentTerms, setPaymentTerms] = useState('NET_30')
  const [riskTier, setRiskTier] = useState('LOW')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    const customerId = id()
    
    await db.transact([
      tx.customers[customerId].update({
        companyName: formData.get('companyName') as string,
        billingContact: formData.get('billingContact') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string || undefined,
        paymentTerms,
        creditLimit: parseFloat(formData.get('creditLimit') as string) || 0,
        riskTier,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    ])
    
    router.push('/customers')
  }
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/customers">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">New Customer</h1>
        <p className="text-slate-600 mt-1">Create a new customer account</p>
      </div>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Enter the details for the new customer account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" placeholder="Acme Corporation" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="billingContact">Billing Contact</Label>
              <Input id="billingContact" name="billingContact" placeholder="John Smith" required />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="billing@acme.com" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="555-0123" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NET_30">Net 30</SelectItem>
                    <SelectItem value="NET_45">Net 45</SelectItem>
                    <SelectItem value="NET_60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit</Label>
                <Input id="creditLimit" name="creditLimit" type="number" placeholder="50000" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="riskTier">Risk Tier</Label>
              <Select value={riskTier} onValueChange={setRiskTier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select risk tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Customer'}
              </Button>
              <Link href="/customers">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

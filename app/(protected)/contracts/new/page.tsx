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
import { addMonths } from "date-fns"

export default function NewContractPage() {
  const router = useRouter()
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedTierId, setSelectedTierId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { isLoading, error, data } = db.useQuery({
    customers: {},
    subscriptionTiers: {},
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading data: {error.message}</div>
      </div>
    )
  }
  
  const customers = data?.customers || []
  const tiers = data?.subscriptionTiers || []
  
  const selectedTier = tiers.find((t: any) => t.id === selectedTierId)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!selectedCustomerId) {
      alert('Please select a customer')
      return
    }
    
    if (!selectedTierId) {
      alert('Please select a subscription tier')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      
      const startDateStr = formData.get('startDate') as string
      const startDate = new Date(startDateStr + 'T00:00:00')
      const endDate = addMonths(startDate, 12)
      
      const basePrice = selectedTier?.basePrice || 0
      
      // Total contract value = monthly base price × 12 months
      const totalContractValue = basePrice * 12
      
      const contractNumber = `CNT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      
      const contractId = id()
      
      const contractTx = tx.contracts[contractId].update({
        contractNumber,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
        status: 'ACTIVE',
        totalContractValue,
        quantity: 1,
        customPricing: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
        .link({ customer: selectedCustomerId })
        .link({ subscriptionTier: selectedTierId })
      
      await db.transact([contractTx])
      
      router.push(`/contracts/${contractId}`)
    } catch (err) {
      console.error('Error creating contract:', err)
      alert('Failed to create contract. Please try again.')
      setIsSubmitting(false)
    }
  }
  
  if (customers.length === 0) {
    return (
      <div className="p-8">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">No Customers Found</CardTitle>
            <CardDescription className="text-yellow-700">
              You need to create customers before creating contracts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/customers/new">
              <Button>Create Your First Customer</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/contracts">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contracts
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">New Contract</h1>
        <p className="text-slate-600 mt-1">Create a new subscription contract</p>
      </div>
      
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>Enter the details for the new subscription contract</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer: any) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.companyName} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only existing customers can have contracts
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tier">Subscription Tier *</Label>
              <Select value={selectedTierId} onValueChange={setSelectedTierId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a tier" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier: any) => (
                    <SelectItem key={tier.id} value={tier.id}>
                      {tier.tierName} - ${tier.basePrice.toLocaleString()}/{tier.billingFrequency.toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedTier && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-2">Selected Tier Details</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Base Price:</span>
                    <span className="ml-2 font-medium">${selectedTier.basePrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Billing:</span>
                    <span className="ml-2 font-medium">{selectedTier.billingFrequency}</span>
                  </div>
                  {selectedTier.features && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Features:</span>
                      <div className="ml-2 text-xs mt-1">
                        {Object.entries(selectedTier.features).map(([key, value]) => (
                          <div key={key}>• {key}: {String(value)}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input 
                id="startDate" 
                name="startDate" 
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                required 
              />
              <p className="text-xs text-muted-foreground">
                Contract duration is fixed at 12 months
              </p>
            </div>
            
            {selectedTier && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-slate-700 mb-1">Total Contract Value:</div>
                <div className="text-2xl font-bold text-blue-700">
                  ${(selectedTier.basePrice * 12).toLocaleString()}
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Based on tier base price × 12 months
                </p>
              </div>
            )}
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting || !selectedCustomerId || !selectedTierId}>
                {isSubmitting ? 'Creating...' : 'Create Contract'}
              </Button>
              <Link href="/contracts">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

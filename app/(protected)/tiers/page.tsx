'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { id, tx } from "@instantdb/react"
import { formatCurrency } from "@/lib/utils"
import { Plus, Edit2, Trash2, Save, X } from "lucide-react"
import { useState } from "react"

export default function TiersPage() {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    tierName: '',
    basePrice: '',
    tokenLimit: '',
    billingFrequency: 'MONTHLY',
  })
  
  const { isLoading, error, data } = db.useQuery({
    subscriptionTiers: {
      contracts: {},
    },
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading tiers...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading tiers: {error.message}</div>
      </div>
    )
  }
  
  const tiers = data?.subscriptionTiers || []
  
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.tierName || !formData.basePrice || !formData.tokenLimit) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const tierId = id()
      
      console.log('Creating tier with data:', {
        tierName: formData.tierName,
        basePrice: parseFloat(formData.basePrice),
        tokenLimit: parseFloat(formData.tokenLimit),
        billingFrequency: formData.billingFrequency,
      })
      
      const result = await db.transact([
        db.tx.subscriptionTiers[tierId].update({
          tierName: formData.tierName,
          basePrice: parseFloat(formData.basePrice),
          tokenLimit: parseFloat(formData.tokenLimit),
          billingFrequency: formData.billingFrequency,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      ])
      
      console.log('Tier created successfully:', result)
      
      setFormData({ tierName: '', basePrice: '', tokenLimit: '', billingFrequency: 'MONTHLY' })
      setIsCreating(false)
      setIsSubmitting(false)
    } catch (error: any) {
      console.error('Error creating tier:', error)
      alert(`Failed to create tier: ${error.message}\n\nMake sure you've pushed the schema first: npm run schema:push`)
      setIsSubmitting(false)
    }
  }
  
  const handleUpdate = async (tier: any) => {
    try {
      await db.transact([
        db.tx.subscriptionTiers[tier.id].update({
          tierName: tier.tierName,
          basePrice: tier.basePrice,
          tokenLimit: tier.tokenLimit,
          billingFrequency: tier.billingFrequency,
          updatedAt: Date.now(),
        })
      ])
      
      setEditingId(null)
    } catch (error) {
      console.error('Error updating tier:', error)
      alert('Failed to update tier. Check console for details.')
    }
  }
  
  const handleDelete = async (tierId: string, tierName: string, contractCount: number) => {
    if (contractCount > 0) {
      alert(`Cannot delete ${tierName} - it has ${contractCount} active contract(s)`)
      return
    }
    
    if (confirm(`Are you sure you want to delete ${tierName}?`)) {
      try {
        await db.transact([
          db.tx.subscriptionTiers[tierId].delete()
        ])
      } catch (error) {
        console.error('Error deleting tier:', error)
        alert('Failed to delete tier. Check console for details.')
      }
    }
  }
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Subscription Tiers</h1>
          <p className="text-slate-600 mt-1">Manage pricing tiers and token limits</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Tier
        </Button>
      </div>
      
      {isCreating && (
        <Card className="mb-6 border-blue-200">
          <CardHeader>
            <CardTitle>Create New Tier</CardTitle>
            <CardDescription>Define a new subscription tier with pricing and token limits</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tierName">Tier Name *</Label>
                  <Input
                    id="tierName"
                    value={formData.tierName}
                    onChange={(e) => setFormData({ ...formData, tierName: e.target.value })}
                    placeholder="e.g., Basic, Pro, Enterprise"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="billingFrequency">Billing Frequency *</Label>
                  <select
                    id="billingFrequency"
                    value={formData.billingFrequency}
                    onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Monthly Price ($) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="200000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Price per month (even for annual plans)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tokenLimit">Token Limit *</Label>
                  <Input
                    id="tokenLimit"
                    type="number"
                    value={formData.tokenLimit}
                    onChange={(e) => setFormData({ ...formData, tokenLimit: e.target.value })}
                    placeholder="1000000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Tokens per month (resets on 1st)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Tier'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setIsCreating(false)
                  setFormData({ tierName: '', basePrice: '', tokenLimit: '', billingFrequency: 'MONTHLY' })
                }} disabled={isSubmitting}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Pricing Tiers</CardTitle>
          <CardDescription>
            Manage your subscription tiers, pricing, and token limits. Token limits reset on the 1st of every month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier Name</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Token Limit</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Active Contracts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((tier: any) => {
                const isEditing = editingId === tier.id
                const contractCount = tier.contracts?.length || 0
                
                return (
                  <TableRow key={tier.id}>
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={tier.tierName}
                          onChange={(e) => {
                            tier.tierName = e.target.value
                          }}
                          className="w-40"
                        />
                      ) : (
                        tier.tierName
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={tier.basePrice}
                          onChange={(e) => {
                            tier.basePrice = parseFloat(e.target.value)
                          }}
                          className="w-32"
                        />
                      ) : (
                        formatCurrency(tier.basePrice)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={tier.tokenLimit}
                          onChange={(e) => {
                            tier.tokenLimit = parseFloat(e.target.value)
                          }}
                          className="w-32"
                        />
                      ) : (
                        <span>
                          {(tier.tokenLimit / 1000000).toFixed(0)}M tokens
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <select
                          value={tier.billingFrequency}
                          onChange={(e) => {
                            tier.billingFrequency = e.target.value
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                        >
                          <option value="MONTHLY">Monthly</option>
                          <option value="ANNUAL">Annual</option>
                        </select>
                      ) : (
                        <Badge variant="outline">{tier.billingFrequency}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={contractCount > 0 ? 'default' : 'secondary'}>
                        {contractCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleUpdate(tier)}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(tier.id)}
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(tier.id, tier.tierName, contractCount)}
                              disabled={contractCount > 0}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {tiers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No subscription tiers defined yet.</p>
              <p className="text-sm mt-2">Click "New Tier" to create your first pricing tier.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Token Limits</CardTitle>
          <CardDescription>How token limits work</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div>
              <div className="font-medium">Monthly Reset</div>
              <div className="text-muted-foreground">Token limits reset on the 1st of every month at 00:00 UTC</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div>
              <div className="font-medium">Usage Tracking</div>
              <div className="text-muted-foreground">Customers can monitor their token usage in real-time</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div>
              <div className="font-medium">Overage Handling</div>
              <div className="text-muted-foreground">When limits are exceeded, additional usage can be billed separately</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function CustomersPage() {
  const { isLoading, error, data } = db.useQuery({
    customers: {
      contracts: {
        $: {
          where: { status: 'ACTIVE' },
        },
      },
      invoices: {
        payments: {},
      },
    },
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading customers: {error.message}</div>
      </div>
    )
  }
  
  const customers = data?.customers || []
  const sortedCustomers = [...customers].sort((a, b) => a.companyName.localeCompare(b.companyName))
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-600 mt-1">Manage customer accounts and relationships</p>
        </div>
        <Link href="/customers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Customer
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>All customer accounts with contract and billing status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Active Contracts</TableHead>
                <TableHead>Outstanding AR</TableHead>
                <TableHead>Risk Tier</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCustomers.map((customer: any) => {
                const outstandingAR = (customer.invoices || [])
                  .filter((inv: any) => inv.status !== 'PAID' && inv.status !== 'VOID')
                  .reduce((sum: number, invoice: any) => {
                    const paid = (invoice.payments || []).reduce((pSum: number, p: any) => pSum + p.amount, 0)
                    return sum + (invoice.totalAmount - paid)
                  }, 0)
                
                return (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.companyName}</TableCell>
                    <TableCell>
                      <div className="text-sm">{customer.billingContact}</div>
                      <div className="text-xs text-muted-foreground">{customer.email}</div>
                    </TableCell>
                    <TableCell>{customer.paymentTerms.replace('_', ' ')}</TableCell>
                    <TableCell>{customer.contracts?.length || 0}</TableCell>
                    <TableCell className={outstandingAR > 0 ? 'text-orange-600 font-medium' : ''}>
                      {formatCurrency(outstandingAR)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        customer.riskTier === 'LOW' ? 'default' :
                        customer.riskTier === 'MEDIUM' ? 'secondary' :
                        'destructive'
                      }>
                        {customer.riskTier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/customers/${customer.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
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

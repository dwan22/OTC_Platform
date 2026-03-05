'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { Plus, MoreVertical, Ban, Trash2 } from "lucide-react"

export default function ContractsPage() {
  const handleVoidContract = async (contract: any) => {
    if (!confirm(`Void contract ${contract.contractNumber}?\n\nThis will exclude the contract from all financial reporting and revenue recognition.`)) {
      return
    }
    
    try {
      await db.transact([
        db.tx.contracts[contract.id].update({
          status: 'VOID',
          updatedAt: Date.now(),
        })
      ])
      
      console.log('Contract voided successfully')
    } catch (error: any) {
      console.error('Error voiding contract:', error)
      alert(`Failed to void contract: ${error.message}`)
    }
  }
  
  const handleDeleteContract = async (contract: any) => {
    if (!confirm(`Delete contract ${contract.contractNumber}?\n\nThis action cannot be undone. The contract will be permanently deleted.`)) {
      return
    }
    
    try {
      await db.transact([
        db.tx.contracts[contract.id].delete()
      ])
      
      console.log('Contract deleted successfully')
    } catch (error: any) {
      console.error('Error deleting contract:', error)
      alert(`Failed to delete contract: ${error.message}`)
    }
  }

  const { isLoading, error, data } = db.useQuery({
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
          <p className="mt-4 text-sm text-muted-foreground">Loading contracts...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600">Error loading contracts: {error.message}</div>
      </div>
    )
  }
  
  const contracts = data?.contracts || []
  const sortedContracts = [...contracts].sort((a: any, b: any) => {
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  })
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contracts</h1>
          <p className="text-slate-600 mt-1">Subscription contracts and agreements</p>
        </div>
        <Link href="/contracts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Contract
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Contracts</CardTitle>
          <CardDescription>View and manage customer subscription contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contract #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedContracts.map((contract: any) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                  <TableCell>{contract.customer?.companyName || 'Unknown'}</TableCell>
                  <TableCell>
                    <div>{contract.subscriptionTier?.tierName || 'N/A'}</div>
                    {contract.customPricing && (
                      <div className="text-xs text-muted-foreground">Custom pricing</div>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(contract.startDate)}</TableCell>
                  <TableCell>{formatDate(contract.endDate)}</TableCell>
                  <TableCell>{contract.quantity}</TableCell>
                  <TableCell>{formatCurrency(contract.totalContractValue)}</TableCell>
                  <TableCell>
                    <Badge variant={
                      contract.status === 'ACTIVE' ? 'default' : 
                      contract.status === 'VOID' ? 'outline' :
                      'secondary'
                    }
                    className={contract.status === 'VOID' ? 'text-red-600 border-red-300' : ''}
                    >
                      {contract.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Link href={`/contracts/${contract.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {contract.status !== 'VOID' && (
                            <>
                              <DropdownMenuItem onClick={() => handleVoidContract(contract)}>
                                <Ban className="h-4 w-4 mr-2" />
                                Void
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteContract(contract)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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

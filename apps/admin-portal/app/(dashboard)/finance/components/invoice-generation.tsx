'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  FileText,
  Download,
  Calendar as CalendarIcon,
  Search,
  Printer,
  Mail
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'
import { downloadInvoicePDF, printInvoicePDF } from './invoice-pdf'

export function InvoiceGeneration() {
  const [selectedRetailer, setSelectedRetailer] = useState<string>('')
  const [retailerSearch, setRetailerSearch] = useState('')
  const [dateFrom, setDateFrom] = useState<Date>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [dateTo, setDateTo] = useState<Date>(new Date())
  const [includePending, setIncludePending] = useState(false)
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null)

  // Search retailers
  const { data: retailers } = api.retailers.getAll.useQuery({
    search: retailerSearch,
    status: 'active',
    limit: 20,
    offset: 0
  }, {
    enabled: retailerSearch.length >= 2
  })

  // Generate invoice mutation
  const generateInvoice = api.payments.generateInvoice.useMutation({
    onSuccess: (data) => {
      setGeneratedInvoice(data)
      toast.success('Invoice generated successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate invoice')
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handleGenerateInvoice = () => {
    if (!selectedRetailer) {
      toast.error('Please select a retailer')
      return
    }

    generateInvoice.mutate({
      retailer_id: selectedRetailer,
      date_from: dateFrom.toISOString(),
      date_to: dateTo.toISOString(),
      include_pending: includePending
    })
  }

  const handlePrintInvoice = async () => {
    if (!generatedInvoice) return
    
    try {
      await printInvoicePDF(generatedInvoice)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to print invoice')
    }
  }

  const handleDownloadInvoice = async () => {
    if (!generatedInvoice) return
    
    try {
      await downloadInvoicePDF(generatedInvoice, `invoice-${generatedInvoice.invoice_number}.pdf`)
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to download invoice')
    }
  }


  return (
    <div className="space-y-6">
      {/* Invoice Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Generate Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Retailer Selection */}
            <div className="space-y-2">
              <Label>Retailer *</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search retailer by business name..."
                  value={retailerSearch}
                  onChange={(e) => setRetailerSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {/* Retailer search results */}
              {retailerSearch.length >= 2 && retailers && retailers.items.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {retailers.items.map((retailer) => (
                    <div
                      key={retailer.id}
                      className={`p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${ 
                        selectedRetailer === retailer.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => {
                        setSelectedRetailer(retailer.id)
                        setRetailerSearch(retailer.business_name)
                      }}
                    >
                      <p className="font-medium">{retailer.business_name}</p>
                      <p className="text-sm text-muted-foreground">{retailer.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      {dateFrom ? (
                        format(dateFrom, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={(date) => date && setDateFrom(date)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      {dateTo ? (
                        format(dateTo, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={(date) => date && setDateTo(date)}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includePending" 
                checked={includePending}
                onCheckedChange={(checked) => setIncludePending(checked as boolean)}
              />
              <Label htmlFor="includePending">Include pending orders</Label>
            </div>

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateInvoice}
              disabled={generateInvoice.isPending || !selectedRetailer}
              className="w-full"
            >
              {generateInvoice.isPending ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Invoice Display */}
      {generatedInvoice && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice {generatedInvoice.invoice_number}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrintInvoice}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print PDF
                </Button>
                <Button variant="outline" onClick={handleDownloadInvoice}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Invoice Header */}
            <div className="grid gap-4 md:grid-cols-2 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="font-medium">{generatedInvoice.retailer.business_name}</p>
                <p className="text-sm text-muted-foreground">{generatedInvoice.retailer.email}</p>
                <p className="text-sm text-muted-foreground">{generatedInvoice.retailer.phone}</p>
              </div>
              <div className="text-right">
                <p><strong>Invoice #:</strong> {generatedInvoice.invoice_number}</p>
                <p><strong>Date:</strong> {format(new Date(generatedInvoice.generated_at), 'dd/MM/yyyy')}</p>
                <p><strong>Period:</strong> {format(new Date(generatedInvoice.date_from), 'dd/MM/yyyy')} - {format(new Date(generatedInvoice.date_to), 'dd/MM/yyyy')}</p>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-md border mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedInvoice.orders.map((order: any) => {
                    const orderPaid = order.payments?.reduce((sum: number, p: any) => 
                      p.status === 'completed' ? sum + p.amount : sum, 0) || 0
                    const balance = order.total_amount - orderPaid

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Badge variant="outline">{order.order_number}</Badge>
                        </TableCell>
                        <TableCell>{format(new Date(order.created_at), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(order.subtotal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.tax_amount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell className="text-right text-green-600">{formatCurrency(orderPaid)}</TableCell>
                        <TableCell className={`text-right font-medium ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(balance)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Invoice Totals */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2 text-right max-w-sm ml-auto">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(generatedInvoice.totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(generatedInvoice.totals.tax_amount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(generatedInvoice.totals.total_amount)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Total Paid:</span>
                  <span>{formatCurrency(generatedInvoice.totals.total_paid)}</span>
                </div>
                <div className={`flex justify-between font-bold text-lg ${
                  generatedInvoice.totals.balance_due > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  <span>Balance Due:</span>
                  <span>{formatCurrency(generatedInvoice.totals.balance_due)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
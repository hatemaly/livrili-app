'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  CreditCard,
  Search,
  Check,
  AlertCircle
} from 'lucide-react'
import { api } from '@/lib/trpc'
import { toast } from 'sonner'

interface PaymentRecordingFormProps {
  onSuccess?: () => void
}

export function PaymentRecordingForm({ onSuccess }: PaymentRecordingFormProps) {
  const [formData, setFormData] = useState({
    retailer_id: '',
    order_id: '',
    amount: '',
    payment_type: 'order_payment' as 'order_payment' | 'credit_payment',
    payment_method: 'cash' as 'cash' | 'credit',
    reference_number: '',
    notes: ''
  })
  
  const [retailerSearch, setRetailerSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedRetailer, setSelectedRetailer] = useState<any>(null)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  // Search retailers
  const { data: retailers, isLoading: retailersLoading } = api.retailers.getAll.useQuery({
    search: retailerSearch,
    status: 'active',
    limit: 20,
    offset: 0
  }, {
    enabled: retailerSearch.length >= 2
  })

  // Search orders for selected retailer
  const { data: orders, isLoading: ordersLoading } = api.orders.getAll.useQuery({
    retailer_id: formData.retailer_id || undefined,
    search: orderSearch,
    status: undefined,
    limit: 20,
    offset: 0
  }, {
    enabled: !!formData.retailer_id && orderSearch.length >= 2
  })

  // Get retailer financials when retailer is selected
  const { data: retailerFinancials } = api.payments.getRetailerFinancials.useQuery(
    { retailer_id: formData.retailer_id },
    { enabled: !!formData.retailer_id }
  )

  // Record payment mutation
  const recordPayment = api.payments.recordPayment.useMutation({
    onSuccess: () => {
      toast.success('Payment recorded successfully')
      // Reset form
      setFormData({
        retailer_id: '',
        order_id: '',
        amount: '',
        payment_type: 'order_payment',
        payment_method: 'cash',
        reference_number: '',
        notes: ''
      })
      setSelectedRetailer(null)
      setSelectedOrder(null)
      setRetailerSearch('')
      setOrderSearch('')
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to record payment')
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const handleRetailerSelect = (retailer: any) => {
    setSelectedRetailer(retailer)
    setFormData(prev => ({ 
      ...prev, 
      retailer_id: retailer.id,
      order_id: '' // Reset order when retailer changes
    }))
    setSelectedOrder(null)
    setRetailerSearch(retailer.business_name)
  }

  const handleOrderSelect = (order: any) => {
    setSelectedOrder(order)
    setFormData(prev => ({ 
      ...prev, 
      order_id: order.id,
      amount: order.total_amount.toString() // Pre-fill with order total
    }))
    setOrderSearch(order.order_number)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.retailer_id) {
      toast.error('Please select a retailer')
      return
    }
    
    if (!formData.amount) {
      toast.error('Please enter payment amount')
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    // For order payments, order_id is required
    if (formData.payment_type === 'order_payment' && !formData.order_id) {
      toast.error('Please select an order for order payments')
      return
    }

    recordPayment.mutate({
      retailer_id: formData.retailer_id,
      order_id: formData.payment_type === 'order_payment' ? formData.order_id : undefined,
      amount,
      payment_type: formData.payment_type,
      payment_method: formData.payment_method,
      reference_number: formData.reference_number || undefined,
      notes: formData.notes || undefined
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Record Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Type Selection */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select 
                  value={formData.payment_type} 
                  onValueChange={(value: 'order_payment' | 'credit_payment') => 
                    setFormData(prev => ({ ...prev, payment_type: value, order_id: '' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_payment">Order Payment</SelectItem>
                    <SelectItem value="credit_payment">Credit Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select 
                  value={formData.payment_method} 
                  onValueChange={(value: 'cash' | 'credit') => 
                    setFormData(prev => ({ ...prev, payment_method: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value="credit">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Credit
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
              {retailerSearch.length >= 2 && retailers && retailers.items.length > 0 && !selectedRetailer && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {retailers.items.map((retailer) => (
                    <div
                      key={retailer.id}
                      className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleRetailerSelect(retailer)}
                    >
                      <p className="font-medium">{retailer.business_name}</p>
                      <p className="text-sm text-muted-foreground">{retailer.email}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected retailer info */}
              {selectedRetailer && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedRetailer.business_name}</p>
                      <p className="text-sm text-muted-foreground">{selectedRetailer.email}</p>
                    </div>
                    <Badge variant="outline">
                      <Check className="w-3 h-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                  
                  {/* Show financial info */}
                  {retailerFinancials && (
                    <div className="mt-2 pt-2 border-t border-blue-200 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current Balance: </span>
                        <span className={retailerFinancials.retailer.current_balance < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {formatCurrency(retailerFinancials.retailer.current_balance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Available Credit: </span>
                        <span className="font-medium">
                          {formatCurrency(retailerFinancials.financial_summary.available_credit)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Order Selection (only for order payments) */}
            {formData.payment_type === 'order_payment' && formData.retailer_id && (
              <div className="space-y-2">
                <Label>Order *</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search order by order number..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                {/* Order search results */}
                {orderSearch.length >= 2 && orders && orders.items.length > 0 && !selectedOrder && (
                  <div className="border rounded-md max-h-40 overflow-y-auto">
                    {orders.items.map((order) => (
                      <div
                        key={order.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleOrderSelect(order)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              Status: {order.status} | Total: {formatCurrency(order.total_amount)}
                            </p>
                          </div>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected order info */}
                {selectedOrder && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedOrder.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: {formatCurrency(selectedOrder.total_amount)} | Status: {selectedOrder.status}
                        </p>
                      </div>
                      <Badge variant="outline">
                        <Check className="w-3 h-3 mr-1" />
                        Selected
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Payment Amount */}
            <div className="space-y-2">
              <Label>Payment Amount *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
              {selectedOrder && parseFloat(formData.amount) > selectedOrder.total_amount && (
                <div className="flex items-center gap-2 text-orange-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Payment amount exceeds order total
                </div>
              )}
            </div>

            {/* Reference Number */}
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                placeholder="Optional reference number or transaction ID"
                value={formData.reference_number}
                onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Optional notes about this payment"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button 
                type="submit" 
                disabled={recordPayment.isPending}
                className="flex-1"
              >
                {recordPayment.isPending ? 'Recording Payment...' : 'Record Payment'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setFormData({
                    retailer_id: '',
                    order_id: '',
                    amount: '',
                    payment_type: 'order_payment',
                    payment_method: 'cash',
                    reference_number: '',
                    notes: ''
                  })
                  setSelectedRetailer(null)
                  setSelectedOrder(null)
                  setRetailerSearch('')
                  setOrderSearch('')
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
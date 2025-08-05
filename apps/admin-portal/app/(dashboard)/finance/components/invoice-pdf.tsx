'use client'

import React from 'react'
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  pdf,
  Font
} from '@react-pdf/renderer'
import { format } from 'date-fns'

// Register font for better text rendering
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ]
})

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF'
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003049',
    marginBottom: 5
  },
  invoiceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C1121F'
  },
  companyInfo: {
    marginBottom: 20,
    fontSize: 9,
    color: '#666666'
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  customerInfo: {
    marginBottom: 30,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 5
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#003049'
  },
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    paddingVertical: 8,
    paddingHorizontal: 5
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 5,
    minHeight: 25
  },
  tableHeaderCell: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333'
  },
  tableCell: {
    fontSize: 9,
    color: '#666666',
    paddingVertical: 2
  },
  tableCellRight: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'right',
    paddingVertical: 2
  },
  // Column widths
  orderNumberCol: { width: '15%' },
  dateCol: { width: '12%' },
  statusCol: { width: '10%' },
  subtotalCol: { width: '12%' },
  taxCol: { width: '10%' },
  totalCol: { width: '12%' },
  paidCol: { width: '12%' },
  balanceCol: { width: '17%' },
  
  totals: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '40%',
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 5
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  totalLabel: {
    fontSize: 10
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  grandTotal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#003049',
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
    paddingTop: 8,
    marginTop: 8
  },
  balanceDue: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  balanceDuePositive: {
    color: '#C1121F'
  },
  balanceDueNegative: {
    color: '#28A745'
  },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999999',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15
  }
})

interface InvoiceOrder {
  id: string
  order_number: string
  created_at: string
  status: string
  subtotal: number
  tax_amount: number
  total_amount: number
  payments?: Array<{
    status: string
    amount: number
  }>
}

interface InvoiceRetailer {
  business_name: string
  address?: string
  city?: string
  state?: string
  email?: string
  phone?: string
}

interface InvoiceTotals {
  subtotal: number
  tax_amount: number
  total_amount: number
  total_paid: number
  balance_due: number
}

interface InvoiceData {
  invoice_number: string
  generated_at: string
  date_from: string
  date_to: string
  retailer: InvoiceRetailer
  orders: InvoiceOrder[]
  totals: InvoiceTotals
}

interface InvoicePDFProps {
  invoice: InvoiceData
}

// Helper function to escape HTML entities and prevent XSS
const sanitizeText = (text: string | null | undefined): string => {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

// Helper function to format currency safely
const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(0)
  }
  
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2
  }).format(Number(amount))
}

// Helper function to format date safely
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'
    return format(date, 'dd/MM/yyyy')
  } catch (error) {
    return 'Invalid Date'
  }
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.companyName}>LIVRILI</Text>
        <Text style={styles.invoiceTitle}>INVOICE</Text>
      </View>
      
      {/* Company Info */}
      <View style={styles.companyInfo}>
        <Text>Livrili SARL</Text>
        <Text>B2B Marketplace Platform</Text>
        <Text>Algeria</Text>
      </View>
      
      {/* Invoice Details */}
      <View style={styles.invoiceDetails}>
        <View>
          <Text style={styles.sectionTitle}>Invoice Details</Text>
          <Text>Invoice Number: {sanitizeText(invoice?.invoice_number)}</Text>
          <Text>Invoice Date: {formatDate(invoice?.generated_at)}</Text>
          <Text>Period: {formatDate(invoice?.date_from)} - {formatDate(invoice?.date_to)}</Text>
        </View>
      </View>
      
      {/* Customer Info */}
      <View style={styles.customerInfo}>
        <Text style={styles.sectionTitle}>Bill To:</Text>
        <Text>{sanitizeText(invoice?.retailer?.business_name)}</Text>
        {invoice?.retailer?.address && <Text>{sanitizeText(invoice.retailer.address)}</Text>}
        {(invoice?.retailer?.city || invoice?.retailer?.state) && (
          <Text>
            {sanitizeText(invoice?.retailer?.city)}{invoice?.retailer?.city && invoice?.retailer?.state && ', '}{sanitizeText(invoice?.retailer?.state)}
          </Text>
        )}
        {invoice?.retailer?.email && <Text>{sanitizeText(invoice.retailer.email)}</Text>}
        {invoice?.retailer?.phone && <Text>{sanitizeText(invoice.retailer.phone)}</Text>}
      </View>
      
      {/* Orders Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={styles.orderNumberCol}>
            <Text style={styles.tableHeaderCell}>Order Number</Text>
          </View>
          <View style={styles.dateCol}>
            <Text style={styles.tableHeaderCell}>Date</Text>
          </View>
          <View style={styles.statusCol}>
            <Text style={styles.tableHeaderCell}>Status</Text>
          </View>
          <View style={styles.subtotalCol}>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Subtotal</Text>
          </View>
          <View style={styles.taxCol}>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Tax</Text>
          </View>
          <View style={styles.totalCol}>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Total</Text>
          </View>
          <View style={styles.paidCol}>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Paid</Text>
          </View>
          <View style={styles.balanceCol}>
            <Text style={[styles.tableHeaderCell, { textAlign: 'right' }]}>Balance</Text>
          </View>
        </View>
        
        {/* Table Body */}
        {invoice?.orders?.map((order: any, index: number) => {
          const orderPaid = order?.payments?.reduce((sum: number, p: any) => 
            p?.status === 'completed' ? sum + (Number(p?.amount) || 0) : sum, 0) || 0
          const balance = (Number(order?.total_amount) || 0) - orderPaid
          
          return (
            <View key={order?.id || index} style={styles.tableRow}>
              <View style={styles.orderNumberCol}>
                <Text style={styles.tableCell}>{sanitizeText(order?.order_number)}</Text>
              </View>
              <View style={styles.dateCol}>
                <Text style={styles.tableCell}>{formatDate(order?.created_at)}</Text>
              </View>
              <View style={styles.statusCol}>
                <Text style={styles.tableCell}>{sanitizeText(order?.status)}</Text>
              </View>
              <View style={styles.subtotalCol}>
                <Text style={styles.tableCellRight}>{formatCurrency(order?.subtotal)}</Text>
              </View>
              <View style={styles.taxCol}>
                <Text style={styles.tableCellRight}>{formatCurrency(order?.tax_amount)}</Text>
              </View>
              <View style={styles.totalCol}>
                <Text style={styles.tableCellRight}>{formatCurrency(order?.total_amount)}</Text>
              </View>
              <View style={styles.paidCol}>
                <Text style={styles.tableCellRight}>{formatCurrency(orderPaid)}</Text>
              </View>
              <View style={styles.balanceCol}>
                <Text style={[styles.tableCellRight, balance > 0 && { color: '#C1121F' }]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
      
      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice?.totals?.subtotal)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice?.totals?.tax_amount)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formatCurrency(invoice?.totals?.total_amount)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid:</Text>
          <Text style={[styles.totalValue, { color: '#28A745' }]}>{formatCurrency(invoice?.totals?.total_paid)}</Text>
        </View>
        <View style={[styles.totalRow, styles.balanceDue]}>
          <Text style={styles.totalLabel}>Balance Due:</Text>
          <Text style={[
            styles.totalValue, 
            (invoice?.totals?.balance_due || 0) > 0 ? styles.balanceDuePositive : styles.balanceDueNegative
          ]}>
            {formatCurrency(invoice?.totals?.balance_due)}
          </Text>
        </View>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your business!</Text>
        <Text>Generated on {format(new Date(), 'dd/MM/yyyy HH:mm')}</Text>
      </View>
    </Page>
  </Document>
)

// Function to generate PDF blob
export const generateInvoicePDF = async (invoice: InvoiceData): Promise<Blob> => {
  const doc = <InvoicePDF invoice={invoice} />
  const asPdf = pdf(doc)
  return await asPdf.toBlob()
}

// Function to download PDF
export const downloadInvoicePDF = async (invoice: InvoiceData, filename?: string) => {
  try {
    const blob = await generateInvoicePDF(invoice)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `invoice-${sanitizeText(invoice?.invoice_number)}.pdf`
    link.click()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

// Function to print PDF
export const printInvoicePDF = async (invoice: InvoiceData) => {
  try {
    const blob = await generateInvoicePDF(invoice)
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    
    if (!printWindow) {
      throw new Error('Pop-up blocked. Please allow pop-ups for this site.')
    }
    
    // Wait for the PDF to load before printing
    printWindow.onload = () => {
      printWindow.print()
    }
    
    // Clean up the URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    console.error('Error printing PDF:', error)
    throw new Error('Failed to print PDF')
  }
}
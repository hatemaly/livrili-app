// Financial utility functions for Livrili payment system

export interface CreditLimitValidation {
  isValid: boolean
  availableCredit: number
  creditUsed: number
  utilizationPercentage: number
  exceedsLimit: boolean
  message?: string
}

export interface PaymentValidation {
  isValid: boolean
  message?: string
  suggestedAmount?: number
}

export interface OverdueCalculation {
  isOverdue: boolean
  daysPastDue: number
  gracePeriodDays: number
  severity: 'normal' | 'warning' | 'critical'
}

export interface CashFlowAnalysis {
  totalInflow: number
  totalOutflow: number
  netFlow: number
  cashReceipts: number
  creditPayments: number
  averageDailyCollection: number
}

/**
 * Calculate available credit for a retailer
 */
export function calculateAvailableCredit(creditLimit: number, currentBalance: number): number {
  // Positive balance means retailer owes money (reduces available credit)
  // Negative balance means retailer has credit (increases available credit)
  return Math.max(0, creditLimit + currentBalance)
}

/**
 * Calculate credit utilization amount
 */
export function calculateCreditUsed(creditLimit: number, currentBalance: number): number {
  // Credit used is the amount borrowed (positive current balance)
  return Math.max(0, -currentBalance)
}

/**
 * Calculate credit utilization percentage
 */
export function calculateCreditUtilization(creditLimit: number, currentBalance: number): number {
  if (creditLimit <= 0) return 0
  const creditUsed = calculateCreditUsed(creditLimit, currentBalance)
  return (creditUsed / creditLimit) * 100
}

/**
 * Validate if a purchase amount can be covered by available credit
 */
export function validateCreditLimit(
  purchaseAmount: number,
  creditLimit: number,
  currentBalance: number,
  bufferPercentage: number = 5
): CreditLimitValidation {
  const availableCredit = calculateAvailableCredit(creditLimit, currentBalance)
  const creditUsed = calculateCreditUsed(creditLimit, currentBalance)
  const utilizationPercentage = calculateCreditUtilization(creditLimit, currentBalance)
  
  // Apply buffer (5% by default)
  const effectiveLimit = creditLimit * (1 - bufferPercentage / 100)
  const exceedsLimit = (creditUsed + purchaseAmount) > effectiveLimit
  
  const validation: CreditLimitValidation = {
    isValid: purchaseAmount <= availableCredit && !exceedsLimit,
    availableCredit,
    creditUsed,
    utilizationPercentage,
    exceedsLimit
  }

  if (!validation.isValid) {
    if (purchaseAmount > availableCredit) {
      validation.message = `Purchase amount (${purchaseAmount.toFixed(2)}) exceeds available credit (${availableCredit.toFixed(2)})`
    } else if (exceedsLimit) {
      validation.message = `Purchase would exceed credit limit with ${bufferPercentage}% buffer`
    }
  }

  return validation
}

/**
 * Validate payment amount against outstanding balance
 */
export function validatePaymentAmount(
  paymentAmount: number,
  outstandingBalance: number,
  allowOverpayment: boolean = true
): PaymentValidation {
  if (paymentAmount <= 0) {
    return {
      isValid: false,
      message: 'Payment amount must be greater than zero'
    }
  }

  if (paymentAmount > outstandingBalance && !allowOverpayment) {
    return {
      isValid: false,
      message: `Payment amount (${paymentAmount.toFixed(2)}) exceeds outstanding balance (${outstandingBalance.toFixed(2)})`,
      suggestedAmount: outstandingBalance
    }
  }

  return { isValid: true }
}

/**
 * Calculate overdue status and severity
 */
export function calculateOverdueStatus(
  dueDate: string | Date,
  gracePeriodDays: number = 30
): OverdueCalculation {
  const due = new Date(dueDate)
  const now = new Date()
  const daysPastDue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  
  const isOverdue = daysPastDue > gracePeriodDays
  
  let severity: 'normal' | 'warning' | 'critical' = 'normal'
  if (daysPastDue > gracePeriodDays + 30) {
    severity = 'critical'
  } else if (daysPastDue > gracePeriodDays) {
    severity = 'warning'
  }

  return {
    isOverdue,
    daysPastDue: Math.max(0, daysPastDue),
    gracePeriodDays,
    severity
  }
}

/**
 * Calculate aging buckets for receivables
 */
export function calculateAgingBuckets(orders: Array<{
  delivery_date: string
  total_amount: number
  payments_received: number
}>) {
  const buckets = {
    current: { count: 0, amount: 0 }, // 0-30 days
    thirtyDays: { count: 0, amount: 0 }, // 31-60 days
    sixtyDays: { count: 0, amount: 0 }, // 61-90 days
    ninetyDays: { count: 0, amount: 0 }, // 91+ days
  }

  const now = new Date()

  orders.forEach(order => {
    const outstanding = order.total_amount - order.payments_received
    if (outstanding <= 0) return // Fully paid

    const deliveryDate = new Date(order.delivery_date)
    const daysPastDelivery = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysPastDelivery <= 30) {
      buckets.current.count++
      buckets.current.amount += outstanding
    } else if (daysPastDelivery <= 60) {
      buckets.thirtyDays.count++
      buckets.thirtyDays.amount += outstanding
    } else if (daysPastDelivery <= 90) {
      buckets.sixtyDays.count++
      buckets.sixtyDays.amount += outstanding
    } else {
      buckets.ninetyDays.count++
      buckets.ninetyDays.amount += outstanding
    }
  })

  return buckets
}

/**
 * Analyze cash flow for a given period
 */
export function analyzeCashFlow(
  payments: Array<{
    amount: number
    payment_method: 'cash' | 'credit'
    created_at: string
    status: string
  }>,
  periodDays: number
): CashFlowAnalysis {
  const completedPayments = payments.filter(p => p.status === 'completed')
  
  const totalInflow = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const cashReceipts = completedPayments
    .filter(p => p.payment_method === 'cash')
    .reduce((sum, p) => sum + p.amount, 0)
  const creditPayments = completedPayments
    .filter(p => p.payment_method === 'credit')
    .reduce((sum, p) => sum + p.amount, 0)

  return {
    totalInflow,
    totalOutflow: 0, // Would need expense data
    netFlow: totalInflow,
    cashReceipts,
    creditPayments,
    averageDailyCollection: periodDays > 0 ? totalInflow / periodDays : 0
  }
}

/**
 * Calculate payment plan for overdue amount
 */
export function calculatePaymentPlan(
  totalOwed: number,
  monthlyInstallments: number,
  interestRate: number = 0
): Array<{
  installment: number
  amount: number
  principal: number
  interest: number
  remainingBalance: number
}> {
  if (monthlyInstallments <= 0 || totalOwed <= 0) return []

  const plan = []
  let remainingBalance = totalOwed
  const monthlyInterestRate = interestRate / 12 / 100

  for (let i = 1; i <= monthlyInstallments; i++) {
    const interest = remainingBalance * monthlyInterestRate
    const basePayment = totalOwed / monthlyInstallments
    const principal = Math.min(basePayment, remainingBalance)
    const totalPayment = principal + interest

    remainingBalance -= principal

    plan.push({
      installment: i,
      amount: totalPayment,
      principal,
      interest,
      remainingBalance: Math.max(0, remainingBalance)
    })

    if (remainingBalance <= 0) break
  }

  return plan
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string = 'DZD'): string {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Calculate late payment fees
 */
export function calculateLateFees(
  outstandingAmount: number,
  daysPastDue: number,
  dailyLateFeeRate: number = 0.001, // 0.1% per day
  maxLateFeePercentage: number = 10 // 10% max
): number {
  if (daysPastDue <= 0) return 0

  const lateFee = outstandingAmount * dailyLateFeeRate * daysPastDue
  const maxLateFee = outstandingAmount * (maxLateFeePercentage / 100)
  
  return Math.min(lateFee, maxLateFee)
}

/**
 * Risk assessment for credit extension
 */
export function assessCreditRisk(retailer: {
  current_balance: number
  credit_limit: number
  payment_history_months: number
  late_payment_count: number
  total_payments: number
  business_age_months: number
}): {
  riskScore: number // 0-100, higher is riskier
  riskLevel: 'low' | 'medium' | 'high'
  factors: string[]
  recommendation: string
} {
  let riskScore = 0
  const factors = []

  // Credit utilization (30% weight)
  const utilization = calculateCreditUtilization(retailer.credit_limit, retailer.current_balance)
  if (utilization > 90) {
    riskScore += 30
    factors.push('High credit utilization (>90%)')
  } else if (utilization > 70) {
    riskScore += 20
    factors.push('Moderate credit utilization (70-90%)')
  } else if (utilization > 50) {
    riskScore += 10
    factors.push('Elevated credit utilization (50-70%)')
  }

  // Payment history (25% weight)
  if (retailer.total_payments > 0) {
    const latePaymentRate = retailer.late_payment_count / retailer.total_payments
    if (latePaymentRate > 0.2) {
      riskScore += 25
      factors.push('Poor payment history (>20% late payments)')
    } else if (latePaymentRate > 0.1) {
      riskScore += 15
      factors.push('Concerning payment history (10-20% late payments)')
    } else if (latePaymentRate > 0.05) {
      riskScore += 5
      factors.push('Some payment delays (5-10% late payments)')
    }
  }

  // Business age (15% weight)
  if (retailer.business_age_months < 6) {
    riskScore += 15
    factors.push('New business (<6 months)')
  } else if (retailer.business_age_months < 12) {
    riskScore += 10
    factors.push('Young business (6-12 months)')
  } else if (retailer.business_age_months < 24) {
    riskScore += 5
    factors.push('Relatively new business (1-2 years)')
  }

  // Current balance status (20% weight)
  if (retailer.current_balance < -retailer.credit_limit) {
    riskScore += 20
    factors.push('Over credit limit')
  } else if (retailer.current_balance < 0) {
    riskScore += 10
    factors.push('Outstanding balance')
  }

  // Payment history length (10% weight)
  if (retailer.payment_history_months < 3) {
    riskScore += 10
    factors.push('Limited payment history (<3 months)')
  } else if (retailer.payment_history_months < 6) {
    riskScore += 5
    factors.push('Short payment history (3-6 months)')
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high'
  let recommendation: string

  if (riskScore >= 60) {
    riskLevel = 'high'
    recommendation = 'Recommend credit reduction or cash-only terms'
  } else if (riskScore >= 30) {
    riskLevel = 'medium'
    recommendation = 'Monitor closely, consider credit limit review'
  } else {
    riskLevel = 'low'
    recommendation = 'Good candidate for credit extension'
  }

  return {
    riskScore: Math.min(100, riskScore),
    riskLevel,
    factors,
    recommendation
  }
}
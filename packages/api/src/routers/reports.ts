import { z } from 'zod';
import { router, adminProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import { getServiceSupabase } from '@livrili/database';

// Helper function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

// Input schemas
const dateRangeSchema = z.object({
  from: z.string(),
  to: z.string()
});

const exportFormatSchema = z.enum(['excel', 'pdf', 'csv']);

export const reportsRouter = router({
  // Get sales report
  getSalesReport: adminProcedure
    .input(z.object({
      dateRange: dateRangeSchema,
      groupBy: z.enum(['day', 'week', 'month', 'category', 'region']).default('day'),
      categoryId: z.string().optional(),
      region: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { dateRange, groupBy, categoryId, region } = input;

      const supabase = getServiceSupabase();
      
      // Base query for orders
      let ordersQuery = supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          retailer_id,
          retailers!inner(
            business_name,
            city,
            state
          ),
          order_items!inner(
            quantity,
            unit_price,
            total_price,
            product_id,
            products!inner(
              name_en,
              name_ar,
              name_fr,
              category_id,
              categories!inner(
                name_en,
                name_ar,
                name_fr
              )
            )
          )
        `)
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to)
        .in('status', ['delivered', 'confirmed']);

      if (region) {
        ordersQuery = ordersQuery.eq('retailers.state', region);
      }

      const { data: orders, error } = await ordersQuery;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Process data based on groupBy
      const salesData = new Map<string, any>();
      
      orders?.forEach(order => {
        let key: string;
        
        switch (groupBy) {
          case 'day':
            key = new Date(order.created_at).toISOString().split('T')[0];
            break;
          case 'week':
            const date = new Date(order.created_at);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'month':
            key = new Date(order.created_at).toISOString().substring(0, 7);
            break;
          case 'category':
            key = order.order_items[0]?.products?.categories?.name_en || 'Uncategorized';
            break;
          case 'region':
            key = order.retailers?.state || 'Unknown';
            break;
          default:
            key = 'all';
        }

        const existing = salesData.get(key) || {
          period: key,
          orders_count: 0,
          total_revenue: 0,
          total_items: 0,
          average_order_value: 0,
          top_products: new Map()
        };

        existing.orders_count++;
        existing.total_revenue += order.total_amount;
        
        order.order_items.forEach(item => {
          existing.total_items += item.quantity;
          
          // Track top products
          const productKey = item.products?.name_en || 'Unknown';
          const productData = existing.top_products.get(productKey) || { quantity: 0, revenue: 0 };
          productData.quantity += item.quantity;
          productData.revenue += item.total_price;
          existing.top_products.set(productKey, productData);
        });

        salesData.set(key, existing);
      });

      // Convert to array and calculate averages
      const report = Array.from(salesData.values()).map(data => {
        data.average_order_value = data.total_revenue / data.orders_count;
        data.top_products = Array.from(data.top_products.entries())
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        return data;
      });

      // Sort by period
      report.sort((a, b) => a.period.localeCompare(b.period));

      // Calculate summary
      const summary = {
        total_orders: report.reduce((sum, r) => sum + r.orders_count, 0),
        total_revenue: report.reduce((sum, r) => sum + r.total_revenue, 0),
        total_items: report.reduce((sum, r) => sum + r.total_items, 0),
        average_order_value: 0,
        period_count: report.length
      };
      summary.average_order_value = summary.total_orders > 0 
        ? summary.total_revenue / summary.total_orders 
        : 0;

      return { report, summary };
    }),

  // Get cash collection report
  getCashCollectionReport: adminProcedure
    .input(z.object({
      dateRange: dateRangeSchema,
      driverId: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { dateRange, driverId } = input;

      const supabase = getServiceSupabase();
      
      // Get cash payments
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_method,
          payment_date,
          created_at,
          orders!inner(
            id,
            order_number,
            retailer_id,
            retailers!inner(
              business_name
            ),
            deliveries!inner(
              driver_id,
              delivered_at,
              drivers!inner(
                name
              )
            )
          )
        `)
        .eq('payment_method', 'cash')
        .gte('payment_date', dateRange.from)
        .lte('payment_date', dateRange.to);

      if (driverId) {
        paymentsQuery = paymentsQuery.eq('orders.deliveries.driver_id', driverId);
      }

      const { data: payments, error } = await paymentsQuery;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Group by driver and date
      const collectionData = new Map<string, any>();
      
      payments?.forEach(payment => {
        const driver = payment.orders?.deliveries?.[0]?.drivers?.name || 'Unknown';
        const date = new Date(payment.payment_date).toISOString().split('T')[0];
        const key = `${driver}_${date}`;

        const existing = collectionData.get(key) || {
          driver_name: driver,
          date: date,
          collections: [],
          total_collected: 0,
          order_count: 0
        };

        existing.collections.push({
          order_number: payment.orders?.order_number,
          retailer: payment.orders?.retailers?.business_name,
          amount: payment.amount,
          time: new Date(payment.created_at).toLocaleTimeString()
        });
        existing.total_collected += payment.amount;
        existing.order_count++;

        collectionData.set(key, existing);
      });

      const report = Array.from(collectionData.values());
      report.sort((a, b) => b.date.localeCompare(a.date));

      // Daily summary
      const dailySummary = new Map<string, any>();
      report.forEach(item => {
        const summary = dailySummary.get(item.date) || {
          date: item.date,
          total_collected: 0,
          driver_count: 0,
          order_count: 0
        };
        summary.total_collected += item.total_collected;
        summary.driver_count++;
        summary.order_count += item.order_count;
        dailySummary.set(item.date, summary);
      });

      return {
        report,
        daily_summary: Array.from(dailySummary.values()),
        grand_total: report.reduce((sum, r) => sum + r.total_collected, 0)
      };
    }),

  // Get credit aging report
  getCreditAgingReport: adminProcedure
    .query(async () => {
      const supabase = getServiceSupabase();
      
      // Get retailers with outstanding credit
      const { data: retailers, error } = await supabase
        .from('retailers')
        .select(`
          id,
          business_name,
          credit_limit,
          current_balance,
          created_at,
          orders!inner(
            id,
            total_amount,
            created_at,
            status,
            payment_method,
            payments(
              amount,
              payment_date
            )
          )
        `)
        .lt('current_balance', 0) // Negative balance means they owe money
        .eq('status', 'active');

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Calculate aging buckets
      const agingReport = retailers?.map(retailer => {
        const outstandingOrders = retailer.orders.filter(order => {
          if (order.payment_method !== 'credit') return false;
          const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
          return totalPaid < order.total_amount;
        });

        // Group by age
        const now = Date.now();
        const aging = {
          current: 0, // 0-30 days
          thirtyDays: 0, // 31-60 days
          sixtyDays: 0, // 61-90 days
          ninetyDays: 0, // 91+ days
        };

        outstandingOrders.forEach(order => {
          const orderAge = Math.floor((now - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
          const totalPaid = order.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
          const outstanding = order.total_amount - totalPaid;

          if (orderAge <= 30) aging.current += outstanding;
          else if (orderAge <= 60) aging.thirtyDays += outstanding;
          else if (orderAge <= 90) aging.sixtyDays += outstanding;
          else aging.ninetyDays += outstanding;
        });

        const totalOutstanding = -retailer.current_balance; // Make positive

        return {
          retailer_id: retailer.id,
          business_name: retailer.business_name,
          credit_limit: retailer.credit_limit,
          current_balance: retailer.current_balance,
          total_outstanding: totalOutstanding,
          utilization_percentage: (totalOutstanding / retailer.credit_limit) * 100,
          aging_current: aging.current,
          aging_30_days: aging.thirtyDays,
          aging_60_days: aging.sixtyDays,
          aging_90_plus_days: aging.ninetyDays,
          oldest_invoice_days: outstandingOrders.length > 0 
            ? Math.max(...outstandingOrders.map(o => 
                Math.floor((now - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24))
              ))
            : 0
        };
      }) || [];

      // Sort by total outstanding
      agingReport.sort((a, b) => b.total_outstanding - a.total_outstanding);

      // Calculate summary
      const summary = {
        total_retailers: agingReport.length,
        total_outstanding: agingReport.reduce((sum, r) => sum + r.total_outstanding, 0),
        aging_summary: {
          current: agingReport.reduce((sum, r) => sum + r.aging_current, 0),
          thirty_days: agingReport.reduce((sum, r) => sum + r.aging_30_days, 0),
          sixty_days: agingReport.reduce((sum, r) => sum + r.aging_60_days, 0),
          ninety_plus_days: agingReport.reduce((sum, r) => sum + r.aging_90_plus_days, 0)
        },
        high_risk_count: agingReport.filter(r => r.aging_90_plus_days > 0).length
      };

      return { report: agingReport, summary };
    }),

  // Get tax compliance report
  getTaxComplianceReport: adminProcedure
    .input(z.object({
      dateRange: dateRangeSchema,
      taxRate: z.number().default(19) // Default Algerian VAT rate
    }))
    .query(async ({ input }) => {
      const { dateRange, taxRate } = input;

      const supabase = getServiceSupabase();
      
      // Get all delivered orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          created_at,
          order_items(
            quantity,
            unit_price,
            total_price,
            products(
              tax_rate
            )
          )
        `)
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to)
        .eq('status', 'delivered');

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Calculate tax details
      const taxReport = orders?.map(order => {
        let subtotal = 0;
        let taxAmount = 0;

        order.order_items.forEach(item => {
          const itemTaxRate = item.products?.tax_rate || taxRate;
          const itemSubtotal = item.total_price / (1 + itemTaxRate / 100);
          const itemTax = item.total_price - itemSubtotal;
          
          subtotal += itemSubtotal;
          taxAmount += itemTax;
        });

        return {
          order_number: order.order_number,
          date: new Date(order.created_at).toISOString().split('T')[0],
          subtotal,
          tax_amount: taxAmount,
          total_amount: order.total_amount
        };
      }) || [];

      // Group by month for summary
      const monthlySummary = new Map<string, any>();
      
      taxReport.forEach(item => {
        const month = item.date.substring(0, 7);
        const summary = monthlySummary.get(month) || {
          month,
          order_count: 0,
          subtotal: 0,
          tax_collected: 0,
          total_revenue: 0
        };

        summary.order_count++;
        summary.subtotal += item.subtotal;
        summary.tax_collected += item.tax_amount;
        summary.total_revenue += item.total_amount;

        monthlySummary.set(month, summary);
      });

      const summary = {
        total_orders: taxReport.length,
        total_subtotal: taxReport.reduce((sum, r) => sum + r.subtotal, 0),
        total_tax_collected: taxReport.reduce((sum, r) => sum + r.tax_amount, 0),
        total_revenue: taxReport.reduce((sum, r) => sum + r.total_amount, 0),
        monthly_breakdown: Array.from(monthlySummary.values())
      };

      return { report: taxReport, summary };
    }),

  // Get user activity report
  getUserActivityReport: adminProcedure
    .input(z.object({
      dateRange: dateRangeSchema,
      userId: z.string().optional(),
      actionType: z.string().optional()
    }))
    .query(async ({ input }) => {
      const { dateRange, userId, actionType } = input;

      const supabase = getServiceSupabase();
      
      // Get audit logs
      let logsQuery = supabase
        .from('audit_logs')
        .select(`
          id,
          user_id,
          action,
          entity_type,
          entity_id,
          old_values,
          new_values,
          ip_address,
          user_agent,
          created_at,
          users!inner(
            username,
            full_name,
            role
          )
        `)
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to)
        .order('created_at', { ascending: false });

      if (userId) {
        logsQuery = logsQuery.eq('user_id', userId);
      }
      if (actionType) {
        logsQuery = logsQuery.eq('action', actionType);
      }

      const { data: logs, error } = await logsQuery;
      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      // Group by user and action
      const userActivity = new Map<string, any>();
      
      logs?.forEach(log => {
        const userKey = log.user_id;
        const activity = userActivity.get(userKey) || {
          user_id: log.user_id,
          username: log.users?.username,
          full_name: log.users?.full_name,
          role: log.users?.role,
          total_actions: 0,
          actions_by_type: new Map(),
          last_activity: null,
          first_activity: null
        };

        activity.total_actions++;
        
        const actionCount = activity.actions_by_type.get(log.action) || 0;
        activity.actions_by_type.set(log.action, actionCount + 1);

        if (!activity.last_activity || new Date(log.created_at) > new Date(activity.last_activity)) {
          activity.last_activity = log.created_at;
        }
        if (!activity.first_activity || new Date(log.created_at) < new Date(activity.first_activity)) {
          activity.first_activity = log.created_at;
        }

        userActivity.set(userKey, activity);
      });

      // Convert to array
      const report = Array.from(userActivity.values()).map(user => ({
        ...user,
        actions_by_type: Array.from(user.actions_by_type.entries()).map(([action, count]) => ({
          action,
          count
        }))
      }));

      // Sort by total actions
      report.sort((a, b) => b.total_actions - a.total_actions);

      // Calculate summary
      const actionSummary = new Map<string, number>();
      logs?.forEach(log => {
        const count = actionSummary.get(log.action) || 0;
        actionSummary.set(log.action, count + 1);
      });

      return {
        report,
        summary: {
          total_users: report.length,
          total_actions: logs?.length || 0,
          actions_by_type: Array.from(actionSummary.entries()).map(([action, count]) => ({
            action,
            count,
            percentage: logs ? (count / logs.length) * 100 : 0
          }))
        },
        recent_activity: logs?.slice(0, 50) || []
      };
    }),

  // Generate custom report
  generateCustomReport: adminProcedure
    .input(z.object({
      reportType: z.string(),
      parameters: z.record(z.any()),
      dateRange: dateRangeSchema.optional()
    }))
    .query(async ({ input }) => {
      // This is a placeholder for custom report generation
      // In a real implementation, this would dynamically generate reports based on parameters
      throw new TRPCError({
        code: 'NOT_IMPLEMENTED',
        message: 'Custom report generation not yet implemented'
      });
    }),

  // Schedule a report
  scheduleReport: adminProcedure
    .input(z.object({
      reportType: z.string(),
      parameters: z.record(z.any()),
      schedule: z.object({
        frequency: z.enum(['daily', 'weekly', 'monthly']),
        time: z.string(), // HH:MM format
        dayOfWeek: z.number().optional(), // 0-6 for weekly
        dayOfMonth: z.number().optional(), // 1-31 for monthly
        recipients: z.array(z.string()) // Email addresses
      })
    }))
    .mutation(async ({ input }) => {
      // This would save the scheduled report configuration
      // In a real implementation, a cron job would execute these
      return {
        id: crypto.randomUUID(),
        ...input,
        created_at: new Date().toISOString(),
        status: 'scheduled'
      };
    }),

  // Export report
  exportReport: adminProcedure
    .input(z.object({
      reportType: z.string(),
      data: z.any(),
      format: exportFormatSchema,
      filename: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      const { reportType, data, format, filename } = input;
      
      // Generate filename if not provided
      const finalFilename = filename || `${reportType}_${new Date().toISOString().split('T')[0]}`;

      // In a real implementation, this would generate actual files
      // For now, return a mock response
      return {
        filename: `${finalFilename}.${format}`,
        url: `/api/reports/download/${finalFilename}.${format}`,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
      };
    }),

  // Get report templates
  getReportTemplates: adminProcedure
    .query(async () => {
      // Predefined report templates
      const templates = [
        {
          id: '1',
          name: 'Daily Sales Summary',
          description: 'Overview of daily sales performance',
          report_type: 'sales',
          parameters: {
            groupBy: 'day',
            includeTopProducts: true
          }
        },
        {
          id: '2',
          name: 'Monthly Financial Report',
          description: 'Comprehensive monthly financial overview',
          report_type: 'financial',
          parameters: {
            includeCredit: true,
            includeTax: true
          }
        },
        {
          id: '3',
          name: 'Retailer Performance',
          description: 'Top performing retailers analysis',
          report_type: 'retailer',
          parameters: {
            limit: 20,
            sortBy: 'revenue'
          }
        },
        {
          id: '4',
          name: 'Inventory Status',
          description: 'Current inventory levels and predictions',
          report_type: 'inventory',
          parameters: {
            includeStockouts: true,
            includePredictions: true
          }
        }
      ];

      return { templates };
    }),

  // Save report template
  saveReportTemplate: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      report_type: z.string(),
      parameters: z.record(z.any())
    }))
    .mutation(async ({ input }) => {
      // In a real implementation, this would save to database
      return {
        id: crypto.randomUUID(),
        ...input,
        created_at: new Date().toISOString(),
        created_by: 'current-user-id'
      };
    })
});

export type ReportsRouter = typeof reportsRouter;
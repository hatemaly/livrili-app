# Analytics Dashboard Implementation

This document describes the real-time analytics dashboard implementation for the Livrili admin portal.

## Overview

The analytics dashboard provides comprehensive insights into business operations including:

- Real-time metrics and KPIs
- Order trends and performance analysis
- Geographic distribution of customers
- Retailer and product performance metrics
- Interactive charts and visualizations

## Architecture

### Backend API (tRPC Analytics Router)

Location: `packages/api/src/routers/analytics.ts`

The analytics router provides the following endpoints:

#### Core Endpoints

1. **`getDashboardMetrics`**
   - Returns key dashboard metrics (active orders, GMV, active users, retailers)
   - Includes trend calculations vs previous period
   - Cache duration: 1 minute

2. **`getOrderTrends`**
   - Provides order trends analysis (daily/weekly/monthly)
   - Configurable time periods (up to 365 days)
   - Includes revenue, delivery rates, cancellation rates
   - Cache duration: 5 minutes

3. **`getGeographicMetrics`**
   - Geographic distribution of orders by city and state
   - Revenue mapping and delivery performance by location
   - Cache duration: 5 minutes

4. **`getPerformanceMetrics`**
   - Delivery success rates and timing analysis
   - Order status distribution
   - Daily performance trends
   - Cache duration: 10 minutes

5. **`getRealtimeMetrics`** (Subscription)
   - Live metrics updates every 10 seconds
   - Active orders, online users, today's revenue
   - WebSocket-ready for future real-time implementation

6. **`getRetailerMetrics`**
   - Top performing retailers by revenue
   - Activity levels and credit utilization
   - Delivery performance by retailer
   - Cache duration: 15 minutes

7. **`getProductMetrics`**
   - Best selling products and categories
   - Stock level monitoring
   - Product performance analysis
   - Cache duration: 15 minutes

### Frontend Components

#### Core Dashboard Components

1. **`MetricCard`** (`components/dashboard/metric-card.tsx`)
   - Reusable metric display component
   - Supports trend indicators and color themes
   - Loading states and click handlers

2. **`OrderTrendsChart`** (`components/dashboard/order-trends-chart.tsx`)
   - Interactive line/bar charts using Recharts
   - Switchable between orders and revenue views
   - Responsive design with custom tooltips

3. **`GeographicChart`** (`components/dashboard/geographic-chart.tsx`)
   - Geographic data visualization
   - State and city level analysis
   - Pie charts and horizontal bar charts

4. **`PerformanceMetrics`** (`components/dashboard/performance-metrics.tsx`)
   - KPI cards for delivery performance
   - Order status distribution
   - Daily performance trends with area charts

5. **`RealTimeWidget`** (`components/dashboard/real-time-widget.tsx`)
   - Live metrics display with gradient background
   - Connection status indicators
   - Auto-updating timestamps

6. **`TopPerformers`** (`components/dashboard/top-performers.tsx`)
   - Tabbed interface for retailers and products
   - Activity level indicators
   - Performance ranking system

#### Enhanced Features

1. **Error Boundaries** (`components/dashboard/error-boundary.tsx`)
   - Graceful error handling for dashboard components
   - Development mode error details
   - Retry functionality

2. **Cache Management** (`lib/cache-config.ts`)
   - Intelligent caching strategies
   - Query invalidation patterns
   - Performance optimization

3. **Real-time Updates**
   - Configurable refresh intervals (10s, 30s, 1m, 5m, off)
   - Manual refresh functionality
   - Smart cache invalidation

## Features

### Real-time Capabilities

- **Auto-refresh**: Configurable intervals from 10 seconds to off
- **Manual refresh**: Force refresh all data with cache invalidation
- **Live indicators**: Connection status and last update timestamps
- **Real-time widget**: Simulated live metrics (ready for WebSocket integration)

### Performance Optimization

- **Intelligent Caching**: Different cache durations based on data volatility
- **Query Optimization**: Batched requests and parallel fetching
- **Loading States**: Skeleton screens and progressive loading
- **Error Recovery**: Automatic retries and fallback strategies

### Data Visualization

- **Interactive Charts**: Built with Recharts library
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Custom Tooltips**: Rich context information on hover
- **Color Coding**: Consistent color schemes for different metrics

### User Experience

- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Mode Ready**: Prepared for theme switching
- **Accessibility**: WCAG compliant components
- **Progressive Enhancement**: Works without JavaScript for basic metrics

## Technical Implementation

### Database Queries

The analytics router uses optimized PostgreSQL queries with:

- **Aggregations**: SUM, COUNT, AVG for performance metrics
- **Window Functions**: For trend calculations and comparisons
- **Joins**: Efficient joins with retailers, products, and users tables
- **Filtering**: Date ranges, status filters, and geographic filters
- **Indexing**: Optimized for analytics workloads

### Caching Strategy

```typescript
// Cache Configuration
const CACHE_CONFIG = {
  realtime: { staleTime: 10s, cacheTime: 30s },
  dashboard: { staleTime: 1m, cacheTime: 5m },
  analytics: { staleTime: 5m, cacheTime: 15m },
  performance: { staleTime: 10m, cacheTime: 30m },
  performers: { staleTime: 15m, cacheTime: 1h },
}
```

### Error Handling

- **Component Level**: Error boundaries for graceful degradation
- **API Level**: Proper error codes and messages
- **Network Level**: Retry logic and timeout handling
- **User Level**: Friendly error messages and recovery options

## Security Considerations

- **Admin Only**: All analytics endpoints require admin role
- **Rate Limiting**: Prevents abuse of analytics endpoints
- **Data Sanitization**: All inputs validated and sanitized
- **Access Logging**: Analytics access logged for audit trails

## Future Enhancements

### Real-time Data Streaming

- WebSocket implementation for live metrics
- Server-Sent Events for dashboard updates
- Real-time notifications for critical events

### Advanced Analytics

- Predictive analytics and forecasting
- Customer segmentation analysis
- Inventory optimization recommendations
- Revenue optimization insights

### Export and Reporting

- PDF export functionality
- Excel/CSV data exports
- Scheduled email reports
- Custom dashboard creation

### Mobile App Integration

- React Native dashboard components
- Offline analytics caching
- Push notifications for alerts

## Performance Metrics

### Target Performance

- **Load Time**: <3s on 3G, <1s on WiFi
- **Bundle Size**: <500KB initial, <2MB total
- **API Response**: <200ms for dashboard metrics
- **Chart Rendering**: <100ms for interactive updates

### Monitoring

- Real User Monitoring (RUM) integration
- Performance budgets and alerts
- Core Web Vitals tracking
- Error rate monitoring

## Deployment

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

### Build Configuration

- Next.js optimizations enabled
- Bundle analyzer for size monitoring
- TypeScript strict mode enabled
- ESLint and Prettier configured

## Development

### Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck
```

### Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Husky for pre-commit hooks
- Conventional commits

## Troubleshooting

### Common Issues

1. **Slow Loading**: Check cache configuration and database indexes
2. **Chart Rendering**: Verify Recharts compatibility and data format
3. **Real-time Updates**: Ensure proper refresh intervals and cache invalidation
4. **Mobile Performance**: Optimize bundle size and lazy loading

### Debug Tools

- React Query DevTools for cache inspection
- Supabase dashboard for database monitoring
- Network tab for API performance analysis
- Lighthouse for performance auditing

## Support

For technical support or feature requests, please:

1. Check the troubleshooting section
2. Review the component documentation
3. Create an issue in the project repository
4. Contact the development team

## License

This implementation is part of the Livrili platform and is proprietary software.
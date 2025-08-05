"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { TrendingUp, Package, DollarSign, RotateCw } from "lucide-react";

export function ProductPerformanceAnalytics() {
  const [dateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const productData = api.intelligence.getProductPerformance.useQuery({ 
    dateRange, 
    limit: 15 
  });

  const getStockTurnoverColor = (rate: number) => {
    if (rate >= 12) return "destructive"; // Too fast, might indicate stockouts
    if (rate >= 4) return "success"; // Healthy turnover
    if (rate >= 2) return "warning"; // Slow moving
    return "secondary"; // Very slow
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Prepare chart data
  const chartData = productData.data?.products.slice(0, 10).map(product => ({
    name: product.name.length > 20 ? product.name.substring(0, 20) + '...' : product.name,
    revenue: product.revenue,
    units: product.units_sold,
    profit: product.profit
  })) || [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productData.data?.summary.total_products || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(productData.data?.summary.total_revenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productData.data?.summary.total_units_sold.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit Margin</CardTitle>
            <RotateCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productData.data?.summary.average_profit_margin.toFixed(1) || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products by Revenue</CardTitle>
          <CardDescription>Revenue and profit distribution for top performing products</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Metrics</CardTitle>
          <CardDescription>
            Detailed performance analysis including sales velocity and stock turnover
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Velocity</TableHead>
                <TableHead>Turnover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productData.data?.products.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      {product.name_ar && (
                        <div className="text-sm text-muted-foreground">{product.name_ar}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{product.units_sold.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(product.revenue)}</TableCell>
                  <TableCell>{formatCurrency(product.profit)}</TableCell>
                  <TableCell>
                    <Badge variant={product.profit_margin > 20 ? "success" : "secondary"}>
                      {product.profit_margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock_quantity < 50 ? "destructive" : "secondary"}>
                      {product.stock_quantity}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.sales_velocity.toFixed(1)}/day</TableCell>
                  <TableCell>
                    <Badge variant={getStockTurnoverColor(product.stock_turnover_rate)}>
                      {product.stock_turnover_rate.toFixed(1)}x/year
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
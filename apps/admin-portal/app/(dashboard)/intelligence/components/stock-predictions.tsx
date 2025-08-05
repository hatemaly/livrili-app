"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Package, TrendingDown, ShoppingCart } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function StockPredictionInterface() {
  const stockData = api.intelligence.getStockoutPredictions.useQuery({ 
    threshold_days: 7,
    limit: 20 
  });

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⏰';
      default: return '✓';
    }
  };

  const formatDaysUntilStockout = (days: number | null) => {
    if (days === null) return 'Stable';
    if (days <= 0) return 'Out of Stock';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      {stockData.data?.summary.critical_items && stockData.data.summary.critical_items > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Critical Stock Alert</AlertTitle>
          <AlertDescription>
            {stockData.data.summary.critical_items} products will be out of stock within 3 days. 
            Immediate action required!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.data?.summary.critical_items || 0}</div>
            <p className="text-xs text-muted-foreground">
              Stockout within 3 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.data?.summary.high_risk_items || 0}</div>
            <p className="text-xs text-muted-foreground">
              Stockout within 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total At Risk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockData.data?.summary.total_at_risk || 0}</div>
            <p className="text-xs text-muted-foreground">
              Products need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Now</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockData.data?.predictions.filter(p => p.is_at_risk).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Products to reorder
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock-out Predictions</CardTitle>
          <CardDescription>
            Products sorted by risk level and days until stockout
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Daily Velocity</TableHead>
                <TableHead>Days Until Stockout</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Stock Health</TableHead>
                <TableHead>Recommended Reorder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockData.data?.predictions.map((prediction) => (
                <TableRow key={prediction.product_id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prediction.name}</div>
                      {prediction.name_ar && (
                        <div className="text-sm text-muted-foreground">{prediction.name_ar}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{prediction.current_stock}</TableCell>
                  <TableCell>{prediction.daily_velocity} units/day</TableCell>
                  <TableCell className="font-medium">
                    {formatDaysUntilStockout(prediction.days_until_stockout)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRiskColor(prediction.risk_level)}>
                      {getRiskIcon(prediction.risk_level)} {prediction.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Progress 
                      value={prediction.days_until_stockout ? Math.min(100, (prediction.days_until_stockout / 30) * 100) : 100} 
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {prediction.recommended_reorder_quantity} units
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
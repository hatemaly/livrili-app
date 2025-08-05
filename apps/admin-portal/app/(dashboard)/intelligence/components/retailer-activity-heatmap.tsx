"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { Calendar, DollarSign, Package, TrendingUp } from "lucide-react";

export function RetailerActivityHeatmap() {
  const [dateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });

  const activityData = api.intelligence.getRetailerActivityAnalysis.useQuery({ 
    dateRange, 
    limit: 20 
  });

  const getActivityColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getActivityLabel = (score: number) => {
    if (score >= 80) return "Very Active";
    if (score >= 60) return "Active";
    if (score >= 40) return "Moderate";
    if (score >= 20) return "Low";
    return "Dormant";
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retailers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.data?.summary.total_retailers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Retailers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.data?.summary.active_retailers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Score above 50
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dormant Retailers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.data?.summary.dormant_retailers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need reactivation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Activity Score</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityData.data?.summary.average_activity_score || 0}</div>
            <p className="text-xs text-muted-foreground">
              Out of 100
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retailer Activity Analysis</CardTitle>
          <CardDescription>
            Top retailers by activity score (based on order frequency, value, and recency)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Retailer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Avg Order</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Last Order</TableHead>
                <TableHead>Activity Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityData.data?.retailers.map((retailer) => (
                <TableRow key={retailer.retailer_id}>
                  <TableCell className="font-medium">{retailer.business_name}</TableCell>
                  <TableCell>{retailer.location}</TableCell>
                  <TableCell>{retailer.order_count}</TableCell>
                  <TableCell>{retailer.total_value.toLocaleString()} DZD</TableCell>
                  <TableCell>{Math.round(retailer.average_order_value).toLocaleString()} DZD</TableCell>
                  <TableCell>
                    Every {Math.round(retailer.order_frequency_days)} days
                  </TableCell>
                  <TableCell>
                    {retailer.last_order_date 
                      ? new Date(retailer.last_order_date).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Progress value={retailer.activity_score} className="w-20" />
                      <Badge className={getActivityColor(retailer.activity_score)}>
                        {getActivityLabel(retailer.activity_score)}
                      </Badge>
                    </div>
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
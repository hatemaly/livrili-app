"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemandForecastingCharts() {
  const [forecastDays, setForecastDays] = useState(30);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(undefined);

  const forecastData = api.intelligence.getDemandForecasting.useQuery({ 
    product_id: selectedProduct,
    forecast_days: forecastDays
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'success';
      case 'decreasing': return 'destructive';
      default: return 'secondary';
    }
  };

  // Combine historical and forecast data for chart
  const chartData = [
    ...(forecastData.data?.historical_data || []).map(d => ({
      date: d.date,
      actual: d.quantity,
      type: 'historical'
    })),
    ...(forecastData.data?.forecast || []).map(d => ({
      date: d.date,
      forecast: d.forecast_quantity,
      lower: d.confidence_interval.lower,
      upper: d.confidence_interval.upper,
      type: 'forecast'
    }))
  ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecasting Controls</CardTitle>
          <CardDescription>Configure forecast parameters</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={forecastDays.toString()} onValueChange={(v) => setForecastDays(Number(v))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Forecast period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Demand</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData.data?.analysis.average_daily_demand || 0} units
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            {getTrendIcon(forecastData.data?.analysis.trend || 'stable')}
          </CardHeader>
          <CardContent>
            <Badge variant={getTrendColor(forecastData.data?.analysis.trend || 'stable')}>
              {forecastData.data?.analysis.trend || 'stable'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seasonality</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={forecastData.data?.analysis.seasonality_detected ? "default" : "outline"}>
              {forecastData.data?.analysis.seasonality_detected ? "Detected" : "Not Detected"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData.data?.analysis.confidence_score || 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast</CardTitle>
          <CardDescription>
            Historical data (solid line) and forecast with confidence intervals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              
              {/* Historical data */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Historical"
                connectNulls
              />
              
              {/* Forecast confidence interval */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="#82ca9d"
                fillOpacity={0.2}
                name="Upper bound"
                connectNulls
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="#82ca9d"
                fillOpacity={0.2}
                name="Lower bound"
                connectNulls
              />
              
              {/* Forecast line */}
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#82ca9d" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Forecast"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomalies */}
      {forecastData.data?.analysis.anomalies && forecastData.data.analysis.anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detected Anomalies</CardTitle>
            <CardDescription>Unusual demand patterns in historical data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {forecastData.data.analysis.anomalies.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{anomaly.date}</span>
                  <Badge variant="destructive">{anomaly.value} units</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
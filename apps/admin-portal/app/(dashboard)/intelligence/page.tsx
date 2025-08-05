"use client";

import { useState } from "react";
import { usePageTitle } from '../../../hooks/use-page-title'
import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceDashboard } from "./components/performance-dashboard";
import { RetailerActivityHeatmap } from "./components/retailer-activity-heatmap";
import { ProductPerformanceAnalytics } from "./components/product-performance";
import { StockPredictionInterface } from "./components/stock-predictions";
import { DemandForecastingCharts } from "./components/demand-forecasting";
import { SystemHealthMonitoring } from "./components/system-health";
import { AlertManagementCenter } from "./components/alert-management";
import { BusinessInsightsPanel } from "./components/business-insights";

export default function IntelligencePage() {
  usePageTitle('Business Intelligence - Livrili Admin Portal')
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Operational Intelligence</h2>
        <p className="text-muted-foreground">
          Advanced analytics and predictive insights for your business
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="retailers">Retailers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="health">System</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PerformanceDashboard />
        </TabsContent>

        <TabsContent value="retailers" className="space-y-4">
          <RetailerActivityHeatmap />
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <ProductPerformanceAnalytics />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <StockPredictionInterface />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <DemandForecastingCharts />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <SystemHealthMonitoring />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertManagementCenter />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <BusinessInsightsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
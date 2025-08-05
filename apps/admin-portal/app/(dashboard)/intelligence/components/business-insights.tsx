"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, TrendingUp, AlertCircle, Zap, ArrowRight } from "lucide-react";

export function BusinessInsightsPanel() {
  const insightsData = api.intelligence.getBusinessInsights.useQuery();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'optimization': return <Zap className="h-5 w-5 text-blue-500" />;
      case 'growth': return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'risk': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string): "default" | "destructive" | "outline" | "secondary" | "warning" => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'optimization': return 'bg-blue-50 border-blue-200';
      case 'growth': return 'bg-yellow-50 border-yellow-200';
      case 'risk': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Business Insights</CardTitle>
              <CardDescription>
                AI-powered recommendations to improve your business
              </CardDescription>
            </div>
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
          </div>
        </CardHeader>
      </Card>

      {/* Insights Grid */}
      <div className="grid gap-4">
        {insightsData.data?.insights.map((insight) => (
          <Card 
            key={insight.id} 
            className={`border-2 ${getTypeColor(insight.type)} transition-all hover:shadow-md`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getInsightIcon(insight.type)}
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority} priority
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {insight.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              
              <div className="space-y-3">
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Recommended Action:</p>
                  <p className="text-sm text-muted-foreground">{insight.action}</p>
                </div>
                
                <div className="bg-background/60 rounded-lg p-3">
                  <p className="text-sm font-medium mb-1">Expected Impact:</p>
                  <p className="text-sm text-muted-foreground">{insight.impact}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" className="group">
                  Take Action
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Insights Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {insightsData.data?.insights.filter(i => i.type === 'opportunity').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Opportunities</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {insightsData.data?.insights.filter(i => i.type === 'optimization').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Optimizations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {insightsData.data?.insights.filter(i => i.type === 'growth').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Growth Ideas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {insightsData.data?.insights.filter(i => i.type === 'risk').length || 0}
              </p>
              <p className="text-sm text-muted-foreground">Risk Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
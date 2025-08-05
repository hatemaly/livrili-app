"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, XCircle, Activity, Server, Database, Cloud, Bell } from "lucide-react";

export function SystemHealthMonitoring() {
  const healthData = api.intelligence.getSystemHealthMetrics.useQuery(undefined, {
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "outline" | "secondary" | "warning" | "success" => {
    switch (status) {
      case 'healthy': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      default: return 'secondary';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'Database': return <Database className="h-4 w-4" />;
      case 'Cache': return <Server className="h-4 w-4" />;
      case 'Storage': return <Cloud className="h-4 w-4" />;
      case 'Notifications': return <Bell className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const formatLatency = (ms: number) => {
    if (ms < 100) return 'Excellent';
    if (ms < 300) return 'Good';
    if (ms < 1000) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Overall system health and performance</CardDescription>
            </div>
            {getStatusIcon(healthData.data?.status || 'unknown')}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {healthData.data?.status === 'healthy' ? 'All Systems Operational' : 'System Issues Detected'}
            </span>
            <Badge variant={getStatusColor(healthData.data?.status || 'unknown')}>
              {healthData.data?.status || 'Unknown'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.data?.uptime_percentage || 0}%</div>
            <Progress value={healthData.data?.uptime_percentage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(healthData.data?.response_time_ms || 0)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatLatency(healthData.data?.response_time_ms || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthData.data?.active_users || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In the last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthData.data?.error_rate?.toFixed(2) || 0}%
            </div>
            <Badge variant={healthData.data?.error_rate && healthData.data.error_rate > 5 ? "destructive" : "success"}>
              {healthData.data?.error_rate && healthData.data.error_rate > 5 ? "High" : "Normal"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Individual service health and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthData.data?.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getServiceIcon(service.name)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Latency: {service.latency}ms
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Orders Processing</CardTitle>
            <CardDescription>Order throughput metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Orders per hour</span>
                <span className="font-medium">{healthData.data?.orders_per_hour || 0}</span>
              </div>
              <Progress value={Math.min(100, (healthData.data?.orders_per_hour || 0) / 100 * 100)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cache Performance</CardTitle>
            <CardDescription>Cache efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Hit rate</span>
                <span className="font-medium">
                  {healthData.data?.cache_hit_rate?.toFixed(1) || 0}%
                </span>
              </div>
              <Progress value={healthData.data?.cache_hit_rate || 0} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
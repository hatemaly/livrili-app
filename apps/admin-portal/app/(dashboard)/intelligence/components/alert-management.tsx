"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, Info, XCircle, CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function AlertManagementCenter() {
  const alertsData = api.intelligence.getAlerts.useQuery();

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stockout': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'performance': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'financial': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string): "default" | "destructive" | "outline" | "secondary" | "warning" => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'warning': return 'warning';
      case 'info': return 'secondary';
      default: return 'outline';
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    // In a real implementation, this would call an API to mark the alert as read
    console.log('Marking alert as read:', alertId);
  };

  const handleDismiss = (alertId: string) => {
    // In a real implementation, this would call an API to dismiss the alert
    console.log('Dismissing alert:', alertId);
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Center</CardTitle>
              <CardDescription>System alerts and notifications</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {alertsData.data?.unread_count && alertsData.data.unread_count > 0 && (
                <Badge variant="destructive">{alertsData.data.unread_count}</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alert Categories */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsData.data?.alerts.filter(a => a.severity === 'critical').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsData.data?.alerts.filter(a => a.severity === 'warning').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Need attention soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informational</CardTitle>
            <Info className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertsData.data?.alerts.filter(a => a.severity === 'info').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">For your information</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>All system alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alertsData.data?.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-4 rounded-lg border ${
                  alert.is_read ? 'bg-muted/30' : 'bg-background'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{alert.title}</p>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      {!alert.is_read && (
                        <Badge variant="default" className="text-xs">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!alert.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismiss(alert.id)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
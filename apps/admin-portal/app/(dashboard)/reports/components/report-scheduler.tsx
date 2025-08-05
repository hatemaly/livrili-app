"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Mail, Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const reportTypes = [
  { value: 'sales_daily', label: 'Daily Sales Summary' },
  { value: 'cash_collection', label: 'Cash Collection Report' },
  { value: 'credit_aging', label: 'Credit Aging Report' },
  { value: 'inventory_status', label: 'Inventory Status' },
  { value: 'user_activity', label: 'User Activity Report' }
];

const frequencies = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const daysOfWeek = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' }
];

export function ReportScheduler() {
  const [reportType, setReportType] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [time, setTime] = useState('08:00');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');

  const scheduleReportMutation = api.reports.scheduleReport.useMutation({
    onSuccess: () => {
      toast({
        title: "Report Scheduled",
        description: "The report has been scheduled successfully.",
      });
      // Reset form
      setReportType('');
      setRecipients([]);
      setNewRecipient('');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleAddRecipient = () => {
    if (newRecipient && newRecipient.includes('@')) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleScheduleReport = () => {
    if (!reportType || recipients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a report type and add at least one recipient.",
        variant: "destructive",
      });
      return;
    }

    const schedule: any = {
      frequency,
      time,
      recipients
    };

    if (frequency === 'weekly') {
      schedule.dayOfWeek = parseInt(dayOfWeek);
    } else if (frequency === 'monthly') {
      schedule.dayOfMonth = parseInt(dayOfMonth);
    }

    scheduleReportMutation.mutate({
      reportType,
      parameters: {},
      schedule
    });
  };

  // Mock scheduled reports
  const scheduledReports = [
    {
      id: '1',
      reportType: 'Daily Sales Summary',
      frequency: 'daily',
      time: '08:00',
      recipients: ['manager@livrili.com'],
      status: 'active'
    },
    {
      id: '2',
      reportType: 'Weekly Credit Aging',
      frequency: 'weekly',
      time: '09:00',
      dayOfWeek: 1,
      recipients: ['finance@livrili.com', 'cfo@livrili.com'],
      status: 'active'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Schedule New Report */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Schedule New Report</h3>
        
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {frequencies.map(freq => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time</Label>
            <Input 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {frequency === 'weekly' && (
          <div className="space-y-2">
            <Label>Day of Week</Label>
            <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {frequency === 'monthly' && (
          <div className="space-y-2">
            <Label>Day of Month</Label>
            <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Recipients</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@example.com"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={handleAddRecipient}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {recipients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {recipients.map(email => (
                <Badge key={email} variant="secondary">
                  <Mail className="w-3 h-3 mr-1" />
                  {email}
                  <button
                    onClick={() => handleRemoveRecipient(email)}
                    className="ml-2 hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button 
          onClick={handleScheduleReport}
          disabled={scheduleReportMutation.isLoading}
          className="w-full"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Existing Scheduled Reports */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Scheduled Reports</h3>
        <div className="space-y-3">
          {scheduledReports.map(report => (
            <Card key={report.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{report.reportType}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {report.frequency}
                        {report.frequency === 'weekly' && ` (${daysOfWeek.find(d => d.value === report.dayOfWeek?.toString())?.label})`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {report.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {report.recipients.length} recipient{report.recipients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={report.status === 'active' ? 'success' : 'secondary'}>
                      {report.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
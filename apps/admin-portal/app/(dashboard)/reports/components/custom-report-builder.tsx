"use client";

import { useState } from "react";
import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { BarChart3, FileDown, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const reportTypes = [
  { value: 'sales', label: 'Sales Analysis' },
  { value: 'inventory', label: 'Inventory Status' },
  { value: 'customer', label: 'Customer Insights' },
  { value: 'financial', label: 'Financial Overview' },
  { value: 'operations', label: 'Operations Metrics' }
];

const exportFormats = [
  { value: 'excel', label: 'Excel (.xlsx)', icon: '📊' },
  { value: 'pdf', label: 'PDF (.pdf)', icon: '📄' },
  { value: 'csv', label: 'CSV (.csv)', icon: '📋' }
];

export function CustomReportBuilder() {
  const [reportType, setReportType] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('excel');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });

  const exportMutation = api.reports.exportReport.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Report Generated",
        description: `Your report is ready: ${data.filename}`,
      });
      // In a real app, this would trigger a download
      window.open(data.url, '_blank');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const availableFields = {
    sales: [
      { id: 'order_date', label: 'Order Date' },
      { id: 'order_number', label: 'Order Number' },
      { id: 'customer_name', label: 'Customer Name' },
      { id: 'product_name', label: 'Product Name' },
      { id: 'quantity', label: 'Quantity' },
      { id: 'unit_price', label: 'Unit Price' },
      { id: 'total_amount', label: 'Total Amount' },
      { id: 'payment_method', label: 'Payment Method' },
      { id: 'status', label: 'Status' }
    ],
    inventory: [
      { id: 'product_code', label: 'Product Code' },
      { id: 'product_name', label: 'Product Name' },
      { id: 'category', label: 'Category' },
      { id: 'current_stock', label: 'Current Stock' },
      { id: 'reserved_stock', label: 'Reserved Stock' },
      { id: 'available_stock', label: 'Available Stock' },
      { id: 'reorder_level', label: 'Reorder Level' },
      { id: 'last_restocked', label: 'Last Restocked' }
    ],
    customer: [
      { id: 'customer_id', label: 'Customer ID' },
      { id: 'business_name', label: 'Business Name' },
      { id: 'location', label: 'Location' },
      { id: 'join_date', label: 'Join Date' },
      { id: 'total_orders', label: 'Total Orders' },
      { id: 'total_spent', label: 'Total Spent' },
      { id: 'average_order', label: 'Average Order Value' },
      { id: 'last_order', label: 'Last Order Date' }
    ]
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleGenerateReport = () => {
    if (!reportType || selectedFields.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a report type and at least one field.",
        variant: "destructive",
      });
      return;
    }

    // In a real implementation, this would call the generateCustomReport endpoint
    exportMutation.mutate({
      reportType: 'custom',
      data: {
        type: reportType,
        fields: selectedFields,
        dateRange: {
          from: dateRange.from.toISOString().split('T')[0],
          to: dateRange.to.toISOString().split('T')[0]
        }
      },
      format: exportFormat as 'excel' | 'pdf' | 'csv'
    });
  };

  const fields = reportType ? availableFields[reportType as keyof typeof availableFields] || [] : [];

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
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

      {/* Date Range */}
      <div className="space-y-2">
        <Label>Date Range</Label>
        <DatePickerWithRange
          from={dateRange.from}
          to={dateRange.to}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              setDateRange({ from: range.from, to: range.to });
            }
          }}
        />
      </div>

      {/* Field Selection */}
      {reportType && (
        <div className="space-y-2">
          <Label>Select Fields</Label>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map(field => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.id}
                      checked={selectedFields.includes(field.id)}
                      onCheckedChange={() => handleFieldToggle(field.id)}
                    />
                    <Label 
                      htmlFor={field.id} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedFields.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Selected fields: {selectedFields.length}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFields.map(fieldId => {
                      const field = fields.find(f => f.id === fieldId);
                      return field ? (
                        <Badge key={fieldId} variant="secondary">
                          {field.label}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Format */}
      <div className="space-y-2">
        <Label>Export Format</Label>
        <div className="grid grid-cols-3 gap-4">
          {exportFormats.map(format => (
            <Card 
              key={format.value}
              className={`cursor-pointer transition-colors ${
                exportFormat === format.value ? 'border-primary' : ''
              }`}
              onClick={() => setExportFormat(format.value)}
            >
              <CardContent className="flex items-center justify-center p-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">{format.icon}</div>
                  <p className="text-sm font-medium">{format.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleGenerateReport}
          disabled={!reportType || selectedFields.length === 0 || exportMutation.isLoading}
        >
          {exportMutation.isLoading ? (
            <>
              <BarChart3 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-muted p-4">
        <div className="flex">
          <AlertCircle className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Custom Report Builder</p>
            <p>Select your report type, choose the fields you want to include, and export in your preferred format. Reports are generated based on the selected date range.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
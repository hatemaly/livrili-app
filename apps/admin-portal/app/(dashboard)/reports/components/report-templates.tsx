"use client";

import { api } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Settings, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function ReportTemplates() {
  const { data: templatesData, refetch } = api.reports.getReportTemplates.useQuery();
  
  const saveTemplateMutation = api.reports.saveReportTemplate.useMutation({
    onSuccess: () => {
      toast({
        title: "Template Saved",
        description: "Your report template has been saved successfully.",
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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

  const handleUseTemplate = (template: any) => {
    // Generate report using template
    const dateRange = {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    };

    exportMutation.mutate({
      reportType: template.report_type,
      data: {
        ...template.parameters,
        dateRange
      },
      format: 'excel'
    });
  };

  const templates = templatesData?.templates || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Use predefined templates for quick report generation
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-2">
                  {template.report_type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {Object.keys(template.parameters).length} parameters configured
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    disabled={exportMutation.isLoading}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create New Template */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <FileText className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            Create a new report template
          </p>
          <Button variant="outline" size="sm">
            Create Template
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
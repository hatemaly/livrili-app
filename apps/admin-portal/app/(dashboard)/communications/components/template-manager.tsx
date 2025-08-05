'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Plus, Edit, Trash2, Copy, FileText, Globe, Variable } from 'lucide-react'
import { api } from '@/lib/trpc'
import { format } from 'date-fns'

const templateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.enum(['welcome', 'order_update', 'payment_reminder', 'promotion', 'system', 'custom']),
  subject_en: z.string().max(500).optional(),
  subject_ar: z.string().max(500).optional(),
  subject_fr: z.string().max(500).optional(),
  content_en: z.string().optional(),
  content_ar: z.string().optional(),
  content_fr: z.string().optional(),
  variables: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['string', 'number', 'date', 'boolean']),
    required: z.boolean().default(false),
    description: z.string().optional()
  })).default([]),
  metadata: z.record(z.any()).default({})
})

type TemplateForm = z.infer<typeof templateSchema>

interface VariableFormProps {
  variables: TemplateForm['variables']
  onChange: (variables: TemplateForm['variables']) => void
}

function VariableForm({ variables, onChange }: VariableFormProps) {
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'string' as const,
    required: false,
    description: ''
  })

  const addVariable = () => {
    if (newVariable.name.trim()) {
      onChange([...variables, newVariable])
      setNewVariable({ name: '', type: 'string', required: false, description: '' })
    }
  }

  const removeVariable = (index: number) => {
    onChange(variables.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-3">
          <Label htmlFor="var-name">Variable Name</Label>
          <Input
            id="var-name"
            placeholder="customerName"
            value={newVariable.name}
            onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor="var-type">Type</Label>
          <Select
            value={newVariable.type}
            onValueChange={(value) => setNewVariable({ ...newVariable, type: value as any })}
          >
            <SelectTrigger id="var-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-4">
          <Label htmlFor="var-desc">Description</Label>
          <Input
            id="var-desc"
            placeholder="Description"
            value={newVariable.description}
            onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="var-required"
              checked={newVariable.required}
              onChange={(e) => setNewVariable({ ...newVariable, required: e.target.checked })}
            />
            <Label htmlFor="var-required" className="text-sm">Required</Label>
          </div>
        </div>
        <div className="col-span-1">
          <Button type="button" size="sm" onClick={addVariable}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {variables.length > 0 && (
        <div className="space-y-2">
          <Label>Current Variables</Label>
          {variables.map((variable, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center gap-4">
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {'{{' + variable.name + '}}'}
                </code>
                <Badge variant="outline">{variable.type}</Badge>
                {variable.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                {variable.description && (
                  <span className="text-sm text-muted-foreground">{variable.description}</span>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVariable(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function TemplateManager() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const form = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      variables: [],
      metadata: {}
    }
  })

  // API queries
  const { data: templates, refetch: refetchTemplates } = api.communications.getTemplates.useQuery({
    limit: 100
  })

  // Mutations
  const createTemplate = api.communications.createTemplate.useMutation({
    onSuccess: () => {
      form.reset()
      setIsCreateDialogOpen(false)
      refetchTemplates()
    }
  })

  const updateTemplate = api.communications.updateTemplate.useMutation({
    onSuccess: () => {
      form.reset()
      setIsEditDialogOpen(false)
      setEditingTemplate(null)
      refetchTemplates()
    }
  })

  const deleteTemplate = api.communications.deleteTemplate.useMutation({
    onSuccess: () => {
      refetchTemplates()
    }
  })

  const onSubmit = (data: TemplateForm) => {
    if (editingTemplate) {
      updateTemplate.mutate({ id: editingTemplate.id, ...data })
    } else {
      createTemplate.mutate(data)
    }
  }

  const handleEdit = (template: any) => {
    setEditingTemplate(template)
    form.reset({
      name: template.name,
      category: template.category,
      subject_en: template.subject_en || '',
      subject_ar: template.subject_ar || '',
      subject_fr: template.subject_fr || '',
      content_en: template.content_en || '',
      content_ar: template.content_ar || '',
      content_fr: template.content_fr || '',
      variables: template.variables || [],
      metadata: template.metadata || {}
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate.mutate({ id: templateId })
    }
  }

  const handleDuplicate = (template: any) => {
    form.reset({
      name: `${template.name} (Copy)`,
      category: template.category,
      subject_en: template.subject_en || '',
      subject_ar: template.subject_ar || '',
      subject_fr: template.subject_fr || '',
      content_en: template.content_en || '',
      content_ar: template.content_ar || '',
      content_fr: template.content_fr || '',
      variables: template.variables || [],
      metadata: template.metadata || {}
    })
    setIsCreateDialogOpen(true)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'welcome': return 'bg-green-100 text-green-800'
      case 'order_update': return 'bg-blue-100 text-blue-800'
      case 'payment_reminder': return 'bg-orange-100 text-orange-800'
      case 'promotion': return 'bg-purple-100 text-purple-800'
      case 'system': return 'bg-gray-100 text-gray-800'
      case 'custom': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTemplates = templates?.templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  ) || []

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'order_update', label: 'Order Updates' },
    { value: 'payment_reminder', label: 'Payment Reminders' },
    { value: 'promotion', label: 'Promotions' },
    { value: 'system', label: 'System' },
    { value: 'custom', label: 'Custom' }
  ]

  const TemplateForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter template name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="welcome">Welcome</SelectItem>
                    <SelectItem value="order_update">Order Update</SelectItem>
                    <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Tabs defaultValue="en" className="space-y-4">
          <TabsList>
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="ar">العربية</TabsTrigger>
            <TabsTrigger value="fr">Français</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="space-y-4">
            <FormField
              control={form.control}
              name="subject_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (English)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter subject in English" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (English)</FormLabel>
                  <FormDescription>
                    Use variables like {'{{customerName}}'}, {'{{businessName}}'} for personalization
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Enter template content in English"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="ar" className="space-y-4">
            <FormField
              control={form.control}
              name="subject_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (Arabic)</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل العنوان بالعربية" {...field} dir="rtl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (Arabic)</FormLabel>
                  <FormDescription>
                    استخدم المتغيرات مثل {'{{customerName}}'}, {'{{businessName}}'} للتخصيص
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="أدخل محتوى القالب بالعربية"
                      rows={6}
                      dir="rtl"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="fr" className="space-y-4">
            <FormField
              control={form.control}
              name="subject_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (French)</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le sujet en français" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content_fr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content (French)</FormLabel>
                  <FormDescription>
                    Utilisez des variables comme {'{{customerName}}'}, {'{{businessName}}'} pour la personnalisation
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="Entrez le contenu du modèle en français"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <FormField
          control={form.control}
          name="variables"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Variable className="h-4 w-4" />
                Template Variables
              </FormLabel>
              <FormDescription>
                Define variables that can be used in your template content
              </FormDescription>
              <FormControl>
                <VariableForm variables={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false)
              setIsEditDialogOpen(false)
              form.reset()
            }}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createTemplate.isPending || updateTemplate.isPending}>
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Form>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <TemplateForm />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
            </DialogHeader>
            <TemplateForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={getCategoryColor(template.category)}>
                    {template.category.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    disabled={template.is_system}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!template.is_system && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Subject (EN):</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {template.subject_en || 'No subject'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Content Preview:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content_en || 'No content'}
                  </p>
                </div>

                {template.variables && template.variables.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.slice(0, 3).map((variable: any, index: number) => (
                        <code key={index} className="text-xs bg-muted px-1 py-0.5 rounded">
                          {'{{' + variable.name + '}}'}
                        </code>
                      ))}
                      {template.variables.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{template.variables.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {template.is_system ? 'System Template' : 'Custom Template'}
                  </span>
                  <span>
                    {format(new Date(template.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
          <p className="text-muted-foreground mb-4">
            {selectedCategory === 'all' 
              ? 'Create your first message template to get started'
              : `No templates found in the ${selectedCategory} category`
            }
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create Template
          </Button>
        </div>
      )}
    </div>
  )
}
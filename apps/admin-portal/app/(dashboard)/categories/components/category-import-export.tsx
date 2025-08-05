'use client'

import { useState, useRef } from 'react'
import { Button } from '@livrili/ui'
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileDown,
  FileUp,
  Info
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'

interface CategoryImportExportProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface ImportResult {
  success: boolean
  total: number
  imported: number
  errors: string[]
  warnings: string[]
}

export function CategoryImportExport({
  isOpen,
  onClose,
  onImportComplete
}: CategoryImportExportProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import')
      return
    }

    setIsImporting(true)
    setImportProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate import progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      // Replace with actual API call
      const response = await fetch('/api/categories/import', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setImportProgress(100)

      if (!response.ok) {
        throw new Error('Import failed')
      }

      const result: ImportResult = await response.json()
      setImportResult(result)

      if (result.success) {
        toast.success(`Successfully imported ${result.imported} categories`)
        onImportComplete()
      } else {
        toast.error('Import completed with errors')
      }
    } catch (error) {
      toast.error('Failed to import categories')
      setImportResult({
        success: false,
        total: 0,
        imported: 0,
        errors: ['Failed to process import file'],
        warnings: []
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Replace with actual API call
      const response = await fetch('/api/categories/export', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `categories-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Categories exported successfully')
    } catch (error) {
      toast.error('Failed to export categories')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownloadTemplate = () => {
    const csvContent = `name_en,name_ar,name_fr,slug,description_en,description_ar,description_fr,parent_slug,display_order,is_active
"Electronics","إلكترونيات","Électronique","electronics","Electronic devices and accessories","الأجهزة الإلكترونية والإكسسوارات","Appareils électroniques et accessoires",,1,true
"Smartphones","هواتف ذكية","Smartphones","smartphones","Mobile phones and accessories","الهواتف المحمولة والإكسسوارات","Téléphones mobiles et accessoires","electronics",1,true
"Laptops","أجهزة كمبيوتر محمولة","Ordinateurs portables","laptops","Portable computers","أجهزة كمبيوتر محمولة","Ordinateurs portables","electronics",2,true`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'category-import-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast.success('Template downloaded')
  }

  const resetImport = () => {
    setSelectedFile(null)
    setImportResult(null)
    setImportProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import / Export Categories</DialogTitle>
          <DialogDescription>
            Import categories from CSV or export existing categories
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'import' | 'export')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            {/* Import Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">Import Instructions</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload a CSV file with category data</li>
                    <li>• File size limit: 5MB</li>
                    <li>• Required columns: name_en, name_ar, name_fr, slug</li>
                    <li>• Use parent_slug to create hierarchical categories</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">CSV Template</h4>
                  <p className="text-sm text-gray-600">Download a sample CSV file with the correct format</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <FileDown className="w-4 h-4 mr-2" />
                Download Template
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
                    <div>
                      <h4 className="font-medium text-green-900">{selectedFile.name}</h4>
                      <p className="text-sm text-green-700">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetImport}>
                      <X className="w-4 h-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <FileUp className="w-8 h-8 text-gray-400 mx-auto" />
                    <div>
                      <h4 className="font-medium text-gray-900">Choose CSV file</h4>
                      <p className="text-sm text-gray-600">or drag and drop it here</p>
                    </div>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Import Progress */}
            {isImporting && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Importing categories...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div className="space-y-3">
                <div className={`border rounded-lg p-4 ${
                  importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}>
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-2">
                      <h4 className={`font-medium ${
                        importResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        Import {importResult.success ? 'Completed' : 'Failed'}
                      </h4>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="outline">
                          Total: {importResult.total}
                        </Badge>
                        <Badge variant="outline">
                          Imported: {importResult.imported}
                        </Badge>
                        {importResult.errors.length > 0 && (
                          <Badge variant="destructive">
                            Errors: {importResult.errors.length}
                          </Badge>
                        )}
                        {importResult.warnings.length > 0 && (
                          <Badge variant="secondary">
                            Warnings: {importResult.warnings.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Errors and Warnings */}
                {(importResult.errors.length > 0 || importResult.warnings.length > 0) && (
                  <div className="space-y-2">
                    {importResult.errors.length > 0 && (
                      <div className="border border-red-200 rounded-lg p-3">
                        <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
                        <ul className="text-sm text-red-800 space-y-1">
                          {importResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {importResult.warnings.length > 0 && (
                      <div className="border border-yellow-200 rounded-lg p-3">
                        <h5 className="font-medium text-yellow-900 mb-2">Warnings:</h5>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {importResult.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Import Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
              >
                {isImporting ? (
                  <>Importing...</>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Categories
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {/* Export Options */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Download className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-green-900">Export Categories</h4>
                  <p className="text-sm text-green-800">
                    Download all categories as a CSV file. The exported file includes all category data
                    and can be used for backup or importing into other systems.
                  </p>
                </div>
              </div>
            </div>

            {/* Export Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 border rounded-lg bg-gray-50">
                <h5 className="font-medium text-gray-900 mb-1">Included Data</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-language names</li>
                  <li>• Descriptions and metadata</li>
                  <li>• Hierarchical structure</li>
                  <li>• Display order and status</li>
                </ul>
              </div>
              <div className="p-3 border rounded-lg bg-gray-50">
                <h5 className="font-medium text-gray-900 mb-1">File Format</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• CSV format</li>
                  <li>• UTF-8 encoding</li>
                  <li>• Compatible with Excel</li>
                  <li>• Ready for re-import</li>
                </ul>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>Exporting...</>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Categories
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
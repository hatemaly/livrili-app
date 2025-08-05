'use client'

import { useState } from 'react'
import { Button, Modal } from '@livrili/ui'
import { Upload, Download, FileText, Table } from 'lucide-react'
import { api } from '@/lib/trpc'

interface ImportExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function ImportExportDialog({ isOpen, onClose, onRefresh }: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportOptions, setExportOptions] = useState({
    format: 'csv' as 'csv' | 'xlsx',
    includeVariants: true,
    includeImages: false,
    includeInactive: false,
  })

  const importMutation = api.products.import.useMutation({
    onSuccess: (result) => {
      alert(`Import completed! ${result.imported} products imported.${result.errors.length > 0 ? ` ${result.errors.length} errors occurred.` : ''}`)
      onRefresh()
      setImportFile(null)
    },
  })

  const exportMutation = api.products.export.useMutation({
    onSuccess: (data) => {
      // Create download link
      const blob = new Blob([data.content], { type: data.mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  const handleImport = async () => {
    if (!importFile) return

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      // Convert file to base64 for API call
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target?.result) {
          const base64 = (e.target.result as string).split(',')[1]
          await importMutation.mutateAsync({
            data: base64,
            filename: importFile.name,
            options: {
              updateExisting: true,
              validateData: true,
            },
          })
        }
      }
      reader.readAsDataURL(importFile)
    } catch (error) {
      console.error('Import error:', error)
    }
  }

  const handleExport = async () => {
    await exportMutation.mutateAsync({
      format: exportOptions.format,
      includeVariants: exportOptions.includeVariants,
      includeImages: exportOptions.includeImages,
      includeInactive: exportOptions.includeInactive,
    })
  }

  const downloadTemplate = () => {
    // Generate CSV template
    const headers = [
      'sku',
      'barcode',
      'category_id',
      'name_en',
      'name_ar',
      'name_fr',
      'description_en',
      'description_ar',
      'description_fr',
      'base_price',
      'cost_price',
      'tax_rate',
      'stock_quantity',
      'min_stock_level',
      'unit',
      'weight',
      'is_active'
    ]
    
    const csvContent = headers.join(',') + '\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_import_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import/Export Products"
      size="lg"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="inline h-4 w-4 mr-1" />
            Import
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Download className="inline h-4 w-4 mr-1" />
            Export
          </button>
        </div>

        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Import Products</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload a CSV or Excel file to import products. Make sure your file follows the required format.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {importFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Important Notes:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• SKU is required and must be unique</li>
                <li>• Names in English, Arabic, and French are required</li>
                <li>• Prices must be positive numbers</li>
                <li>• Stock quantities must be non-negative integers</li>
                <li>• Existing products with same SKU will be updated</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Template
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || importMutation.isPending}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {importMutation.isPending ? 'Importing...' : 'Import Products'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Export Products</h3>
              <p className="text-sm text-gray-600 mb-4">
                Export your product catalog to CSV or Excel format.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportOptions.format === 'csv'}
                      onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as 'csv' })}
                      className="mr-2"
                    />
                    <FileText className="h-4 w-4 mr-1" />
                    CSV
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="xlsx"
                      checked={exportOptions.format === 'xlsx'}
                      onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value as 'xlsx' })}
                      className="mr-2"
                    />
                    <Table className="h-4 w-4 mr-1" />
                    Excel
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeVariants}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeVariants: e.target.checked })}
                      className="mr-2"
                    />
                    Include product variants
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeImages}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeImages: e.target.checked })}
                      className="mr-2"
                    />
                    Include image URLs
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeInactive}
                      onChange={(e) => setExportOptions({ ...exportOptions, includeInactive: e.target.checked })}
                      className="mr-2"
                    />
                    Include inactive products
                  </label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {exportMutation.isPending ? 'Exporting...' : 'Export Products'}
            </Button>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
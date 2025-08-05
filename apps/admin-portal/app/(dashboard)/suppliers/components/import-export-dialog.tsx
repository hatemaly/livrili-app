'use client'

import { useState } from 'react'
import { Modal, Button, Tabs, Card, Select, Input } from '@livrili/ui'
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface ImportExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

const exportFormats = [
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel (XLSX)' },
]

export function ImportExportDialog({ isOpen, onClose, onRefresh }: ImportExportDialogProps) {
  const [activeTab, setActiveTab] = useState('import')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importResult, setImportResult] = useState<any>(null)
  const [exportOptions, setExportOptions] = useState({
    format: 'csv',
    include_performance: true,
    include_contacts: true,
    include_orders: false,
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!importFile) return

    setIsProcessing(true)
    
    // Simulate import process
    setTimeout(() => {
      setImportResult({
        success: true,
        imported: 15,
        updated: 3,
        errors: [
          { row: 2, field: 'email', message: 'Invalid email format' },
          { row: 7, field: 'phone', message: 'Phone number too short' },
        ]
      })
      setIsProcessing(false)
      onRefresh()
    }, 2000)
  }

  const handleExport = async () => {
    setIsProcessing(true)
    
    // Simulate export process
    setTimeout(() => {
      // In real implementation, this would trigger a download
      const filename = `suppliers_export_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
      console.log('Exporting to:', filename)
      setIsProcessing(false)
    }, 1000)
  }

  const downloadTemplate = () => {
    // In real implementation, this would download a template file
    console.log('Downloading supplier import template')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import/Export Suppliers"
      size="lg"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="grid w-full grid-cols-2">
          <Tabs.Trigger value="import" className="flex items-center gap-2">
            <ArrowUpTrayIcon className="w-4 h-4" />
            Import
          </Tabs.Trigger>
          <Tabs.Trigger value="export" className="flex items-center gap-2">
            <ArrowDownTrayIcon className="w-4 h-4" />
            Export
          </Tabs.Trigger>
        </Tabs.List>

        {/* Import Tab */}
        <Tabs.Content value="import" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Import Suppliers</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV or Excel File
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {importFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {importFile.name} ({Math.round(importFile.size / 1024)}KB)
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex">
                  <DocumentTextIcon className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      Don't have a template? 
                      <button 
                        onClick={downloadTemplate}
                        className="ml-1 font-medium underline hover:no-underline"
                      >
                        Download the import template
                      </button>
                    </p>
                  </div>
                </div>
              </div>

              {importResult && (
                <Card className="p-4">
                  <div className="flex items-start gap-3">
                    {importResult.success ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        Import {importResult.success ? 'Completed' : 'Failed'}
                      </h4>
                      {importResult.success && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>• {importResult.imported} suppliers imported</p>
                          <p>• {importResult.updated} suppliers updated</p>
                        </div>
                      )}
                      {importResult.errors && importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-red-800">Errors:</h5>
                          <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                            {importResult.errors.map((error: any, index: number) => (
                              <li key={index}>
                                Row {error.row}: {error.field} - {error.message}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={handleImport}
                  disabled={!importFile || isProcessing}
                >
                  {isProcessing ? 'Importing...' : 'Import Suppliers'}
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Content>

        {/* Export Tab */}
        <Tabs.Content value="export" className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-medium mb-4">Export Suppliers</h3>
            
            <div className="space-y-4">
              <div>
                <Select
                  label="Export Format"
                  value={exportOptions.format}
                  onValueChange={(value) => setExportOptions(prev => ({ ...prev, format: value }))}
                  options={exportFormats}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Include Additional Data
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.include_performance}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        include_performance: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Performance metrics (ratings, delivery rates)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.include_contacts}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        include_contacts: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Contact information (phone, email, address)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.include_orders}
                      onChange={(e) => setExportOptions(prev => ({ 
                        ...prev, 
                        include_orders: e.target.checked 
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Order history summary
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleExport}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Exporting...' : 'Export Suppliers'}
                </Button>
              </div>
            </div>
          </Card>
        </Tabs.Content>
      </Tabs>
    </Modal>
  )
}
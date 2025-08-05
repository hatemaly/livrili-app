'use client'

import { useState } from 'react'
import { Upload, Download, FileText, AlertCircle } from 'lucide-react'
import { Button, Modal, Textarea } from '@livrili/ui'
import { api } from '@/lib/trpc'

interface TagImportExportProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function TagImportExport({ isOpen, onClose, onRefresh }: TagImportExportProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [importData, setImportData] = useState('')
  const [importResults, setImportResults] = useState<any>(null)

  const bulkImportMutation = api.tags.bulkImport.useMutation({
    onSuccess: (results) => {
      setImportResults(results)
      if (results.created > 0) {
        onRefresh()
      }
    },
  })

  const { data: exportData, refetch: exportTags } = api.tags.export.useQuery(
    { format: 'json', includeAnalytics: false },
    { enabled: false }
  )

  const handleImport = async () => {
    try {
      const tags = JSON.parse(importData)
      if (!Array.isArray(tags)) {
        throw new Error('Import data must be an array of tags')
      }

      await bulkImportMutation.mutateAsync({
        tags: tags.map(tag => ({
          name: tag.name,
          color: tag.color || '#6366F1',
          description: tag.description,
        })),
        skipExisting: true,
      })
    } catch (error) {
      console.error('Import failed:', error)
      setImportResults({
        created: 0,
        skipped: 0,
        errors: ['Invalid JSON format or structure'],
      })
    }
  }

  const handleExport = async () => {
    try {
      await exportTags()
      if (exportData) {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tags-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const sampleData = [
    {
      name: 'Premium Quality',
      color: '#EF4444',
      description: 'High-quality premium products',
    },
    {
      name: 'Fast Moving',
      color: '#10B981',
      description: 'Products with high turnover rate',
    },
    {
      name: 'Seasonal',
      color: '#F59E0B',
      description: 'Seasonal products',
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import/Export Tags" size="xl">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('import')}
          >
            <Upload className="w-4 h-4 inline-block mr-2" />
            Import
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('export')}
          >
            <Download className="w-4 h-4 inline-block mr-2" />
            Export
          </button>
        </div>

        {activeTab === 'import' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON Data
              </label>
              <Textarea
                value={importData}
                onChange={setImportData}
                rows={10}
                placeholder="Paste your JSON data here..."
                className="font-mono text-sm"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-blue-400 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Expected Format
                  </h4>
                  <pre className="mt-2 text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(sampleData, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {importResults && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-800 mb-2">
                  Import Results
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="text-green-600">
                    ✓ Created: {importResults.created} tags
                  </div>
                  <div className="text-yellow-600">
                    ⚠ Skipped: {importResults.skipped} tags
                  </div>
                  {importResults.errors.length > 0 && (
                    <div className="text-red-600">
                      <div className="flex items-start mt-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 mr-2" />
                        <div>
                          Errors:
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {importResults.errors.map((error: string, index: number) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importData.trim() || bulkImportMutation.isPending}
              >
                {bulkImportMutation.isPending ? 'Importing...' : 'Import Tags'}
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Download className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Export Tags
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Download all tags as a JSON file for backup or migration.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                Export Tags
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
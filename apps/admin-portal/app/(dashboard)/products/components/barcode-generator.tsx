'use client'

import { useState } from 'react'
import { Button } from '@livrili/ui'
import { QrCode, Sparkles } from 'lucide-react'

interface BarcodeGeneratorProps {
  value: string
  onChange: (barcode: string) => void
  onGenerate: () => void
}

export function BarcodeGenerator({ value, onChange, onGenerate }: BarcodeGeneratorProps) {
  const [showPreview, setShowPreview] = useState(false)

  const validateBarcode = (barcode: string) => {
    // Basic EAN-13 validation
    if (barcode.length === 13 && /^\d+$/.test(barcode)) {
      // Calculate check digit
      let sum = 0
      for (let i = 0; i < 12; i++) {
        const digit = parseInt(barcode[i])
        sum += i % 2 === 0 ? digit : digit * 3
      }
      const checkDigit = (10 - (sum % 10)) % 10
      return parseInt(barcode[12]) === checkDigit
    }
    return barcode.length === 0 || /^\d+$/.test(barcode)
  }

  const isValid = validateBarcode(value)

  const generateEAN13Checksum = (code: string) => {
    if (code.length !== 12) return code
    
    let sum = 0
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(code[i])
      sum += i % 2 === 0 ? digit : digit * 3
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return code + checkDigit
  }

  const formatBarcode = (barcode: string) => {
    if (barcode.length === 13) {
      return `${barcode.substring(0, 1)} ${barcode.substring(1, 7)} ${barcode.substring(7, 13)}`
    }
    return barcode
  }

  return (
    <div className="space-y-2">
      <div className="flex rounded-md shadow-sm">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter or generate barcode"
          className={`flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring-primary sm:text-sm ${
            value && !isValid ? 'border-red-300 text-red-900 placeholder-red-300' : ''
          }`}
          maxLength={13}
        />
        <Button
          type="button"
          variant="outline"
          onClick={onGenerate}
          className="rounded-none border-l-0"
          title="Generate EAN-13 barcode"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="rounded-none rounded-r-md border-l-0"
          title="Preview barcode"
          disabled={!value || !isValid}
        >
          <QrCode className="h-4 w-4" />
        </Button>
      </div>

      {value && !isValid && (
        <p className="text-sm text-red-600">
          {value.length === 13 
            ? 'Invalid barcode checksum' 
            : 'Barcode must contain only numbers'
          }
        </p>
      )}

      {value && isValid && value.length === 13 && (
        <p className="text-sm text-green-600">
          Valid EAN-13 barcode: {formatBarcode(value)}
        </p>
      )}

      {showPreview && value && isValid && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="text-center">
            <div className="inline-block bg-white p-4 border border-gray-300 rounded">
              {/* Simple barcode visualization */}
              <div className="flex items-end justify-center space-x-px h-16 mb-2">
                {value.split('').map((digit, index) => {
                  const height = 40 + (parseInt(digit) * 2)
                  return (
                    <div
                      key={index}
                      className="bg-black"
                      style={{
                        width: '2px',
                        height: `${height}px`,
                      }}
                    />
                  )
                })}
              </div>
              <div className="text-xs font-mono text-center">
                {formatBarcode(value)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Barcode preview (simplified visualization)
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p><strong>Barcode formats supported:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>EAN-13: 13-digit barcode with checksum validation</li>
          <li>Custom: Any numeric barcode for internal use</li>
        </ul>
      </div>
    </div>
  )
}
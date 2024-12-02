"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchAirtableData, updateAirtableRecord } from "@/utils/airtable"
import { logger } from "@/utils/logger"
import { certificateTemplates } from "@/utils/certificateTemplates"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

export default function CertificateGenerator() {
  const [baseId, setBaseId] = useState("")
  const [tableName, setTableName] = useState("")
  const [templateId, setTemplateId] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const validateInputs = () => {
    if (!baseId) {
      setError("Airtable Base ID is required")
      return false
    }
    if (!tableName) {
      setError("Airtable Table Name is required")
      return false
    }
    // Remove any file extensions from table name
    if (tableName.includes('.')) {
      const cleanTableName = tableName.split('.')[0]
      setTableName(cleanTableName)
      logger.warning('Removed file extension from table name', { 
        original: tableName, 
        cleaned: cleanTableName 
      })
    }
    if (!templateId) {
      setError("Certificate Template is required")
      return false
    }
    return true
  }

  const generateCertificates = async () => {
    setError(null)
    setSuccess(null)

    if (!validateInputs()) return

    setGenerating(true)
    try {
      logger.info('Starting certificate generation', { 
        baseId, 
        tableName,
        templateId 
      })

      const data = await fetchAirtableData(baseId, tableName)
      if (!data.records || data.records.length === 0) {
        throw new Error('No records found in the table')
      }
      
      // Log the structure of the first record to debug field names
      logger.info('First record structure', {
        recordId: data.records[0].id,
        fields: data.records[0].fields,
        availableFields: Object.keys(data.records[0].fields)
      })

      const template = certificateTemplates.find(t => t.id === templateId)
      if (!template) {
        throw new Error("Selected template not found")
      }

      let successCount = 0
      for (const record of data.records) {
        // Log each record's fields before processing
        logger.info('Processing record', {
          recordId: record.id,
          fields: record.fields,
          fieldNames: Object.keys(record.fields)
        })

        const name = record.fields.Name || record.fields.name || record.fields.NAME
        const course = record.fields.Course || record.fields.course || record.fields.COURSE

        if (!name || !course) {
          logger.warning('Skipping record due to missing data', { 
            recordId: record.id,
            fields: record.fields,
            hasName: !!name,
            hasCourse: !!course,
            availableFields: Object.keys(record.fields)
          })
          continue
        }

        const certificateHtml = template.html
          .replace(/{{name}}/g, name)
          .replace(/{{course}}/g, course)
          .replace(/{{date}}/g, new Date().toLocaleDateString())

        try {
          logger.info('Attempting to update record', {
            recordId: record.id,
            name,
            course,
            htmlLength: certificateHtml.length
          })

          await updateAirtableRecord(baseId, tableName, record.id, {
            html: certificateHtml,
            certificate_generated_at: new Date().toISOString()
          })
          
          logger.info('Updated certificate HTML', { 
            recordId: record.id,
            name,
            course
          })
          successCount++
        } catch (error) {
          logger.error('Failed to update certificate HTML', {
            recordId: record.id,
            name,
            course,
            error: error instanceof Error ? error.message : error
          })
        }
      }

      if (successCount > 0) {
        setSuccess(`Successfully generated HTML for ${successCount} out of ${data.records.length} certificates!`)
      } else {
        throw new Error('Failed to generate any certificate HTML. Check the logs for details.')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      logger.error('Failed to generate certificates', { 
        error: errorMessage,
        baseId,
        tableName,
        templateId
      })
      setError(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Generate Certificates</h2>
      <Input
        placeholder="Airtable Base ID"
        value={baseId}
        onChange={(e) => setBaseId(e.target.value)}
      />
      <Input
        placeholder="Airtable Table Name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <Select value={templateId} onValueChange={setTemplateId}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          {certificateTemplates.map((template) => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={generateCertificates} disabled={generating}>
        {generating ? 'Generating...' : 'Generate Certificates'}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

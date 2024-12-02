"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { storage } from "@/utils/storage"
import { logger } from "@/utils/logger"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Settings() {
  const [airtableToken, setAirtableToken] = useState("")
  const [validating, setValidating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await storage.get("airtableToken")
      if (storedToken) {
        setAirtableToken(storedToken)
      }
    }
    loadToken()
  }, [])

  const validateToken = async () => {
    if (!airtableToken.trim()) {
      setError("Please enter an Airtable API token")
      return
    }

    setValidating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to validate token')
      }

      const data = await response.json()
      logger.info('Airtable token validated successfully', {
        basesCount: data.bases?.length || 0
      })
      
      setSuccess("Token is valid and has access to your Airtable bases!")
      await storage.set("airtableToken", airtableToken)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate token'
      logger.error('Token validation failed', { error })
      setError(message)
    } finally {
      setValidating(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Settings</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Airtable API Token"
            value={airtableToken}
            onChange={(e) => setAirtableToken(e.target.value)}
          />
          <Button onClick={validateToken} disabled={validating}>
            {validating ? 'Validating...' : 'Validate & Save Token'}
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <h3 className="font-semibold">How to get your Airtable API token:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to your <a href="https://airtable.com/account" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Airtable account page</a></li>
            <li>Under "API" section, click "Generate API key"</li>
            <li>Copy the generated token and paste it here</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

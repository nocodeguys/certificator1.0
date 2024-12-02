import { storage } from './storage'
import { logger } from './logger'

const AIRTABLE_API_URL = 'https://api.airtable.com/v0'

async function getAirtableToken() {
  return await storage.get('airtableToken')
}

export async function airtableRequest(method: string, baseId: string, tableName: string, data?: any) {
  const token = await getAirtableToken()
  if (!token) {
    throw new Error('Airtable token not found')
  }

  // Remove any file extensions from table name
  const cleanTableName = tableName.includes('.') ? tableName.split('.')[0] : tableName

  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${cleanTableName}`,
    {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    }
  )

  const responseData = await response.json()

  if (!response.ok) {
    logger.error('Airtable API request failed', {
      method,
      baseId,
      tableName: cleanTableName,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData: responseData,
      requestData: data
    })
    throw new Error(responseData.error?.message || `Airtable API request failed: ${response.status} ${response.statusText}`)
  }

  logger.info('Airtable API request successful', {
    method,
    baseId,
    tableName: cleanTableName,
    recordCount: responseData.records?.length
  })

  return responseData
}

export async function fetchAirtableData(baseId: string, tableName: string) {
  return airtableRequest('GET', baseId, tableName)
}

export async function createAirtableRecord(baseId: string, tableName: string, data: any) {
  return airtableRequest('POST', baseId, tableName, { fields: data })
}

export const updateAirtableRecord = async (baseId: string, tableName: string, recordId: string, fields: any) => {
  const token = await storage.get('airtableToken')
  const response = await fetch(
    `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    logger.error('Airtable API request failed', {
      method: 'PATCH',
      baseId,
      tableName,
      recordId,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData,
      requestData: { fields }
    })
    throw new Error(errorData.error?.message || 'Failed to update record')
  }

  logger.info('Airtable API request successful', {
    method: 'PATCH',
    baseId,
    tableName,
    recordId
  })

  return await response.json()
}

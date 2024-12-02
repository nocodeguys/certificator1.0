import { storage } from './storage'

export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  message: string
  details?: any
}

export async function log(level: LogLevel, message: string, details?: any) {
  const newLog: LogEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  }

  const logs = await storage.get('logs') || []
  const updatedLogs = [...logs, newLog].slice(-100) // Keep only the last 100 logs
  await storage.set('logs', updatedLogs)

  console.log(`[${level}] ${message}`, details)
}

export const logger = {
  info: (message: string, details?: any) => log(LogLevel.INFO, message, details),
  warning: (message: string, details?: any) => log(LogLevel.WARNING, message, details),
  error: (message: string, details?: any) => log(LogLevel.ERROR, message, details),
}


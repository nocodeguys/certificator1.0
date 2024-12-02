"use client"

import { useState, useEffect } from "react"
import { storage } from "@/utils/storage"
import { LogEntry, LogLevel } from "@/utils/logger"

export default function Logs() {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const loadLogs = async () => {
      const storedLogs = await storage.get("logs") || []
      setLogs([...storedLogs].reverse()) // Show newest first
    }
    
    // Load logs immediately
    loadLogs()
    
    // Refresh logs every 2 seconds
    const interval = setInterval(loadLogs, 2000)
    
    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [])

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case LogLevel.INFO:
        return "text-blue-600"
      case LogLevel.WARNING:
        return "text-yellow-600"
      case LogLevel.ERROR:
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Logs</h2>
      {logs.length === 0 ? (
        <p className="text-gray-500">No logs available</p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => (
            <li key={log.id} className="border-b pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{new Date(log.timestamp).toLocaleString()}</span>
                <span className={`font-semibold ${getLevelColor(log.level)}`}>{log.level}</span>
              </div>
              <div>{log.message}</div>
              {log.details && (
                <pre className="text-sm bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

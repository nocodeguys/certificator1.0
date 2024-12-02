const isDevelopment = process.env.NODE_ENV === 'development'
const isServer = typeof window === 'undefined'

class Storage {
  private kv: any

  constructor() {
    if (!isDevelopment && !isServer) {
      // Initialize Vercel KV in production (client-side)
      this.kv = require('@vercel/kv')
    }
  }

  async get(key: string): Promise<any> {
    if (isDevelopment) {
      if (isServer) {
        // Server-side development: return null (data will be handled client-side)
        return null
      } else {
        // Client-side development: use localStorage
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      }
    } else {
      if (isServer) {
        // Server-side production: use Vercel KV
        const { kv } = await import('@vercel/kv')
        return await kv.get(key)
      } else {
        // Client-side production: use Vercel KV
        return await this.kv.get(key)
      }
    }
  }

  async set(key: string, value: any): Promise<void> {
    if (isDevelopment) {
      if (!isServer) {
        // Client-side development: use localStorage
        localStorage.setItem(key, JSON.stringify(value))
      }
    } else {
      if (isServer) {
        // Server-side production: use Vercel KV
        const { kv } = await import('@vercel/kv')
        await kv.set(key, value)
      } else {
        // Client-side production: use Vercel KV
        await this.kv.set(key, value)
      }
    }
  }

  async delete(key: string): Promise<void> {
    if (isDevelopment) {
      if (!isServer) {
        // Client-side development: use localStorage
        localStorage.removeItem(key)
      }
    } else {
      if (isServer) {
        // Server-side production: use Vercel KV
        const { kv } = await import('@vercel/kv')
        await kv.del(key)
      } else {
        // Client-side production: use Vercel KV
        await this.kv.del(key)
      }
    }
  }
}

export const storage = new Storage()


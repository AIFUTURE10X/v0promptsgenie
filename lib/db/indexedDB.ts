// IndexedDB helper for local caching of favorites
const DB_NAME = 'ImageStudioDB'
const DB_VERSION = 1
const FAVORITES_STORE = 'favorites'

interface CachedFavorite {
  id: string
  imageUrl: string
  blob?: Blob
  timestamp: number
  metadata?: any
}

class IndexedDBHelper {
  private db: IDBDatabase | null = null

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        if (!db.objectStoreNames.contains(FAVORITES_STORE)) {
          const store = db.createObjectStore(FAVORITES_STORE, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async cacheFavorite(favorite: CachedFavorite): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FAVORITES_STORE], 'readwrite')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.put(favorite)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getCachedFavorite(id: string): Promise<CachedFavorite | null> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FAVORITES_STORE], 'readonly')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllCachedFavorites(): Promise<CachedFavorite[]> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FAVORITES_STORE], 'readonly')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async deleteCachedFavorite(id: string): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FAVORITES_STORE], 'readwrite')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearAllFavorites(): Promise<void> {
    const db = await this.init()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([FAVORITES_STORE], 'readwrite')
      const store = transaction.objectStore(FAVORITES_STORE)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const indexedDBHelper = new IndexedDBHelper()

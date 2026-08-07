/**
 * Wrapper mínimo de IndexedDB para as imagens (foto, capas, grid, fixados).
 * localStorage estoura com imagem; aqui elas sobrevivem ao F5 sem limite curto.
 */
const DB = 'construtor-perfil'
const STORE = 'imagens'

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function salvarImagem(id: string, dataUrl: string): Promise<void> {
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(dataUrl, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function removerImagem(id: string): Promise<void> {
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function lerTodasImagens(): Promise<Record<string, string>> {
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const store = tx.objectStore(STORE)
    const chaves = store.getAllKeys()
    const valores = store.getAll()
    tx.oncomplete = () => {
      const mapa: Record<string, string> = {}
      chaves.result.forEach((k, i) => {
        mapa[String(k)] = valores.result[i] as string
      })
      resolve(mapa)
    }
    tx.onerror = () => reject(tx.error)
  })
}

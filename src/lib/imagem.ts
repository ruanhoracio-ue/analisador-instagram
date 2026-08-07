/** Lê um File de upload e devolve um dataURL JPEG redimensionado. */
export function arquivoParaDataUrl(file: File, ladoMax = 640): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const escala = Math.min(1, ladoMax / Math.max(img.width, img.height))
      const w = Math.round(img.width * escala)
      const h = Math.round(img.height * escala)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('canvas indisponível'))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('imagem inválida'))
    }
    img.src = url
  })
}

/**
 * Enquadramento da foto de perfil. `zoom` 1 = a imagem cobre o círculo pelo
 * lado menor; ox/oy deslocam o centro, em pixels do quadro exibido na tela
 * (por isso `quadro` viaja junto: é a escala em que ox/oy foram medidos).
 */
export interface Recorte {
  zoom: number
  ox: number
  oy: number
  quadro: number
}

export const RECORTE_PADRAO: Recorte = { zoom: 1, ox: 0, oy: 0, quadro: 280 }

/** dimensões da imagem dentro do quadro, para um dado recorte */
export function geometria(nw: number, nh: number, r: Recorte) {
  const base = Math.max(r.quadro / nw, r.quadro / nh) // "cover"
  const escala = base * r.zoom
  const dw = nw * escala
  const dh = nh * escala
  // limites que mantêm o quadro sempre coberto pela imagem
  const maxOx = Math.max(0, (dw - r.quadro) / 2)
  const maxOy = Math.max(0, (dh - r.quadro) / 2)
  return { escala, dw, dh, maxOx, maxOy }
}

/** prende ox/oy dentro dos limites — a imagem nunca deixa buraco no círculo */
export function limitarRecorte(nw: number, nh: number, r: Recorte): Recorte {
  const { maxOx, maxOy } = geometria(nw, nh, r)
  return {
    ...r,
    ox: Math.max(-maxOx, Math.min(maxOx, r.ox)),
    oy: Math.max(-maxOy, Math.min(maxOy, r.oy)),
  }
}

/** aplica o recorte e devolve um dataURL quadrado, pronto pro círculo */
export function recortarParaDataUrl(src: string, r: Recorte, saida = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { escala, dw, dh } = geometria(img.width, img.height, r)
      // canto superior esquerdo da imagem, em coordenadas do quadro
      const left = r.quadro / 2 + r.ox - dw / 2
      const top = r.quadro / 2 + r.oy - dh / 2
      // região da imagem original que aparece dentro do quadro
      const sx = -left / escala
      const sy = -top / escala
      const s = r.quadro / escala

      const canvas = document.createElement('canvas')
      canvas.width = saida
      canvas.height = saida
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('canvas indisponível'))
        return
      }
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, sx, sy, s, s, 0, 0, saida, saida)
      resolve(canvas.toDataURL('image/jpeg', 0.9))
    }
    img.onerror = () => reject(new Error('imagem inválida'))
    img.src = src
  })
}

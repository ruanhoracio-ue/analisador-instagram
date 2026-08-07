'use client'
/**
 * Recorte da foto de perfil: arrasta pra reposicionar, slider pra aproximar.
 * O círculo de 40px ao lado atualiza junto — é o teste que a regra cobra,
 * feito no mesmo lugar onde a decisão está sendo tomada.
 */
import { useEffect, useRef, useState } from 'react'
import { geometria, limitarRecorte, RECORTE_PADRAO, type Recorte } from '@/lib/imagem'

const QUADRO = 280

export function EditorDeFoto({
  original,
  recorteInicial,
  onConfirmar,
  onCancelar,
}: {
  original: string
  recorteInicial?: Recorte | null
  onConfirmar: (r: Recorte) => void
  onCancelar: () => void
}) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [recorte, setRecorte] = useState<Recorte>({
    ...(recorteInicial ?? RECORTE_PADRAO),
    quadro: QUADRO,
  })
  const arrasto = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => setNatural({ w: img.width, h: img.height })
    img.src = original
  }, [original])

  const atualizar = (parcial: Partial<Recorte>) => {
    setRecorte((r) => {
      const bruto = { ...r, ...parcial }
      return natural ? limitarRecorte(natural.w, natural.h, bruto) : bruto
    })
  }

  const geo = natural ? geometria(natural.w, natural.h, recorte) : null

  /** estilo da imagem dentro de um quadro de tamanho `lado` (escala junto) */
  const estiloImagem = (lado: number): React.CSSProperties => {
    if (!geo) return {}
    const k = lado / QUADRO
    return {
      position: 'absolute',
      width: geo.dw * k,
      height: geo.dh * k,
      left: lado / 2 + recorte.ox * k - (geo.dw * k) / 2,
      top: lado / 2 + recorte.oy * k - (geo.dh * k) / 2,
      maxWidth: 'none',
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="ds-card w-full max-w-lg p-6">
        <h3 className="text-heading-sm">Enquadrar a foto</h3>
        <p className="mt-0.5 text-caption text-mute">
          Arraste para reposicionar e use o controle para aproximar. Confira no círculo de 40px —
          é o tamanho real no feed e no direct.
        </p>

        <div className="mt-5 flex items-center justify-center gap-6">
          {/* quadro de recorte */}
          <div
            className="relative shrink-0 cursor-grab overflow-hidden rounded-full bg-elevated active:cursor-grabbing"
            style={{ width: QUADRO, height: QUADRO, touchAction: 'none' }}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              arrasto.current = { x: e.clientX, y: e.clientY, ox: recorte.ox, oy: recorte.oy }
            }}
            onPointerMove={(e) => {
              const a = arrasto.current
              if (!a) return
              atualizar({ ox: a.ox + (e.clientX - a.x), oy: a.oy + (e.clientY - a.y) })
            }}
            onPointerUp={() => {
              arrasto.current = null
            }}
            onPointerCancel={() => {
              arrasto.current = null
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={original} alt="" draggable={false} style={estiloImagem(QUADRO)} />
            <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-ink/10" />
          </div>

          {/* conferências de tamanho real */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="relative overflow-hidden rounded-full bg-elevated" style={{ width: 77, height: 77 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={original} alt="" draggable={false} style={estiloImagem(77)} />
              </div>
              <span className="text-caption text-faint">no perfil</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="relative overflow-hidden rounded-full bg-elevated" style={{ width: 40, height: 40 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={original} alt="" draggable={false} style={estiloImagem(40)} />
              </div>
              <span className="text-caption text-faint">40px</span>
            </div>
          </div>
        </div>

        {/* zoom */}
        <div className="mt-5 flex items-center gap-3">
          <span className="text-caption text-faint">−</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={recorte.zoom}
            onChange={(e) => atualizar({ zoom: Number(e.target.value) })}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-elevated accent-emerald-600"
          />
          <span className="text-caption text-faint">+</span>
          <button
            onClick={() => atualizar({ ...RECORTE_PADRAO, quadro: QUADRO })}
            className="ml-1 text-caption text-mute underline-offset-2 hover:text-ink hover:underline"
          >
            centralizar
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancelar} className="ds-btn-secondary px-5 py-2 text-label-md">
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(recorte)}
            disabled={!natural}
            className="shiny-cta px-6 py-2 text-label-md disabled:opacity-40"
          >
            <span className="shiny-dots" aria-hidden="true" />
            <span className="shiny-cta-content">Usar esta foto</span>
          </button>
        </div>
      </div>
    </div>
  )
}

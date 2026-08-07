'use client'
/**
 * Preview fiel do perfil (formato mobile, tema claro do app do Instagram).
 * Fidelidade é o valor: foto circular, bio truncada na 1ª linha antes do
 * "mais", 4 destaques visíveis sem rolar, miniaturas em tamanho real.
 * Layout reproduzido com elementos genéricos — sem logo nem ícones da marca.
 */
import { tamanho, primeiraLinha } from '@/engine/texto'

export interface PreviewProps {
  foto?: string
  nome: string
  usuario: string
  bio: string
  link: string
  ctaBotao: string
  destaques: { nome: string; capa?: string }[]
  /** 9 dataURLs (ou undefined) — as primeiras 9 miniaturas */
  grid: (string | undefined)[]
  /** quais das 3 primeiras células têm post fixado planejado */
  pinos?: boolean[]
  /** mostra o círculo de conferência de 40px ao lado do avatar */
  mostrarMini?: boolean
  rotulo?: string
}

function Avatar({ src, size }: { src?: string; size: number }) {
  return (
    <div
      className="shrink-0 overflow-hidden rounded-full bg-neutral-100 ring-1 ring-neutral-200"
      style={{ width: size, height: size }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-full w-full text-neutral-300" fill="currentColor">
          <circle cx="12" cy="9" r="4" />
          <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
        </svg>
      )}
    </div>
  )
}

export function PreviewInstagram({
  foto,
  nome,
  usuario,
  bio,
  link,
  ctaBotao,
  destaques,
  grid,
  pinos = [],
  mostrarMini = false,
  rotulo,
}: PreviewProps) {
  const bioCortada = [...bio].slice(0, 150).join('')
  const linha1 = primeiraLinha(bioCortada)
  const temMais = bioCortada.length > linha1.length
  const linkLimpo = link.replace(/^https?:\/\//, '').replace(/\/$/, '')

  return (
    <div className="w-[350px] select-none">
      {rotulo && (
        <div className="mb-2 text-eyebrow uppercase tracking-[0.06em] font-semibold text-mute">
          {rotulo}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-white text-[#000]">
        {/* barra do topo */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-[16px] font-semibold leading-none">
            {usuario ? usuario : 'seu_usuario'}
          </span>
          <div className="flex items-center gap-4 text-neutral-800">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
        </div>

        {/* cabeçalho: avatar + métricas */}
        <div className="flex items-center gap-6 px-4 py-2">
          <div className="relative">
            <Avatar src={foto} size={77} />
            {mostrarMini && (
              <div className="absolute -bottom-1 -right-9 flex flex-col items-center">
                <Avatar src={foto} size={40} />
                <span className="mt-0.5 text-[9px] leading-none text-neutral-400">40px</span>
              </div>
            )}
          </div>
          <div className={`flex flex-1 items-center justify-between text-center ${mostrarMini ? 'pl-8' : ''}`}>
            {[
              ['—', 'posts'],
              ['—', 'seguidores'],
              ['—', 'seguindo'],
            ].map(([n, l]) => (
              <div key={l} className="flex flex-col">
                <span className="text-[15px] font-semibold leading-tight">{n}</span>
                <span className="text-[12px] leading-tight text-neutral-700">{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* nome + bio truncada + link */}
        <div className="px-4 text-[13px] leading-[17px]">
          <div className="font-semibold">{nome || 'Seu Nome'}</div>
          {linha1 && (
            <div>
              <span>{linha1}</span>
              {temMais && <span className="text-neutral-400">… mais</span>}
            </div>
          )}
          {linkLimpo && (
            <div className="mt-0.5 flex items-center gap-1 font-medium text-[#00376B]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5" />
                <path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 19" />
              </svg>
              <span className="truncate">{linkLimpo}</span>
            </div>
          )}
        </div>

        {/* botões de ação */}
        <div className="flex gap-1.5 px-4 pt-3">
          <button className="h-8 flex-1 rounded-lg bg-[#0095f6] text-[13px] font-semibold text-white">
            Seguir
          </button>
          <button className="h-8 flex-1 rounded-lg bg-neutral-100 text-[13px] font-semibold text-neutral-900">
            <span className="block truncate px-1">{ctaBotao || 'Mensagem'}</span>
          </button>
          <button className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100 text-neutral-900">
            <svg className="mx-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* destaques — só 4 cabem sem rolar; o 5º aparece cortado de propósito */}
        <div className="mt-4 overflow-hidden">
          <div className="flex gap-3.5 px-4">
            {(destaques.length ? destaques : [{ nome: '' }, { nome: '' }, { nome: '' }, { nome: '' }]).map(
              (d, i) => (
                <div key={i} className="flex w-16 shrink-0 flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-200 bg-white p-[3px]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-neutral-100">
                      {d.capa && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={d.capa} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </div>
                  <span className="mt-1 w-16 truncate text-center text-[11px] leading-none">
                    {d.nome || `Destaque`}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* aba do grid */}
        <div className="mt-3 flex border-t border-neutral-200">
          <div className="flex flex-1 items-center justify-center border-b border-neutral-900 py-2.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <path d="M3 9.5h18M3 14.5h18M9.5 3v18M14.5 3v18" />
            </svg>
          </div>
          <div className="flex flex-1 items-center justify-center py-2.5 text-neutral-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="9" r="4" />
              <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
            </svg>
          </div>
        </div>

        {/* grid 3×3 — miniaturas em proporção real (4:5 vertical do feed atual) */}
        <div className="grid grid-cols-3 gap-[2px]">
          {Array.from({ length: 9 }, (_, i) => {
            const img = grid[i]
            const fixado = i < 3 && pinos[i]
            return (
              <div key={i} className="relative aspect-[3/4] bg-neutral-100">
                {img && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="h-full w-full object-cover" />
                )}
                {fixado && (
                  <div className="absolute right-1 top-1 rounded-full bg-black/45 p-1 text-white">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 3l7 7-4 1-3 6-2-2-5 5-1.5-1.5 5-5-2-2 6-3z" />
                    </svg>
                  </div>
                )}
                {!img && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-neutral-300">
                    {i + 1}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** contador ao vivo usado nos campos com limite (nome 30, bio 150) */
export function Contador({ valor, limite }: { valor: string; limite: number }) {
  const n = tamanho(valor)
  const estourou = n > limite
  return (
    <span className={`text-caption tabular-nums ${estourou ? 'font-semibold text-danger-deep' : 'text-faint'}`}>
      {n}/{limite}
    </span>
  )
}

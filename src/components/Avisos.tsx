'use client'
/**
 * Avisos do motor para um bloco: violações (auto) e self-checks.
 * Toda mensagem sai com o porquê junto — é a regra nº 1 do produto.
 */
import type { Regra, Severidade } from '@/engine/tipos'

const ESTILO: Record<Severidade, { borda: string; fundo: string; texto: string; selo: string }> = {
  critica: {
    borda: 'border-l-danger',
    fundo: 'bg-danger-soft/40',
    texto: 'text-danger-deep',
    selo: 'Crítico',
  },
  importante: {
    borda: 'border-l-warning',
    fundo: 'bg-warning-soft/40',
    texto: 'text-warning-deep',
    selo: 'Importante',
  },
  refino: {
    borda: 'border-l-info',
    fundo: 'bg-info-soft/40',
    texto: 'text-info-deep',
    selo: 'Refino',
  },
}

export function AvisoRegra({ regra }: { regra: Regra }) {
  const e = ESTILO[regra.severidade]
  return (
    <div className={`rounded-md border-l-2 ${e.borda} ${e.fundo} px-3 py-2`}>
      <div className="flex items-baseline gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-label ${e.texto}`}>{e.selo}</span>
        <span className="text-body-sm font-medium text-ink">{regra.mensagem}</span>
      </div>
      <p className="mt-0.5 text-caption text-mute">{regra.porque}</p>
    </div>
  )
}

export function SelfCheck({
  regra,
  confirmado,
  onAlternar,
}: {
  regra: Regra
  confirmado: boolean
  onAlternar: (id: string) => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 transition-colors ${
        confirmado ? 'border-emerald-200 bg-emerald-50/60' : 'border-hairline bg-surface hover:bg-elevated/60'
      }`}
    >
      <input
        type="checkbox"
        checked={confirmado}
        onChange={() => onAlternar(regra.id)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
      />
      <span>
        <span className={`text-body-sm font-medium ${confirmado ? 'text-emerald-deep' : 'text-ink'}`}>
          {regra.mensagem}
        </span>
        <span className="mt-0.5 block text-caption text-mute">{regra.porque}</span>
      </span>
    </label>
  )
}

export function AvisosDoBloco({
  violadas,
  checks,
  confirmados,
  onAlternar,
}: {
  violadas: Regra[]
  checks: Regra[]
  confirmados: ReadonlySet<string>
  onAlternar: (id: string) => void
}) {
  if (violadas.length === 0 && checks.length === 0) return null
  return (
    <div className="mt-3 space-y-1.5">
      {violadas.map((r) => (
        <AvisoRegra key={r.id} regra={r} />
      ))}
      {checks.map((r) => (
        <SelfCheck key={r.id} regra={r} confirmado={confirmados.has(r.id)} onAlternar={onAlternar} />
      ))}
    </div>
  )
}

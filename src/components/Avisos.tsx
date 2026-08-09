'use client'
/**
 * Avisos do motor para um bloco: violações (auto) e self-checks.
 * Toda mensagem sai com o porquê junto — é a regra nº 1 do produto.
 */
import type { Regra, Severidade } from '@/engine/tipos'

/** Como resolver + exemplo — a fórmula, nunca o texto pronto */
export function ComoResolver({ regra, tom = 'claro' }: { regra: Regra; tom?: 'claro' | 'escuro' }) {
  if (!regra.comoResolver) return null
  const borda = tom === 'escuro' ? 'border-emerald-300' : 'border-hairline-strong'
  return (
    <div className={`mt-2.5 rounded-md border-l-2 ${borda} bg-elevated/50 px-3 py-2`}>
      <p className="text-[10px] font-semibold uppercase tracking-label text-emerald-deep">
        Como resolver
      </p>
      <p className="mt-0.5 text-body-sm text-body">{regra.comoResolver}</p>
      {regra.exemplo && (
        <p className="mt-1.5 border-l border-hairline-strong pl-2 text-caption italic text-mute">
          {regra.exemplo}
        </p>
      )}
    </div>
  )
}

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

/** o trecho do perfil que disparou a regra — citado, vira espelho e não bronca */
export function TrechoCitado({ trecho }: { trecho?: string | null }) {
  if (!trecho) return null
  return (
    <p className="mt-1.5 w-fit max-w-full truncate rounded-sm bg-ink/[0.06] px-2 py-1 font-mono text-caption text-ink">
      «{trecho}»
    </p>
  )
}

export function AvisoRegra({ regra }: { regra: Regra & { trecho?: string | null } }) {
  const e = ESTILO[regra.severidade]
  return (
    <div className={`rounded-md border-l-2 ${e.borda} ${e.fundo} px-3 py-2`}>
      <div className="flex items-baseline gap-2">
        <span className={`text-[10px] font-semibold uppercase tracking-label ${e.texto}`}>{e.selo}</span>
        <span className="text-body-sm font-medium text-ink">{regra.mensagem}</span>
      </div>
      <TrechoCitado trecho={regra.trecho} />
      <p className="mt-0.5 text-caption text-mute">{regra.porque}</p>
      <ComoResolver regra={regra} />
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
        {!confirmado && regra.comoResolver && (
          <span className="mt-1.5 block border-l-2 border-hairline-strong pl-2 text-caption text-body">
            {regra.comoResolver}
          </span>
        )}
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

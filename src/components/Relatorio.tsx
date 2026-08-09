'use client'
/**
 * Relatório do diagnóstico: o que está errado, agrupado por gravidade, com o
 * porquê de cada item — a mesma linguagem do construtor, porque é o mesmo motor.
 */
import type { Avaliacao, Bloco, Regra } from '@/engine/tipos'
import { BLOCOS } from '@/engine/tipos'
import { ComoResolver, SelfCheck, TrechoCitado } from './Avisos'

export const NOME_BLOCO: Record<Bloco, string> = {
  foto: 'Foto',
  nome: 'Nome',
  usuario: 'Usuário',
  bio: 'Bio',
  link: 'Link & CTA',
  destaques: 'Destaques',
  grid: 'Grid',
  fixados: 'Fixados',
}

function corDaNota(n: number) {
  if (n >= 8) return 'text-success-deep'
  if (n >= 5) return 'text-warning-deep'
  return 'text-danger-deep'
}

function barraDaNota(n: number) {
  if (n >= 8) return 'bg-success'
  if (n >= 5) return 'bg-warning'
  return 'bg-danger'
}

export function NotasPorBloco({
  avaliacao,
  pendentes,
}: {
  avaliacao: Avaliacao
  pendentes: Regra[]
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {BLOCOS.map((b) => {
        const nota = avaliacao.notas[b]
        const problemas = avaliacao.violadas.filter((r) => r.bloco === b).length
        const aConferir = pendentes.filter((r) => r.bloco === b).length
        return (
          <div key={b} className="ds-card p-4">
            {/* rótulo em cima e número embaixo: nome comprido não empurra a nota */}
            <span className="block truncate text-label-md text-mute">{NOME_BLOCO[b]}</span>
            <span className={`mt-0.5 block text-heading-md tabular-nums ${corDaNota(nota)}`}>
              {nota}
            </span>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-elevated">
              <div className={`h-full rounded-full ${barraDaNota(nota)}`} style={{ width: `${nota * 10}%` }} />
            </div>
            <p className="mt-2 text-caption text-faint">
              {problemas > 0 && `${problemas} aviso${problemas > 1 ? 's' : ''}`}
              {problemas > 0 && aConferir > 0 && ' · '}
              {aConferir > 0 && `${aConferir} a conferir`}
              {problemas === 0 && aConferir === 0 && 'em dia'}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function ProximoPasso({
  regra,
  acao,
}: {
  regra: Regra | null
  acao?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-emerald-deep">
        Comece por aqui — uma mudança só
      </p>
      {regra ? (
        <>
          <p className="mt-2 text-heading-md text-ink">{regra.mensagem}</p>
          <TrechoCitado trecho={(regra as Regra & { trecho?: string | null }).trecho} />
          <p className="mt-1 text-body-md text-mute">{regra.porque}</p>
          <ComoResolver regra={regra} tom="escuro" />
          {acao && <div className="mt-4">{acao}</div>}
        </>
      ) : (
        <p className="mt-2 text-heading-md text-ink">
          Nada crítico em aberto — o perfil está coerente com o objetivo. 🎉
        </p>
      )}
    </div>
  )
}

/** O que já está certo — ensina o acerto, não só o erro */
export function PontosFortes({ acertos }: { acertos: Regra[] }) {
  if (acertos.length === 0) return null
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <h3 className="flex items-center gap-2 text-label-lg text-success-deep">
        <span className="h-1.5 w-1.5 rounded-full bg-success" />
        O que já está funcionando
        <span className="text-mute">({acertos.length})</span>
      </h3>
      <ul className="mt-2 space-y-1.5">
        {acertos.map((r) => (
          <li key={r.id} className="flex gap-2 text-body-sm text-body">
            <svg
              className="mt-1 h-3 w-3 shrink-0 text-success"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.2"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
            <span>
              <span className="text-caption uppercase tracking-label text-faint">
                {NOME_BLOCO[r.bloco]}
              </span>{' '}
              {r.elogio}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const GRUPOS = [
  { sev: 'critica' as const, titulo: 'Precisa resolver', cor: 'text-danger-deep', ponto: 'bg-danger' },
  { sev: 'importante' as const, titulo: 'Está custando resultado', cor: 'text-warning-deep', ponto: 'bg-warning' },
  { sev: 'refino' as const, titulo: 'Refino', cor: 'text-info-deep', ponto: 'bg-info' },
]

export function ListaDeProblemas({ violadas }: { violadas: Regra[] }) {
  if (violadas.length === 0) {
    return (
      <p className="ds-card p-6 text-center text-body-md text-mute">
        Nenhum problema automático encontrado nos campos preenchidos. 👏
      </p>
    )
  }
  return (
    <div className="space-y-6">
      {GRUPOS.map(({ sev, titulo, cor, ponto }) => {
        const doGrupo = violadas.filter((r) => r.severidade === sev)
        if (doGrupo.length === 0) return null
        return (
          <div key={sev}>
            <h3 className={`flex items-center gap-2 text-label-lg ${cor}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${ponto}`} />
              {titulo}
              <span className="text-mute">({doGrupo.length})</span>
            </h3>
            <div className="mt-2 space-y-2">
              {doGrupo.map((r, i) => (
                <div key={r.id} className="ds-card p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-caption tabular-nums text-faint">{i + 1}.</span>
                    <span className="text-caption uppercase tracking-label text-faint">
                      {NOME_BLOCO[r.bloco]}
                    </span>
                    <span className="text-body-md font-medium text-ink">{r.mensagem}</span>
                  </div>
                  <TrechoCitado trecho={(r as Regra & { trecho?: string | null }).trecho} />
                  <p className="mt-1 text-body-sm text-mute">{r.porque}</p>
                  <ComoResolver regra={r} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ListaDeChecks({
  checks,
  confirmados,
  onAlternar,
}: {
  checks: Regra[]
  confirmados: ReadonlySet<string>
  onAlternar: (id: string) => void
}) {
  if (checks.length === 0) return null
  return (
    <div className="space-y-2">
      {checks.map((r) => (
        <SelfCheck key={r.id} regra={r} confirmado={confirmados.has(r.id)} onAlternar={onAlternar} />
      ))}
    </div>
  )
}

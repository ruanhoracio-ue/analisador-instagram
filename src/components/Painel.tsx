'use client'
/**
 * Passo 3 — painel de coerência.
 * Nota POR BLOCO (nota geral única vira jogo de otimizar número) e um único
 * próximo passo: a mudança mais impactante agora. Excesso de lista trava.
 */
import type { Avaliacao, Bloco } from '@/engine/tipos'
import { BLOCOS } from '@/engine/tipos'

const NOME_BLOCO: Record<Bloco, string> = {
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

export function Painel({
  avaliacao,
  confirmados,
  onIrParaEditor,
}: {
  avaliacao: Avaliacao
  confirmados: ReadonlySet<string>
  onIrParaEditor: () => void
}) {
  const { notas, proximoPasso, violadas, checks } = avaliacao
  const pendentes = checks.filter((c) => !confirmados.has(c.id))

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-heading-lg">Coerência do perfil</h1>
      <p className="mt-1 text-body-lg text-mute">
        Nota por bloco — e uma única próxima mudança. Resolve essa, volta aqui.
      </p>

      {/* próximo passo único */}
      <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-emerald-deep">
          Próximo passo — um só
        </p>
        {proximoPasso ? (
          <>
            <p className="mt-2 text-heading-md text-ink">{proximoPasso.mensagem}</p>
            <p className="mt-1 text-body-md text-mute">{proximoPasso.porque}</p>
            <button
              onClick={onIrParaEditor}
              className="ds-btn-secondary mt-4 px-5 py-2 text-label-lg"
            >
              Resolver no editor →
            </button>
          </>
        ) : (
          <p className="mt-2 text-heading-md text-ink">
            Nada crítico em aberto — seu perfil está coerente com o objetivo. 🎉
          </p>
        )}
      </div>

      {/* notas por bloco */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BLOCOS.map((b) => {
          const nota = notas[b]
          const problemas = violadas.filter((r) => r.bloco === b).length
          const aConferir = pendentes.filter((r) => r.bloco === b).length
          return (
            <div key={b} className="ds-card p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-label-md text-mute">{NOME_BLOCO[b]}</span>
                <span className={`text-heading-md tabular-nums ${corDaNota(nota)}`}>{nota}</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className={`h-full rounded-full ${barraDaNota(nota)}`}
                  style={{ width: `${nota * 10}%` }}
                />
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

      <p className="mt-4 text-caption text-faint">
        A nota de um bloco com crítica em aberto trava em 3 — crítica é “tem que resolver”.
      </p>
    </div>
  )
}

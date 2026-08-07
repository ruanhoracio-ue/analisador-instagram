'use client'
/**
 * Passo 3 — painel de coerência.
 * Nota POR BLOCO (nota geral única vira jogo de otimizar número) e um único
 * próximo passo: a mudança mais impactante agora. Excesso de lista trava.
 */
import type { Avaliacao } from '@/engine/tipos'
import { NotasPorBloco, ProximoPasso } from './Relatorio'

export function Painel({
  avaliacao,
  confirmados,
  onIrParaEditor,
}: {
  avaliacao: Avaliacao
  confirmados: ReadonlySet<string>
  onIrParaEditor: () => void
}) {
  const pendentes = avaliacao.checks.filter((c) => !confirmados.has(c.id))

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-heading-lg">Coerência do perfil</h1>
      <p className="mt-1 text-body-lg text-mute">
        Nota por bloco — e uma única próxima mudança. Resolve essa, volta aqui.
      </p>

      <div className="mt-6">
        <ProximoPasso
          regra={avaliacao.proximoPasso}
          acao={
            <button onClick={onIrParaEditor} className="ds-btn-secondary px-5 py-2 text-label-lg">
              Resolver no editor →
            </button>
          }
        />
      </div>

      <div className="mt-6">
        <NotasPorBloco avaliacao={avaliacao} pendentes={pendentes} />
      </div>

      <p className="mt-4 text-caption text-faint">
        A nota de um bloco com crítica em aberto trava em 3 — crítica é “tem que resolver”.
      </p>
    </div>
  )
}

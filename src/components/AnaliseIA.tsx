'use client'
/**
 * Análise com IA — a leitura de estrategista por cima da análise de regras.
 * Nunca escreve o perfil pronto: aponta, explica e dá a fórmula, citando o
 * que a pessoa escreveu. Renderiza dentro do relatório, então sai no PDF.
 */
import { useState } from 'react'
import type { AnaliseIA as Analise } from '@/lib/ia'

export function SecaoAnaliseIA({ montarEntrada }: { montarEntrada: () => unknown }) {
  const [carregando, setCarregando] = useState(false)
  const [analise, setAnalise] = useState<Analise | null>(null)
  const [erro, setErro] = useState<{ mensagem: string; saida?: string } | null>(null)

  async function analisar() {
    setCarregando(true)
    setErro(null)
    try {
      const r = await fetch('/api/analise', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(montarEntrada()),
      })
      const corpo = await r.json()
      if (!r.ok) {
        setErro({ mensagem: corpo.mensagem ?? 'não deu pra analisar agora', saida: corpo.saida })
        return
      }
      setAnalise(corpo as Analise)
    } catch {
      setErro({
        mensagem: 'não consegui falar com o servidor',
        saida: 'Tente de novo — a análise por regras acima continua valendo.',
      })
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="rounded-xl border border-hairline bg-surface p-5 print-keep">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-emerald-deep">
            Leitura de estrategista · IA
          </p>
          <p className="mt-1 text-caption text-mute">
            O que as regras não alcançam: nicho, posicionamento e promessa — citando o que este
            perfil escreveu.
          </p>
        </div>
        {!analise && (
          <button
            onClick={analisar}
            disabled={carregando}
            className="no-print shiny-cta shrink-0 px-5 py-2 text-label-md disabled:opacity-60"
          >
            <span className="shiny-dots" aria-hidden="true" />
            <span className="shiny-cta-content">{carregando ? 'Analisando…' : 'Analisar com IA'}</span>
          </button>
        )}
      </div>

      {carregando && (
        <p className="mt-4 animate-pulse text-body-sm text-mute">
          Lendo o perfil como um estrategista leria… (~10 segundos)
        </p>
      )}

      {erro && !carregando && (
        <div className="mt-4 rounded-md border-l-2 border-warning bg-warning-soft/40 px-3 py-2">
          <p className="text-body-sm font-medium text-ink">{erro.mensagem}</p>
          {erro.saida && <p className="mt-0.5 text-caption text-mute">{erro.saida}</p>}
        </div>
      )}

      {analise && (
        <div className="mt-4 space-y-5">
          <div>
            <h4 className="text-label-lg text-ink">Como esse perfil se apresenta hoje</h4>
            <p className="mt-1 text-body-sm text-body">{analise.leitura}</p>
          </div>

          {analise.forcas.length > 0 && (
            <div>
              <h4 className="text-label-lg text-success-deep">O que já joga a favor</h4>
              <ul className="mt-1 space-y-1">
                {analise.forcas.map((f, i) => (
                  <li key={i} className="flex gap-2 text-body-sm text-body">
                    <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-label-lg text-ink">Oportunidades, em ordem de impacto</h4>
            <div className="mt-2 space-y-2">
              {analise.oportunidades.map((o, i) => (
                <div key={i} className="rounded-md border border-hairline p-3 print-keep">
                  <p className="text-body-sm font-medium text-ink">
                    <span className="tabular-nums text-faint">{i + 1}.</span> {o.titulo}
                  </p>
                  <p className="mt-1 text-caption text-mute">{o.porque}</p>
                  <div className="mt-2 rounded-sm border-l-2 border-hairline-strong bg-elevated/50 px-2.5 py-1.5">
                    <p className="text-[10px] font-semibold uppercase tracking-label text-emerald-deep">
                      Como resolver
                    </p>
                    <p className="mt-0.5 text-caption text-body">{o.comoResolver}</p>
                    {o.exemplo && (
                      <p className="mt-1 border-l border-hairline-strong pl-2 text-caption italic text-mute">
                        {o.exemplo}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-label text-emerald-deep">
              Se fizer uma coisa hoje
            </p>
            <p className="mt-0.5 text-body-sm text-ink">{analise.proximaAcao}</p>
          </div>

          <button
            onClick={analisar}
            disabled={carregando}
            className="no-print text-caption font-medium text-mute underline-offset-2 hover:text-emerald-deep hover:underline"
          >
            Analisar de novo
          </button>
        </div>
      )}
    </div>
  )
}

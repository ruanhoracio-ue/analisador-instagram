'use client'
/**
 * Biblioteca de exemplos — um perfil-modelo por objetivo, com o preview fiel
 * ao lado das anotações. O valor está nas anotações: exemplo sem porquê vira
 * template, e template copiado falha no teste do concorrente igual.
 */
import { useState } from 'react'
import Link from 'next/link'
import { EXEMPLOS } from '@/data/exemplos'
import { OBJETIVOS, TIPOS } from '@/engine/tipos'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { PreviewInstagram } from '@/components/PreviewInstagram'

export default function Exemplos() {
  const [i, setI] = useState(0)
  const ex = EXEMPLOS[i]
  const tipoRotulo = TIPOS.find((t) => t.id === ex.tipo)?.rotulo
  const objetivoRotulo = OBJETIVOS.find((o) => o.id === ex.objetivo)?.rotulo

  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24">
      <header className="sticky top-0 z-40 -mx-6 mb-8 flex items-center justify-between border-b border-hairline bg-canvas/95 px-6 py-3 backdrop-blur">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-70" title="Voltar ao início">
          <Logo className="h-7" />
        </Link>
        <ThemeToggle />
      </header>

      <h1 className="text-heading-lg">Exemplos comentados</h1>
      <p className="mt-1 max-w-2xl text-body-lg text-mute">
        Um perfil-modelo por objetivo — com o motivo de cada escolha. Não copie o texto: copie a
        decisão por trás dele.
      </p>

      {/* seletor de objetivo */}
      <div className="ds-scroll-x mt-6 flex gap-1.5 overflow-x-auto pb-1">
        {EXEMPLOS.map((e, idx) => (
          <button
            key={e.objetivo}
            onClick={() => setI(idx)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-label-md transition-colors ${
              i === idx
                ? 'border-emerald-500 bg-emerald-50 text-emerald-deep dark:bg-emerald-soft'
                : 'border-hairline bg-surface text-mute hover:border-hairline-strong hover:text-ink'
            }`}
          >
            {e.titulo}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* preview do modelo */}
        <div className="shrink-0 lg:sticky lg:top-24 lg:self-start">
          <PreviewInstagram
            rotulo={`Modelo — ${objetivoRotulo}`}
            nome={ex.nome}
            usuario={ex.usuario}
            bio={ex.bio}
            link={ex.link}
            ctaBotao={ex.ctaBotao}
            destaques={ex.destaques.map((nome) => ({ nome }))}
            grid={Array.from({ length: 9 }, () => undefined)}
            pinos={[true, true, true]}
          />
        </div>

        {/* anotações */}
        <div className="min-w-0 flex-1">
          <div className="ds-card p-5">
            <span className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-emerald-deep">
              {tipoRotulo} · {objetivoRotulo}
            </span>
            <h2 className="mt-1.5 text-heading-md">{ex.titulo}</h2>
            <p className="mt-1 text-body-md text-mute">{ex.contexto}</p>
          </div>

          <h3 className="mt-6 text-label-lg text-ink">Por que cada escolha</h3>
          <div className="mt-2 space-y-2">
            {ex.anotacoes.map((a, k) => (
              <div key={k} className="ds-card p-4">
                <p className="border-l-2 border-emerald-400 pl-3 text-body-sm font-medium whitespace-pre-line text-ink">
                  {a.trecho}
                </p>
                <p className="mt-2 text-body-sm text-mute">{a.porque}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="ds-card p-4">
              <h4 className="text-label-md text-mute">Destaques, na ordem da jornada</h4>
              <ol className="mt-2 space-y-1">
                {ex.destaques.map((d, k) => (
                  <li key={d} className="flex gap-2 text-body-sm text-ink">
                    <span className="tabular-nums text-faint">{k + 1}.</span>
                    {d}
                  </li>
                ))}
              </ol>
            </div>
            <div className="ds-card p-4">
              <h4 className="text-label-md text-mute">Os 3 fixados</h4>
              <ol className="mt-2 space-y-1">
                {ex.fixados.map((f, k) => (
                  <li key={f} className="flex gap-2 text-body-sm text-ink">
                    <span className="tabular-nums text-faint">{k + 1}.</span>
                    {f}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="ds-card mt-6 flex items-center justify-between gap-4 p-4">
            <p className="text-body-sm text-mute">
              Entendeu a lógica? Agora monte a sua — o construtor avisa se a decisão não bate com o
              seu objetivo.
            </p>
            <Link href="/construtor" className="shiny-cta shrink-0 px-5 py-2 text-label-md">
              <span className="shiny-dots" aria-hidden="true" />
              <span className="shiny-cta-content">Montar o meu →</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

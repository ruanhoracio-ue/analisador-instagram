'use client'
/**
 * O construtor — 5 passos, um estado, um motor.
 * Tudo roda no navegador: texto no localStorage, imagens no IndexedDB.
 */
import { useMemo } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { avaliar, progresso } from '@/engine/avaliar'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useEstado } from '@/lib/estado'
import { Abertura } from '@/components/Abertura'
import { Editor } from '@/components/Editor'
import { Painel } from '@/components/Painel'
import { AntesDepois } from '@/components/AntesDepois'
import { Kit } from '@/components/Kit'

const PASSOS = ['Objetivo', 'Editor', 'Coerência', 'Antes e depois', 'Kit']

export default function Pagina() {
  const {
    estado,
    mudar,
    imagens,
    definirImagem,
    perfil,
    confirmados,
    alternarConfirmado,
    pronto,
  } = useEstado()

  const avaliacao = useMemo(() => avaliar(perfil, confirmados), [perfil, confirmados])
  const ritmo = useMemo(() => progresso(perfil, confirmados), [perfil, confirmados])

  if (!pronto) {
    return (
      <main className="flex min-h-screen items-center justify-center text-mute">
        Carregando…
      </main>
    )
  }

  const passo = estado.passo

  return (
    <main className="mx-auto max-w-[1200px] px-6 pb-24">
      {/* stepper */}
      <header className="no-print sticky top-0 z-40 -mx-6 mb-8 border-b border-hairline bg-canvas/95 px-6 pt-3 backdrop-blur">
        <nav className="ds-scroll-x flex items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            className="mr-4 hidden shrink-0 transition-opacity hover:opacity-70 sm:block"
            title="Voltar ao início"
          >
            <Logo className="h-7" />
          </Link>
          {PASSOS.map((nome, i) => {
            const ativo = passo === i
            const liberado = i === 0 || estado.objetivo !== null
            return (
              <button
                key={nome}
                disabled={!liberado}
                onClick={() => mudar('passo', i)}
                ref={(el) => {
                  // o passo ativo entra na vista sozinho — no celular a trilha rola
                  if (el && ativo) el.scrollIntoView({ block: 'nearest', inline: 'center' })
                }}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md transition-colors ${
                  ativo
                    ? 'bg-inverse text-on-inverse'
                    : liberado
                      ? 'text-mute hover:bg-ink/5 hover:text-ink'
                      : 'cursor-not-allowed text-faint'
                }`}
              >
                <span className="mr-1.5 tabular-nums">{i + 1}</span>
                {nome}
              </button>
            )
          })}
          <div className="ml-auto flex shrink-0 items-center gap-3 pl-3">
            {estado.objetivo && (
              <span className="hidden whitespace-nowrap text-caption tabular-nums text-mute sm:block">
                {ritmo.resolvidas} de {ritmo.total} decisões
              </span>
            )}
            <ThemeToggle />
          </div>
        </nav>

        {/* ritmo da sessão — quanto falta, não quão bom está. A qualidade
            continua por bloco no painel de coerência. */}
        <div className="mt-3 h-0.5 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full bg-brand-gradient transition-[width] duration-slow ease-out-soft"
            style={{ width: `${Math.round(ritmo.fracao * 100)}%` }}
          />
        </div>
      </header>

      {passo === 0 && (
        <Abertura
          tipo={estado.tipo}
          objetivo={estado.objetivo}
          onTipo={(t) => mudar('tipo', t)}
          onObjetivo={(o) => mudar('objetivo', o)}
          onComecar={() => mudar('passo', 1)}
        />
      )}

      {passo === 1 && (
        <Editor
          estado={estado}
          mudar={mudar}
          imagens={imagens}
          definirImagem={definirImagem}
          avaliacao={avaliacao}
          confirmados={confirmados}
          alternarConfirmado={alternarConfirmado}
        />
      )}

      {passo === 2 && (
        <Painel
          avaliacao={avaliacao}
          confirmados={confirmados}
          onIrParaEditor={() => mudar('passo', 1)}
        />
      )}

      {passo === 3 && <AntesDepois estado={estado} mudar={mudar} imagens={imagens} />}

      {passo === 4 && (
        <Kit estado={estado} imagens={imagens} avaliacao={avaliacao} confirmados={confirmados} />
      )}

      {/* navegação inferior */}
      {passo > 0 && (
        <div className="no-print mt-10 flex justify-between">
          <button
            onClick={() => mudar('passo', passo - 1)}
            className="ds-btn-secondary px-5 py-2 text-label-md"
          >
            ← {PASSOS[passo - 1]}
          </button>
          {passo < PASSOS.length - 1 && (
            <button onClick={() => mudar('passo', passo + 1)} className="shiny-cta px-6 py-2 text-label-md">
              <span className="shiny-dots" aria-hidden="true" />
              <span className="shiny-cta-content">{PASSOS[passo + 1]} →</span>
            </button>
          )}
        </div>
      )}
    </main>
  )
}

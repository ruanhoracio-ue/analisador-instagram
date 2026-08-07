'use client'
/**
 * O construtor — 5 passos, um estado, um motor.
 * Tudo roda no navegador: texto no localStorage, imagens no IndexedDB.
 */
import { useMemo } from 'react'
import Link from 'next/link'
import { avaliar } from '@/engine/avaliar'
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
      <header className="no-print sticky top-0 z-40 -mx-6 mb-8 border-b border-hairline bg-canvas/80 px-6 py-3 backdrop-blur">
        <nav className="flex items-center gap-1 overflow-x-auto">
          <Link
            href="/"
            className="mr-3 hidden whitespace-nowrap text-label-lg font-semibold text-ink hover:text-emerald-deep sm:block"
          >
            ← Construtor
          </Link>
          {PASSOS.map((nome, i) => {
            const ativo = passo === i
            const liberado = i === 0 || estado.objetivo !== null
            return (
              <button
                key={nome}
                disabled={!liberado}
                onClick={() => mudar('passo', i)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-label-md transition-colors ${
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
        </nav>
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

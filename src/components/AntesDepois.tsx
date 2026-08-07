'use client'
/**
 * Passo 4 — antes e depois, lado a lado.
 * Só aparece preenchendo o estado atual (opcional). É a tela printável que
 * o aluno manda no grupo — precisa ser bonita.
 */
import type { EstadoTexto } from '@/lib/estado'
import { PreviewInstagram } from './PreviewInstagram'

const CAMPO =
  'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-body-md text-ink placeholder:text-faint focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

export function AntesDepois({
  estado,
  mudar,
  imagens,
}: {
  estado: EstadoTexto
  mudar: <K extends keyof EstadoTexto>(campo: K, valor: EstadoTexto[K]) => void
  imagens: Record<string, string>
}) {
  const { antes } = estado

  if (!estado.antesPreenchido) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-heading-lg">Antes e depois</h1>
        <p className="mt-1 text-body-lg text-mute">
          Preencha como o seu perfil está <em>hoje</em> e veja os dois lado a lado. Se o perfil
          ainda não existe, pode pular — esta tela é opcional.
        </p>
        <div className="ds-card mt-6 space-y-3 p-5">
          <div>
            <label className="text-label-md text-mute">Nome atual</label>
            <input
              className={`${CAMPO} mt-1`}
              value={antes.nome}
              onChange={(e) => mudar('antes', { ...antes, nome: e.target.value })}
            />
          </div>
          <div>
            <label className="text-label-md text-mute">@ atual</label>
            <input
              className={`${CAMPO} mt-1`}
              value={antes.usuario}
              onChange={(e) => mudar('antes', { ...antes, usuario: e.target.value })}
            />
          </div>
          <div>
            <label className="text-label-md text-mute">Bio atual</label>
            <textarea
              className={`${CAMPO} mt-1 min-h-24 resize-y`}
              value={antes.bio}
              onChange={(e) => mudar('antes', { ...antes, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="text-label-md text-mute">Link atual</label>
            <input
              className={`${CAMPO} mt-1`}
              value={antes.link}
              onChange={(e) => mudar('antes', { ...antes, link: e.target.value })}
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={() => mudar('antesPreenchido', true)}
              disabled={!antes.nome.trim() && !antes.bio.trim()}
              className="shiny-cta px-6 py-2.5 text-label-lg disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="shiny-dots" aria-hidden="true" />
              <span className="shiny-cta-content">Ver o antes e depois →</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-end justify-between no-print">
        <div>
          <h1 className="text-heading-lg">Antes e depois</h1>
          <p className="mt-1 text-body-lg text-mute">O print que vai pro grupo. 📸</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => mudar('antesPreenchido', false)}
            className="ds-btn-secondary px-4 py-2 text-label-md"
          >
            Editar o “antes”
          </button>
          <button onClick={() => window.print()} className="shiny-cta px-5 py-2 text-label-md">
            <span className="shiny-dots" aria-hidden="true" />
            <span className="shiny-cta-content">Imprimir / salvar</span>
          </button>
        </div>
      </div>

      <div className="area-print mt-6 rounded-2xl border border-hairline bg-surface p-6">
        <div className="flex flex-wrap items-start justify-center gap-8">
          <PreviewInstagram
            rotulo="Antes"
            nome={antes.nome}
            usuario={antes.usuario}
            bio={antes.bio}
            link={antes.link}
            ctaBotao=""
            destaques={[{ nome: '' }, { nome: '' }, { nome: '' }, { nome: '' }]}
            grid={Array.from({ length: 9 }, () => undefined)}
          />
          <PreviewInstagram
            rotulo="Depois"
            foto={imagens['foto']}
            nome={estado.nome}
            usuario={estado.usuario}
            bio={estado.bio}
            link={estado.link}
            ctaBotao={estado.ctaBotao}
            destaques={estado.destaques.map((d, i) => ({ nome: d.nome, capa: imagens[`destaque-${i}`] }))}
            grid={Array.from({ length: 9 }, (_, i) => imagens[`grid-${i}`])}
            pinos={estado.fixados.map((f) => Boolean(f.titulo.trim() || f.papel))}
          />
        </div>
        <p className="mt-6 text-center text-caption text-faint">
          Construtor de Perfil · Conversão Extrema
        </p>
      </div>
    </div>
  )
}

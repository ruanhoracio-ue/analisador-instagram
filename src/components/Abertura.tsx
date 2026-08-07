'use client'
/**
 * Passo 1 — as duas perguntas que definem tudo.
 * O objetivo é o eixo do app; o tipo só ajusta o tom.
 */
import type { Objetivo, Tipo } from '@/engine/tipos'
import { OBJETIVOS, TIPOS } from '@/engine/tipos'

const DESCRICAO_OBJETIVO: Record<Objetivo, string> = {
  direct: 'Conversa é o seu funil: dúvida, orçamento, agendamento.',
  link: 'A venda acontece fora: loja, página, checkout.',
  seguir: 'Audiência primeiro: a pessoa fica e acompanha o conteúdo.',
  local: 'O destino é físico: loja, consultório, estúdio.',
  contratar: 'Portfólio vivo: quem chega avalia e contrata.',
}

const DESCRICAO_TIPO: Record<Tipo, string> = {
  pessoa: 'Perfil pessoal com objetivo profissional',
  criador: 'Conteúdo é o produto',
  negocio: 'Marca, loja ou empresa',
}

export function Abertura({
  tipo,
  objetivo,
  onTipo,
  onObjetivo,
  onComecar,
}: {
  tipo: Tipo
  objetivo: Objetivo | null
  onTipo: (t: Tipo) => void
  onObjetivo: (o: Objetivo) => void
  onComecar: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-emerald-deep">
        Construtor de perfil
      </p>
      <h1 className="mt-2 text-heading-xl">
        Duas perguntas antes de <span className="text-brand-gradient">qualquer campo</span>
      </h1>
      <p className="mt-2 text-body-lg text-mute">
        O objetivo é o eixo de tudo: dois perfis com objetivos diferentes precisam de perfis
        diferentes. As regras que você vai ver mudam conforme a resposta.
      </p>

      <h2 className="mt-8 text-heading-sm">O que você é?</h2>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {TIPOS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTipo(t.id)}
            className={`ds-card px-4 py-3 text-left transition-colors ${
              tipo === t.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-hairline-strong'
            }`}
          >
            <span className="block text-label-lg text-ink">{t.rotulo}</span>
            <span className="mt-0.5 block text-caption text-mute">{DESCRICAO_TIPO[t.id]}</span>
          </button>
        ))}
      </div>

      <h2 className="mt-8 text-heading-sm">
        O que precisa acontecer quando alguém entra no seu perfil?
      </h2>
      <div className="mt-3 space-y-2">
        {OBJETIVOS.map((o) => (
          <button
            key={o.id}
            onClick={() => onObjetivo(o.id)}
            className={`ds-card flex w-full items-center justify-between px-4 py-3 text-left transition-colors ${
              objetivo === o.id ? 'border-emerald-500 ring-1 ring-emerald-500' : 'hover:border-hairline-strong'
            }`}
          >
            <span>
              <span className="block text-label-lg text-ink">{o.rotulo}</span>
              <span className="mt-0.5 block text-caption text-mute">{DESCRICAO_OBJETIVO[o.id]}</span>
            </span>
            <span
              className={`ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                objetivo === o.id ? 'border-emerald-500 bg-emerald-500' : 'border-hairline-strong'
              }`}
            >
              {objetivo === o.id && (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={onComecar}
          disabled={!objetivo}
          className="shiny-cta px-7 py-3 text-label-lg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="shiny-dots" aria-hidden="true" />
          <span className="shiny-cta-content">Montar meu perfil →</span>
        </button>
      </div>
    </div>
  )
}

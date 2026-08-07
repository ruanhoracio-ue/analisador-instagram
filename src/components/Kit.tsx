'use client'
/**
 * Passo 5 — kit de aplicação.
 * Tudo pronto pra copiar e colar no Instagram. O aluno raramente perde por
 * não saber o que fazer — perde no caminho entre saber e aplicar.
 */
import { useState } from 'react'
import type { Avaliacao } from '@/engine/tipos'
import type { EstadoTexto } from '@/lib/estado'

function BotaoCopiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false)
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(texto)
        setCopiado(true)
        setTimeout(() => setCopiado(false), 1600)
      }}
      className={`shrink-0 rounded-md border px-3 py-1.5 text-label-md transition-colors ${
        copiado
          ? 'border-emerald-300 bg-emerald-50 text-emerald-deep'
          : 'border-hairline bg-surface text-ink hover:border-hairline-strong'
      }`}
    >
      {copiado ? 'Copiado ✓' : 'Copiar'}
    </button>
  )
}

function Item({ rotulo, valor, mono = false }: { rotulo: string; valor: string; mono?: boolean }) {
  if (!valor.trim()) return null
  return (
    <div className="ds-card flex items-start justify-between gap-4 p-4">
      <div className="min-w-0">
        <p className="text-label-md text-mute">{rotulo}</p>
        <p className={`mt-1 whitespace-pre-line text-body-md text-ink ${mono ? 'font-mono text-[13px]' : ''}`}>
          {valor}
        </p>
      </div>
      <BotaoCopiar texto={valor} />
    </div>
  )
}

const PAPEL_ROTULO: Record<string, string> = {
  apresentacao: 'Apresentação',
  prova: 'Prova social',
  oferta: 'Oferta',
}

export function Kit({
  estado,
  imagens,
  avaliacao,
  confirmados,
}: {
  estado: EstadoTexto
  imagens: Record<string, string>
  avaliacao: Avaliacao
  confirmados: ReadonlySet<string>
}) {
  const destaquesComNome = estado.destaques.filter((d) => d.nome.trim())
  const ordemDestaques = destaquesComNome
    .map((d, i) => `${i + 1}. ${d.nome.trim()}${imagens[`destaque-${i}`] ? '' : '  (capa pendente)'}`)
    .join('\n')

  const gridVazios = Array.from({ length: 9 }, (_, i) => i).filter((i) => !imagens[`grid-${i}`])
  const checksPendentes = avaliacao.checks.filter((c) => !confirmados.has(c.id))
  const tarefasGrid = [
    ...gridVazios.map((i) => `Fotografar/criar a miniatura ${i + 1}`),
    ...checksPendentes
      .filter((c) => c.bloco === 'grid' || c.bloco === 'destaques' || c.bloco === 'foto')
      .map((c) => `Conferir: ${c.mensagem}`),
  ].join('\n')

  const fixados = estado.fixados
    .filter((f) => f.titulo.trim() || f.papel)
    .map((f, i) => `${i + 1}º fixado — ${f.papel ? PAPEL_ROTULO[f.papel] : 'sem papel'}: ${f.titulo || '(definir tema)'}`)
    .join('\n')

  const tudo = [
    estado.nome && `NOME\n${estado.nome}`,
    estado.usuario && `USUÁRIO\n@${estado.usuario}`,
    estado.bio && `BIO\n${estado.bio}`,
    estado.link && `LINK\n${estado.link}`,
    estado.ctaBotao && `BOTÃO DE AÇÃO\n${estado.ctaBotao}`,
    ordemDestaques && `DESTAQUES (ordem)\n${ordemDestaques}`,
    fixados && `POSTS FIXADOS\n${fixados}`,
    tarefasGrid && `GRID — O QUE FALTA\n${tarefasGrid}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-heading-lg">Kit de aplicação</h1>
          <p className="mt-1 text-body-lg text-mute">
            Copie campo a campo e cole no Instagram — as quebras de linha já vão certas.
          </p>
        </div>
        <BotaoCopiar texto={tudo} />
      </div>

      <div className="mt-6 space-y-3">
        <Item rotulo="Nome (campo Nome, não o @)" valor={estado.nome} />
        <Item rotulo="Usuário" valor={estado.usuario ? `@${estado.usuario}` : ''} />
        <Item rotulo="Bio — com as quebras de linha" valor={estado.bio} />
        <Item rotulo="Link" valor={estado.link} mono />
        <Item rotulo="Texto do botão de ação" valor={estado.ctaBotao} />
        <Item rotulo="Destaques — ordem de criação" valor={ordemDestaques} />
        <Item rotulo="Posts fixados" valor={fixados} />
        <Item rotulo="Grid — o que fotografar ou refazer" valor={tarefasGrid} />
      </div>

      {!tudo && (
        <p className="ds-card mt-6 p-6 text-center text-body-md text-mute">
          O kit é montado com o que você preencher no editor — volte lá e complete os campos.
        </p>
      )}
    </div>
  )
}

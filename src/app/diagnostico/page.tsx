'use client'
/**
 * Diagnóstico — olha pra trás. Recebe um perfil que já existe (o seu ou de
 * um concorrente) e devolve o que está errado nele, com o porquê.
 *
 * A captura automática por @ não existe: o Instagram não permite ler perfis
 * de terceiros por API. Aqui a pessoa cola o que o perfil mostra — e o mesmo
 * motor do construtor avalia.
 */
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { avaliar } from '@/engine/avaliar'
import type { Objetivo, Perfil, Tipo } from '@/engine/tipos'
import { OBJETIVOS, TIPOS } from '@/engine/tipos'
import { estadoInicial } from '@/lib/estado'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Contador } from '@/components/PreviewInstagram'
import {
  ListaDeChecks,
  ListaDeProblemas,
  NotasPorBloco,
  PontosFortes,
  ProximoPasso,
} from '@/components/Relatorio'
import { arquivoParaDataUrl } from '@/lib/imagem'

interface Dados {
  usuario: string
  tipo: Tipo
  objetivo: Objetivo
  nome: string
  bio: string
  link: string
  ctaBotao: string
  cidade: string
  temFoto: boolean
  qtdDestaques: number
  temFixados: boolean
  tem9Posts: boolean
  confirmados: string[]
}

const CHAVE = 'diagnostico:v1'

const DADOS_INICIAIS: Dados = {
  usuario: '',
  tipo: 'pessoa',
  objetivo: 'direct',
  nome: '',
  bio: '',
  link: '',
  ctaBotao: '',
  cidade: '',
  temFoto: true,
  qtdDestaques: 0,
  temFixados: false,
  tem9Posts: true,
  confirmados: [],
}

const CAMPO =
  'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-body-md text-ink placeholder:text-faint focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-label-md transition-colors ${
        ativo
          ? 'border-emerald-500 bg-emerald-50 text-emerald-deep'
          : 'border-hairline bg-surface text-mute hover:border-hairline-strong hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function Diagnostico() {
  const router = useRouter()
  const [dados, setDados] = useState<Dados>(DADOS_INICIAIS)
  const [pronto, setPronto] = useState(false)
  const [print, setPrint] = useState<string | null>(null)

  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE)
      if (bruto) setDados({ ...DADOS_INICIAIS, ...JSON.parse(bruto) })
    } catch {
      /* começa do zero */
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto) return
    const t = setTimeout(() => localStorage.setItem(CHAVE, JSON.stringify(dados)), 250)
    return () => clearTimeout(t)
  }, [dados, pronto])

  const mudar = <K extends keyof Dados>(campo: K, valor: Dados[K]) =>
    setDados((d) => ({ ...d, [campo]: valor }))

  /* o perfil que o motor recebe — o mesmo formato do construtor */
  const perfil: Perfil = useMemo(
    () => ({
      tipo: dados.tipo,
      objetivo: dados.objetivo,
      foto: dados.temFoto ? 'existe' : undefined,
      nome: dados.nome,
      usuario: dados.usuario.replace(/^@/, ''),
      bio: dados.bio,
      link: dados.link,
      ctaBotao: dados.ctaBotao,
      cidade: dados.cidade || undefined,
      destaques: Array.from({ length: Math.max(dados.qtdDestaques, 0) }, () => ({ nome: '•' })),
      grid: Array.from({ length: 9 }, () => (dados.tem9Posts ? { imagem: 'existe' } : {})),
      fixados: dados.temFixados
        ? [{ titulo: '—' }, { titulo: '—' }, { titulo: '—' }]
        : [{}, {}, {}],
    }),
    [dados],
  )

  const confirmados = useMemo(() => new Set(dados.confirmados), [dados.confirmados])
  const avaliacao = useMemo(() => avaliar(perfil, confirmados), [perfil, confirmados])
  const comecou = dados.nome.trim() !== '' || dados.bio.trim() !== '' || dados.usuario.trim() !== ''
  const pendentes = avaliacao.checks.filter((c) => !confirmados.has(c.id))

  const levarProConstrutor = () => {
    const estado = {
      ...estadoInicial(),
      tipo: dados.tipo,
      objetivo: dados.objetivo,
      nome: dados.nome,
      usuario: dados.usuario.replace(/^@/, ''),
      bio: dados.bio,
      link: dados.link,
      ctaBotao: dados.ctaBotao,
      cidade: dados.cidade,
      antes: { nome: dados.nome, usuario: dados.usuario, bio: dados.bio, link: dados.link },
      antesPreenchido: true,
      passo: 1,
    }
    localStorage.setItem('construtor-perfil:v1', JSON.stringify(estado))
    router.push('/construtor')
  }

  if (!pronto) return null

  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24">
      <header className="no-print sticky top-0 z-40 -mx-6 mb-8 flex items-center justify-between gap-3 border-b border-hairline bg-canvas/95 px-6 py-3 backdrop-blur">
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-70" title="Voltar ao início">
          <Logo className="h-5" />
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {comecou && (
            <button
              onClick={() => window.print()}
              className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-label-md text-ink transition-colors hover:border-hairline-strong"
            >
              Salvar PDF
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* cabeçalho que só existe no papel — identifica o relatório impresso */}
      <div className="mb-6 hidden print:block">
        <Logo className="h-6" />
        <h1 className="mt-3 text-heading-md">
          Análise do perfil {dados.usuario && `— @${dados.usuario.replace(/^@/, '')}`}
        </h1>
        <p className="mt-0.5 text-body-sm text-mute">
          Objetivo analisado: {OBJETIVOS.find((o) => o.id === dados.objetivo)?.rotulo} ·{' '}
          {TIPOS.find((t) => t.id === dados.tipo)?.rotulo}
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* ── entrada — acompanha a rolagem do relatório no desktop ─── */}
        <div className="no-print min-w-0 flex-1 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1">
          {/* print do perfil — referência visual ao lado dos campos */}
          <section className="ds-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-heading-sm">Print do perfil (opcional)</h3>
                <p className="mt-0.5 text-caption text-mute">
                  Suba o print e ele fica fixo aqui do lado enquanto você preenche — e serve pras
                  conferências de foto e grid lá embaixo.
                </p>
              </div>
              <label className="shrink-0 cursor-pointer rounded-md border border-hairline bg-surface px-3 py-1.5 text-label-md text-ink transition-colors hover:border-hairline-strong">
                {print ? 'Trocar' : 'Subir print'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (f) setPrint(await arquivoParaDataUrl(f, 1400))
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            {print && (
              <div className="mt-3 flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={print}
                  alt="Print do perfil analisado"
                  className="max-h-[420px] w-auto rounded-md border border-hairline"
                />
                <button
                  onClick={() => setPrint(null)}
                  className="text-caption text-faint hover:text-danger-deep"
                >
                  remover
                </button>
              </div>
            )}
          </section>

          <section className="ds-card p-4">
            <h3 className="text-heading-sm">De quem é o perfil?</h3>
            <p className="mt-0.5 text-caption text-mute">
              Abra o perfil no Instagram e copie o que ele mostra — funciona pro seu e pro de
              qualquer concorrente.
            </p>
            <div className="relative mt-3">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">@</span>
              <input
                className={`${CAMPO} pl-7`}
                placeholder="usuario_analisado"
                value={dados.usuario}
                onChange={(e) => mudar('usuario', e.target.value.replace(/\s/g, ''))}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {TIPOS.map((t) => (
                <Chip key={t.id} ativo={dados.tipo === t.id} onClick={() => mudar('tipo', t.id)}>
                  {t.rotulo}
                </Chip>
              ))}
            </div>
            <p className="mt-3 text-label-md text-mute">Qual é o objetivo desse perfil?</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {OBJETIVOS.map((o) => (
                <Chip key={o.id} ativo={dados.objetivo === o.id} onClick={() => mudar('objetivo', o.id)}>
                  {o.rotulo}
                </Chip>
              ))}
            </div>
            {dados.objetivo === 'local' && (
              <input
                className={`${CAMPO} mt-3`}
                placeholder="Cidade ou bairro do negócio"
                value={dados.cidade}
                onChange={(e) => mudar('cidade', e.target.value)}
              />
            )}
          </section>

          <section className="ds-card space-y-3 p-4">
            <h3 className="text-heading-sm">O que o perfil mostra</h3>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-label-md text-mute">Nome (o campo em negrito, não o @)</label>
                <Contador valor={dados.nome} limite={30} />
              </div>
              <input
                className={`${CAMPO} mt-1`}
                value={dados.nome}
                onChange={(e) => mudar('nome', e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-label-md text-mute">Bio — cole com as quebras de linha</label>
                <Contador valor={dados.bio} limite={150} />
              </div>
              <textarea
                className={`${CAMPO} mt-1 min-h-24 resize-y`}
                value={dados.bio}
                onChange={(e) => mudar('bio', e.target.value)}
              />
            </div>
            <div>
              <label className="text-label-md text-mute">Link da bio</label>
              <input
                className={`${CAMPO} mt-1`}
                placeholder="https://…"
                value={dados.link}
                onChange={(e) => mudar('link', e.target.value)}
              />
            </div>
            <div>
              <label className="text-label-md text-mute">Texto do botão de ação (se tiver)</label>
              <input
                className={`${CAMPO} mt-1`}
                placeholder="Enviar mensagem, Comprar…"
                value={dados.ctaBotao}
                onChange={(e) => mudar('ctaBotao', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 text-body-sm text-ink">
                <input
                  type="checkbox"
                  checked={dados.temFoto}
                  onChange={(e) => mudar('temFoto', e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Tem foto de perfil
              </label>
              <label className="flex items-center gap-2 text-body-sm text-ink">
                <input
                  type="checkbox"
                  checked={dados.temFixados}
                  onChange={(e) => mudar('temFixados', e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Tem posts fixados
              </label>
              <label className="flex items-center gap-2 text-body-sm text-ink">
                <input
                  type="checkbox"
                  checked={dados.tem9Posts}
                  onChange={(e) => mudar('tem9Posts', e.target.checked)}
                  className="h-4 w-4 accent-emerald-600"
                />
                Tem 9 posts ou mais
              </label>
              <label className="flex items-center gap-2 text-body-sm text-ink">
                Destaques:
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={dados.qtdDestaques}
                  onChange={(e) => mudar('qtdDestaques', Number(e.target.value))}
                  className="w-16 rounded-md border border-hairline bg-surface px-2 py-1 text-body-sm focus:border-emerald-400 focus:outline-none"
                />
              </label>
            </div>
          </section>
        </div>

        {/* ── relatório ────────────────────────────────────────────── */}
        <div className="print-full min-w-0 flex-1 space-y-6">
          {!comecou ? (
            <div className="ds-card flex h-full min-h-64 items-center justify-center p-8 text-center text-body-md text-mute">
              O relatório aparece aqui conforme você preenche —<br />
              cada problema vem com o porquê.
            </div>
          ) : (
            <>
              <ProximoPasso regra={avaliacao.proximoPasso} />
              <NotasPorBloco avaliacao={avaliacao} pendentes={pendentes} />
              <PontosFortes acertos={avaliacao.acertos} />
              <div>
                <h3 className="text-label-lg text-ink">O que precisa melhorar</h3>
                <p className="mt-0.5 text-caption text-mute">
                  Em ordem de impacto — cada item traz o motivo e a fórmula pra resolver.
                </p>
                <div className="mt-3">
                  <ListaDeProblemas violadas={avaliacao.violadas} />
                </div>
              </div>
              <div>
                <h3 className="text-label-lg text-ink">Confira você mesmo, olhando o perfil</h3>
                <p className="mt-0.5 text-caption text-mute">
                  O que a máquina não enxerga — marque o que já está ok.
                </p>
                <div className="mt-2">
                  <ListaDeChecks
                    checks={avaliacao.checks}
                    confirmados={confirmados}
                    onAlternar={(id) =>
                      mudar(
                        'confirmados',
                        dados.confirmados.includes(id)
                          ? dados.confirmados.filter((c) => c !== id)
                          : [...dados.confirmados, id],
                      )
                    }
                  />
                </div>
              </div>

              <div className="ds-card no-print flex items-center justify-between gap-4 p-4">
                <p className="text-body-sm text-mute">
                  Quer corrigir? Leva tudo pro construtor — os campos já vão preenchidos e o
                  antes/depois sai de graça.
                </p>
                <button onClick={levarProConstrutor} className="shiny-cta shrink-0 px-5 py-2 text-label-md">
                  <span className="shiny-dots" aria-hidden="true" />
                  <span className="shiny-cta-content">Reconstruir →</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

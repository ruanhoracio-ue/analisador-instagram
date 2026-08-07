'use client'
/**
 * Passo 2 — edição com preview ao vivo.
 * Esquerda: formulário por bloco, com os avisos do motor embaixo de cada um.
 * Direita: preview fiel, atualizando a cada tecla.
 */
import { useRef, useState } from 'react'
import type { Avaliacao, Bloco, PapelFixado } from '@/engine/tipos'
import { avaliacaoDoBloco } from '@/engine/avaliar'
import type { EstadoTexto } from '@/lib/estado'
import { arquivoParaDataUrl, recortarParaDataUrl, type Recorte } from '@/lib/imagem'
import { AvisosDoBloco } from './Avisos'
import { EditorDeFoto } from './EditorDeFoto'
import { Contador, PreviewInstagram } from './PreviewInstagram'

function UploadImagem({
  imagem,
  onImagem,
  formato = 'quadrado',
  rotulo,
  ladoMax = 640,
}: {
  imagem?: string
  onImagem: (dataUrl: string | null) => void
  formato?: 'circulo' | 'quadrado' | 'retrato'
  rotulo?: string
  ladoMax?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const forma =
    formato === 'circulo' ? 'rounded-full aspect-square' : formato === 'retrato' ? 'rounded-md aspect-[3/4]' : 'rounded-md aspect-square'
  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`relative w-full overflow-hidden border border-dashed border-hairline-strong bg-elevated/50 transition-colors hover:border-emerald-400 ${forma}`}
      >
        {imagem ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imagem} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-faint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        )}
      </button>
      {rotulo && <span className="text-caption text-mute">{rotulo}</span>}
      {imagem && (
        <button type="button" onClick={() => onImagem(null)} className="text-caption text-faint hover:text-danger-deep">
          remover
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) onImagem(await arquivoParaDataUrl(f, ladoMax))
          e.target.value = ''
        }}
      />
    </div>
  )
}

function Secao({
  titulo,
  dica,
  children,
}: {
  titulo: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <section className="ds-card p-4">
      <h3 className="text-heading-sm">{titulo}</h3>
      {dica && <p className="mt-0.5 text-caption text-mute">{dica}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

const CAMPO =
  'w-full rounded-md border border-hairline bg-surface px-3 py-2 text-body-md text-ink placeholder:text-faint focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100'

/** Foto de perfil com enquadramento — o original fica guardado pra reenquadrar */
function CampoFoto({
  original,
  recortada,
  recorte,
  onOriginal,
  onRecorte,
  onRemover,
}: {
  original?: string
  recortada?: string
  recorte: Recorte | null
  onOriginal: (dataUrl: string) => void
  onRecorte: (r: Recorte, dataUrl: string) => void
  onRemover: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [editando, setEditando] = useState<string | null>(null)

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => (original ? setEditando(original) : inputRef.current?.click())}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-dashed border-hairline-strong bg-elevated/50 transition-colors hover:border-emerald-400"
      >
        {recortada ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recortada} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-faint">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        )}
      </button>

      <div className="flex flex-col items-start gap-1.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-label-md text-ink transition-colors hover:border-hairline-strong"
        >
          {original ? 'Trocar imagem' : 'Escolher imagem'}
        </button>
        {original && (
          <>
            <button
              type="button"
              onClick={() => setEditando(original)}
              className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-label-md text-ink transition-colors hover:border-hairline-strong"
            >
              Reenquadrar
            </button>
            <button type="button" onClick={onRemover} className="px-1 text-caption text-faint hover:text-danger-deep">
              remover
            </button>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) {
            const du = await arquivoParaDataUrl(f, 1200)
            onOriginal(du)
            setEditando(du)
          }
          e.target.value = ''
        }}
      />

      {editando && (
        <EditorDeFoto
          original={editando}
          recorteInicial={recorte}
          onCancelar={() => setEditando(null)}
          onConfirmar={async (r) => {
            onRecorte(r, await recortarParaDataUrl(editando, r))
            setEditando(null)
          }}
        />
      )}
    </div>
  )
}

export function Editor({
  estado,
  mudar,
  imagens,
  definirImagem,
  avaliacao,
  confirmados,
  alternarConfirmado,
}: {
  estado: EstadoTexto
  mudar: <K extends keyof EstadoTexto>(campo: K, valor: EstadoTexto[K]) => void
  imagens: Record<string, string>
  definirImagem: (id: string, dataUrl: string | null) => void
  avaliacao: Avaliacao
  confirmados: ReadonlySet<string>
  alternarConfirmado: (id: string) => void
}) {
  const bloco = (b: Bloco) => {
    const { violadas, checks } = avaliacaoDoBloco(avaliacao, b)
    return (
      <AvisosDoBloco
        violadas={violadas}
        checks={checks}
        confirmados={confirmados}
        onAlternar={alternarConfirmado}
      />
    )
  }

  const ehLocal = estado.objetivo === 'local'

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* ── formulário ─────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 space-y-4">
        <Secao titulo="Foto de perfil" dica="Confira no círculo de 40px do preview — é o tamanho real no feed e no direct.">
          <CampoFoto
            original={imagens['foto-original']}
            recortada={imagens['foto']}
            recorte={estado.recorteFoto}
            onOriginal={(du) => definirImagem('foto-original', du)}
            onRecorte={(r, du) => {
              mudar('recorteFoto', r)
              definirImagem('foto', du)
            }}
            onRemover={() => {
              definirImagem('foto', null)
              definirImagem('foto-original', null)
              mudar('recorteFoto', null)
            }}
          />
          {bloco('foto')}
        </Secao>

        <Secao titulo="Nome" dica="O único campo que o Instagram usa na busca — não é o @.">
          <div className="flex items-center gap-3">
            <input
              className={CAMPO}
              placeholder="Ana Ribeiro | Nutricionista"
              value={estado.nome}
              onChange={(e) => mudar('nome', e.target.value)}
            />
            <Contador valor={estado.nome} limite={30} />
          </div>
          {ehLocal && (
            <div className="mt-2">
              <label className="text-label-md text-mute">Cidade ou bairro (usado pelas regras)</label>
              <input
                className={`${CAMPO} mt-1`}
                placeholder="Moema"
                value={estado.cidade}
                onChange={(e) => mudar('cidade', e.target.value)}
              />
            </div>
          )}
          {bloco('nome')}
        </Secao>

        <Secao titulo="Usuário (@)" dica="Precisa sobreviver ao boca a boca: fácil de falar, escrever de ouvido e lembrar.">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">@</span>
            <input
              className={`${CAMPO} pl-7`}
              placeholder="anaribeironutri"
              value={estado.usuario}
              onChange={(e) => mudar('usuario', e.target.value.replace(/\s/g, ''))}
            />
          </div>
          {bloco('usuario')}
        </Secao>

        <Secao titulo="Bio" dica="Só a primeira linha aparece antes do “mais” — ela carrega o peso.">
          <div className="flex items-start gap-3">
            <textarea
              className={`${CAMPO} min-h-28 resize-y`}
              placeholder={'Nutrição esportiva pra quem treina pesado\nPlanos que cabem na rotina\nMe chama no direct 👇'}
              value={estado.bio}
              onChange={(e) => mudar('bio', e.target.value)}
            />
            <Contador valor={estado.bio} limite={150} />
          </div>
          {bloco('bio')}
        </Secao>

        <Secao titulo="Link e botão de ação" dica="O CTA precisa bater com o objetivo que você escolheu no passo 1.">
          <div className="space-y-2">
            <input
              className={CAMPO}
              placeholder="https://…"
              value={estado.link}
              onChange={(e) => mudar('link', e.target.value)}
            />
            <input
              className={CAMPO}
              placeholder="Texto do botão de ação (ex.: Enviar mensagem)"
              value={estado.ctaBotao}
              onChange={(e) => mudar('ctaBotao', e.target.value)}
            />
          </div>
          {bloco('link')}
        </Secao>

        <Secao
          titulo="Destaques"
          dica="Só os 4 primeiros aparecem sem rolar — ordene pela jornada: quem sou → prova → como funciona → como comprar."
        >
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {estado.destaques.map((d, i) => (
              <div key={i} className="space-y-1">
                <UploadImagem
                  formato="circulo"
                  imagem={imagens[`destaque-${i}`]}
                  onImagem={(du) => definirImagem(`destaque-${i}`, du)}
                  ladoMax={320}
                />
                <input
                  className="w-full rounded-sm border border-hairline bg-surface px-1.5 py-1 text-center text-caption text-ink placeholder:text-faint focus:border-emerald-400 focus:outline-none"
                  placeholder={`${i + 1}º nome`}
                  value={d.nome}
                  onChange={(e) => {
                    const novos = estado.destaques.map((x, j) => (j === i ? { nome: e.target.value } : x))
                    mudar('destaques', novos)
                  }}
                />
              </div>
            ))}
            {estado.destaques.length < 8 && (
              <button
                type="button"
                onClick={() => mudar('destaques', [...estado.destaques, { nome: '' }])}
                className="aspect-square self-start rounded-full border border-dashed border-hairline-strong text-faint transition-colors hover:border-emerald-400 hover:text-emerald-deep"
              >
                +
              </button>
            )}
          </div>
          {bloco('destaques')}
        </Secao>

        <Secao
          titulo="Grid — as 9 primeiras miniaturas"
          dica="É o cartão de visita. Olhe no preview em tamanho real: o texto das capas sobrevive?"
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-9 sm:gap-1.5">
            {Array.from({ length: 9 }, (_, i) => (
              <UploadImagem
                key={i}
                formato="retrato"
                imagem={imagens[`grid-${i}`]}
                onImagem={(du) => definirImagem(`grid-${i}`, du)}
                rotulo={`${i + 1}`}
              />
            ))}
          </div>
          {bloco('grid')}
        </Secao>

        <Secao
          titulo="Posts fixados"
          dica="Os 3 fixados são a home page do perfil — a combinação clássica: apresentação, prova social e oferta."
        >
          <div className="space-y-2">
            {estado.fixados.map((f, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex h-9 w-6 items-center justify-center text-label-md text-faint">{i + 1}º</span>
                <input
                  className={CAMPO}
                  placeholder="Sobre o que é esse post?"
                  value={f.titulo}
                  onChange={(e) => {
                    const novos = estado.fixados.map((x, j) => (j === i ? { ...x, titulo: e.target.value } : x))
                    mudar('fixados', novos)
                  }}
                />
                <select
                  className={`${CAMPO} w-44 shrink-0`}
                  value={f.papel}
                  onChange={(e) => {
                    const papel = e.target.value as PapelFixado | ''
                    const novos = estado.fixados.map((x, j) => (j === i ? { ...x, papel } : x))
                    mudar('fixados', novos)
                  }}
                >
                  <option value="">papel…</option>
                  <option value="apresentacao">Apresentação</option>
                  <option value="prova">Prova social</option>
                  <option value="oferta">Oferta</option>
                </select>
              </div>
            ))}
          </div>
          {bloco('fixados')}
        </Secao>
      </div>

      {/* ── preview ─────────────────────────────────────────────────── */}
      <div className="shrink-0 lg:sticky lg:top-6 lg:self-start">
        <PreviewInstagram
          rotulo="Preview — como quem chega vê"
          foto={imagens['foto']}
          nome={estado.nome}
          usuario={estado.usuario}
          bio={estado.bio}
          link={estado.link}
          ctaBotao={estado.ctaBotao}
          destaques={estado.destaques.map((d, i) => ({ nome: d.nome, capa: imagens[`destaque-${i}`] }))}
          grid={Array.from({ length: 9 }, (_, i) => imagens[`grid-${i}`])}
          pinos={estado.fixados.map((f) => Boolean(f.titulo.trim() || f.papel))}
          mostrarMini
        />
      </div>
    </div>
  )
}

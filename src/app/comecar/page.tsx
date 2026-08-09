import Link from 'next/link'
import { Logo } from '@/components/Logo'

/** A escolha — analisar o que existe ou construir o que falta. */
export default function Comecar() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <Link href="/" className="w-fit transition-opacity hover:opacity-70" title="Voltar ao início">
        <Logo className="h-5" />
      </Link>

      <h1 className="mt-8 text-heading-lg">Por onde você quer começar?</h1>
      <p className="mt-2 max-w-xl text-body-lg text-mute">
        Os dois usam o mesmo motor de regras — e um alimenta o outro: a análise pode virar o ponto
        de partida da construção.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/diagnostico"
          className="ds-card group p-6 transition-colors hover:border-emerald-400"
        >
          <span className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-mute">
            Olha pra trás
          </span>
          <h2 className="mt-2 text-heading-md group-hover:text-emerald-deep">
            Analise seu Instagram
          </h2>
          <p className="mt-1.5 text-body-sm text-mute">
            Um perfil que já existe — o seu ou de um concorrente. Cole o que ele mostra e receba o
            que está errado, com o porquê e como resolver.
          </p>
          <span className="mt-4 inline-block text-label-md font-medium text-emerald-deep">
            Analisar →
          </span>
        </Link>

        <Link
          href="/construtor"
          className="ds-card group p-6 transition-colors hover:border-emerald-400"
        >
          <span className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-mute">
            Olha pra frente
          </span>
          <h2 className="mt-2 text-heading-md group-hover:text-emerald-deep">
            Construa seu novo Perfil
          </h2>
          <p className="mt-1.5 text-body-sm text-mute">
            Campo a campo, com preview ao vivo, painel de coerência, antes/depois e o kit pronto
            pra aplicar. Sessão de 30–40 minutos.
          </p>
          <span className="mt-4 inline-block text-label-md font-medium text-emerald-deep">
            Construir →
          </span>
        </Link>
      </div>

      <Link
        href="/exemplos"
        className="ds-card group mt-4 flex items-center justify-between gap-4 p-5 transition-colors hover:border-emerald-400"
      >
        <div>
          <h2 className="text-heading-sm group-hover:text-emerald-deep">Exemplos comentados</h2>
          <p className="mt-1 text-body-sm text-mute">
            Um perfil-modelo por objetivo, com o motivo de cada escolha. Trave menos por falta de
            referência.
          </p>
        </div>
        <span className="shrink-0 text-label-md font-medium text-emerald-deep">Ver →</span>
      </Link>
    </main>
  )
}

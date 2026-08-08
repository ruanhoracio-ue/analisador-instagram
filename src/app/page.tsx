import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

/** Primeira dobra — explica o que o app faz antes de qualquer escolha. */
export default function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-[1000px] flex-col px-6">
      <header className="flex items-center justify-between py-5">
        <Logo className="h-5" />
        <ThemeToggle />
      </header>

      <section className="flex flex-1 flex-col justify-center pb-24">
        <p className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-emerald-deep">
          Analise · Construa · Aplique
        </p>
        <h1 className="mt-4 max-w-3xl text-heading-xl">
          Seu perfil tem 3 segundos pra convencer quem chega.{' '}
          <span className="text-brand-gradient">Este app te mostra se ele convence</span> — e o
          porquê.
        </h1>
        <p className="mt-5 max-w-xl text-body-lg text-mute">
          Analise o perfil que você tem, construa o perfil que você precisa e saia com o kit pronto
          pra aplicar. Sem texto pronto de robô: o app aponta o problema, explica o motivo e a
          decisão fica sua — do jeito que quem aprende de verdade faz.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link href="/comecar" className="shiny-cta px-8 py-3.5 text-label-lg">
            <span className="shiny-dots" aria-hidden="true" />
            <span className="shiny-cta-content">Começar agora →</span>
          </Link>
          <Link
            href="/exemplos"
            className="text-label-lg font-medium text-mute transition-colors hover:text-emerald-deep"
          >
            Ver exemplos comentados
          </Link>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {[
            ['1', 'Analise seu Instagram', 'Cole o que seu perfil mostra e veja o que está travando ele — com o porquê de cada item.'],
            ['2', 'Construa seu novo perfil', 'Campo por campo, com preview idêntico ao Instagram e avisos a cada tecla.'],
            ['3', 'Aplique com o kit', 'Nome, bio, destaques e fixados prontos pra copiar e colar — com as quebras certas.'],
          ].map(([n, titulo, texto]) => (
            <div key={n} className="ds-card p-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/[0.08] text-label-md font-semibold text-ink">
                {n}
              </span>
              <h2 className="mt-2.5 text-heading-sm">{titulo}</h2>
              <p className="mt-1 text-body-sm text-mute">{texto}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

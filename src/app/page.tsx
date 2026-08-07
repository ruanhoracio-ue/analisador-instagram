import Link from 'next/link'
import { Logo } from '@/components/Logo'

/** Home — os dois módulos, independentes: diagnóstico olha pra trás, construtor olha pra frente. */
export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <Logo className="h-6" />
      <h1 className="mt-6 text-heading-xl">
        Seu perfil, coerente com o <span className="text-brand-gradient">seu objetivo</span>
      </h1>
      <p className="mt-3 max-w-xl text-body-lg text-mute">
        O app não escreve o perfil por você — ele reage ao que você escreve, aponta o problema e
        explica o porquê. Quem sai daqui sabendo o motivo, escreve sozinho na próxima.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/diagnostico"
          className="ds-card group p-6 transition-colors hover:border-emerald-400"
        >
          <span className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-mute">
            Olha pra trás
          </span>
          <h2 className="mt-2 text-heading-md group-hover:text-emerald-deep">Diagnóstico</h2>
          <p className="mt-1.5 text-body-sm text-mute">
            Um perfil que já existe — o seu ou de um concorrente. Cole o que ele mostra e receba o
            que está errado, com o porquê de cada item.
          </p>
          <span className="mt-4 inline-block text-label-md font-medium text-emerald-deep">
            Analisar um perfil →
          </span>
        </Link>

        <Link
          href="/construtor"
          className="ds-card group p-6 transition-colors hover:border-emerald-400"
        >
          <span className="text-eyebrow uppercase tracking-[0.06em] font-semibold text-mute">
            Olha pra frente
          </span>
          <h2 className="mt-2 text-heading-md group-hover:text-emerald-deep">Construtor</h2>
          <p className="mt-1.5 text-body-sm text-mute">
            Monte o perfil campo a campo com preview ao vivo, painel de coerência, antes/depois e o
            kit pronto pra aplicar. Sessão de 30–40 minutos.
          </p>
          <span className="mt-4 inline-block text-label-md font-medium text-emerald-deep">
            Montar meu perfil →
          </span>
        </Link>
      </div>

      <p className="mt-8 text-caption text-faint">
        Os dois usam o mesmo motor de regras — melhorar uma regra melhora os dois.
      </p>
    </main>
  )
}

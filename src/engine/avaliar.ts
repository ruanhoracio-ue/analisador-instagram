/**
 * O motor: recebe um Perfil, devolve a avaliação completa.
 * Puro, sem React — plugável no construtor hoje e no diagnóstico amanhã.
 */
import { REGRAS } from '@/data/regras'
import type { Avaliacao, Bloco, Perfil, Regra, Severidade } from './tipos'
import { BLOCOS } from './tipos'

/** peso de cada severidade no cálculo da nota por bloco */
const PESO: Record<Severidade, number> = {
  critica: 4,
  importante: 2,
  refino: 1,
}

const RANK: Record<Severidade, number> = {
  critica: 0,
  importante: 1,
  refino: 2,
}

/** a regra vale para este perfil? (objetivo é o eixo; tipo ajusta o recorte) */
export function aplicaA(regra: Regra, perfil: Perfil): boolean {
  const porObjetivo =
    regra.aplicaObjetivos === 'todos' || regra.aplicaObjetivos.includes(perfil.objetivo)
  const porTipo = regra.aplicaTipos === 'todos' || regra.aplicaTipos.includes(perfil.tipo)
  return porObjetivo && porTipo
}

export function regrasAplicaveis(perfil: Perfil, regras: Regra[] = REGRAS): Regra[] {
  return regras.filter((r) => aplicaA(r, perfil))
}

/**
 * Avalia o perfil contra as regras.
 * @param confirmados ids de self-checks que a pessoa já marcou como ok
 */
export function avaliar(
  perfil: Perfil,
  confirmados: ReadonlySet<string> = new Set(),
  regras: Regra[] = REGRAS,
): Avaliacao {
  const aplicaveis = regrasAplicaveis(perfil, regras)

  const violadas = aplicaveis.filter((r) => r.kind === 'auto' && r.condicao!(perfil))
  const checks = aplicaveis.filter((r) => r.kind === 'self-check')

  /* Nota por bloco: parte de 10 e perde proporcionalmente ao peso das regras
     violadas sobre o peso total aplicável ao bloco. Self-check não confirmado
     desconta metade do peso — a pessoa ainda não conferiu, mas ninguém disse
     que está errado. Uma CRÍTICA em aberto trava o bloco em no máximo 3:
     crítica é "tem que resolver", e a nota precisa dizer isso. */
  const notas = {} as Record<Bloco, number>
  for (const bloco of BLOCOS) {
    const doBloco = aplicaveis.filter((r) => r.bloco === bloco)
    const total = doBloco.reduce((s, r) => s + PESO[r.severidade], 0)
    if (total === 0) {
      notas[bloco] = 10
      continue
    }
    let perdido = 0
    let criticaAberta = false
    for (const r of doBloco) {
      if (r.kind === 'auto') {
        if (r.condicao!(perfil)) {
          perdido += PESO[r.severidade]
          if (r.severidade === 'critica') criticaAberta = true
        }
      } else if (!confirmados.has(r.id)) {
        perdido += PESO[r.severidade] / 2
      }
    }
    const proporcional = Math.round(10 * (1 - perdido / total))
    notas[bloco] = criticaAberta ? Math.min(proporcional, 3) : proporcional
  }

  /* Próximo passo único: a violação mais grave; empate resolve pela ordem do
     arquivo de regras (impacto). Sem violação auto, cai no primeiro
     self-check não confirmado. Uma mudança por vez — lista longa trava. */
  const ordenar = (a: Regra, b: Regra) => RANK[a.severidade] - RANK[b.severidade]
  const proximoPasso =
    [...violadas].sort(ordenar)[0] ??
    checks.filter((r) => !confirmados.has(r.id)).sort(ordenar)[0] ??
    null

  return { violadas, checks, notas, proximoPasso }
}

/** violações e checks de um bloco específico — usado pela UI campo a campo */
export function avaliacaoDoBloco(av: Avaliacao, bloco: Bloco) {
  return {
    violadas: av.violadas.filter((r) => r.bloco === bloco),
    checks: av.checks.filter((r) => r.bloco === bloco),
    nota: av.notas[bloco],
  }
}

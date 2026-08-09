/**
 * Tipos do motor de regras — módulo puro, sem dependência de React.
 * O motor recebe um objeto Perfil (montado no construtor hoje; vindo de uma
 * captura externa amanhã) e devolve as regras violadas + notas por bloco.
 */

export type Tipo = 'pessoa' | 'criador' | 'negocio'

/** O objetivo é o eixo do app — é ele que muda as regras, não o tipo. */
export type Objetivo = 'direct' | 'link' | 'seguir' | 'local' | 'contratar'

export type Bloco =
  | 'foto'
  | 'nome'
  | 'usuario'
  | 'bio'
  | 'link'
  | 'destaques'
  | 'grid'
  | 'fixados'

export type Severidade = 'critica' | 'importante' | 'refino'

export interface Destaque {
  nome: string
  /** referência da capa (id no IndexedDB ou dataURL) — pro motor importa a presença */
  capa?: string
}

export interface ItemGrid {
  imagem?: string
}

export type PapelFixado = 'apresentacao' | 'prova' | 'oferta'

export interface Fixado {
  titulo?: string
  imagem?: string
  papel?: PapelFixado
}

export interface Perfil {
  tipo: Tipo
  objetivo: Objetivo
  foto?: string
  nome: string
  usuario: string
  bio: string
  link: string
  /** texto do botão de ação (ex.: "Enviar mensagem", "Comprar agora") */
  ctaBotao: string
  /** cidade/bairro — usado pelas regras do objetivo "local" */
  cidade?: string
  destaques: Destaque[]
  /** primeiras 9 miniaturas do grid */
  grid: ItemGrid[]
  /** 3 posts fixados */
  fixados: Fixado[]
  /** números que só a captura automática traz — ausentes na entrada manual */
  seguidores?: number
  totalPosts?: number
}

export interface Regra {
  id: string
  bloco: Bloco
  severidade: Severidade
  /** a quais objetivos a regra se aplica — 'todos' ou lista explícita */
  aplicaObjetivos: Objetivo[] | 'todos'
  aplicaTipos: Tipo[] | 'todos'
  /**
   * 'auto' — o motor avalia sozinho a cada tecla (condicao obrigatória).
   * 'self-check' — o que a máquina não enxerga (foto, coerência visual):
   * vira um item de checklist que a própria pessoa confirma.
   */
  kind: 'auto' | 'self-check'
  /** true = regra VIOLADA. Presente apenas nas regras 'auto'. */
  condicao?: (p: Perfil) => boolean
  /**
   * O trecho DO PERFIL que disparou a regra — citar o que a pessoa escreveu
   * é o que separa "sua bio é genérica" de "«transformando vidas» é genérico".
   * Devolve null quando não há trecho a destacar.
   */
  evidencia?: (p: Perfil) => string | null
  /** o que está errado, curto e direto */
  mensagem: string
  /** a razão, em uma frase, em linguagem simples — nunca sai sem ela */
  porque: string
  /**
   * Como resolver: a FÓRMULA, não o texto pronto. O app não escreve o perfil
   * pela pessoa — mostra a forma e deixa ela preencher com o que é dela.
   */
  comoResolver?: string
  /** exemplo curto da fórmula aplicada, para a forma ficar concreta */
  exemplo?: string
  /** dito quando a regra PASSA — ensina o que já está certo (só nas 'auto') */
  elogio?: string
}

/**
 * Regra violada + o trecho do perfil que a disparou. Estende Regra, então
 * tudo que já lia uma Regra continua valendo.
 */
export interface RegraViolada extends Regra {
  /** o que a pessoa escreveu e fez a regra disparar; null quando não há trecho */
  trecho: string | null
}

export interface Avaliacao {
  /** regras 'auto' violadas, na ordem de impacto do arquivo de regras */
  violadas: RegraViolada[]
  /** regras 'auto' que passaram e têm elogio — o que já está certo */
  acertos: Regra[]
  /** self-checks aplicáveis ao perfil (a UI marca as confirmadas) */
  checks: Regra[]
  /** nota 0–10 por bloco — nota geral única vira jogo de otimizar número */
  notas: Record<Bloco, number>
  /** a mudança mais impactante agora — uma só; o aluno trava por excesso */
  proximoPasso: Regra | null
}

export const BLOCOS: Bloco[] = [
  'foto',
  'nome',
  'usuario',
  'bio',
  'link',
  'destaques',
  'grid',
  'fixados',
]

export const OBJETIVOS: { id: Objetivo; rotulo: string }[] = [
  { id: 'direct', rotulo: 'Me chamar no direct' },
  { id: 'link', rotulo: 'Clicar no link e comprar' },
  { id: 'seguir', rotulo: 'Me seguir e acompanhar' },
  { id: 'local', rotulo: 'Ir até minha loja ou consultório' },
  { id: 'contratar', rotulo: 'Me contratar / ver meu trabalho' },
]

export const TIPOS: { id: Tipo; rotulo: string }[] = [
  { id: 'pessoa', rotulo: 'Pessoa' },
  { id: 'criador', rotulo: 'Criador de conteúdo' },
  { id: 'negocio', rotulo: 'Negócio' },
]

export function perfilVazio(tipo: Tipo = 'pessoa', objetivo: Objetivo = 'direct'): Perfil {
  return {
    tipo,
    objetivo,
    nome: '',
    usuario: '',
    bio: '',
    link: '',
    ctaBotao: '',
    destaques: [
      { nome: '' },
      { nome: '' },
      { nome: '' },
      { nome: '' },
    ],
    grid: Array.from({ length: 9 }, () => ({})),
    fixados: [{}, {}, {}],
  }
}

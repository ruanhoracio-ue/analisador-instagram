/**
 * Helpers de texto do motor — a "lógica" que as regras usam nas condições.
 * As listas de dados (frases genéricas, sinais de ofício…) vivem em src/data.
 */
import { AGREGADORES_LINK, SINAIS_OFICIO } from '@/data/listas'

/** minúsculas + sem acentos, para comparação tolerante */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function normContem(texto: string, trecho: string): boolean {
  if (!trecho.trim()) return false
  return normalizar(texto).includes(normalizar(trecho))
}

/**
 * Localiza um dos padrões dentro do texto e devolve o TRECHO ORIGINAL — com
 * os acentos e maiúsculas que a pessoa digitou. Citar o texto dela é o que
 * torna o aviso específico; devolver o padrão normalizado pareceria robô.
 */
export function encontrarTrecho(texto: string, padroes: readonly string[]): string | null {
  // mapa de índice: normalizado → original (a normalização remove acentos,
  // então os comprimentos divergem)
  let norm = ''
  const mapa: number[] = []
  for (let i = 0; i < texto.length; i++) {
    const n = texto[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    for (const ch of n) {
      norm += ch
      mapa.push(i)
    }
  }
  for (const padrao of padroes) {
    const alvo = normalizar(padrao)
    const pos = norm.indexOf(alvo)
    if (pos !== -1) {
      const ini = mapa[pos]
      const fim = mapa[pos + alvo.length - 1] + 1
      return texto.slice(ini, fim)
    }
  }
  return null
}

/** contagem de caracteres como o Instagram conta (por code point, emoji = 1+) */
export function tamanho(s: string): number {
  return [...s].length
}

export function primeiraLinha(s: string): string {
  return s.split('\n')[0] ?? ''
}

const EMOJI_RE = /\p{Extended_Pictographic}/gu

export function contarEmojis(s: string): number {
  return (s.match(EMOJI_RE) ?? []).length
}

/** frases que empurram pro link — exportadas pra evidência citar a que apareceu */
export const PADROES_LINK = [
  'link na bio',
  'clique no link',
  'clica no link',
  'acesse o link',
  'acessa o link',
  'toque no link',
  'link abaixo',
  'link aqui',
  'no link',
  'pelo link',
  'garanta o seu',
  'compre agora',
  'comprar agora',
  'site na bio',
  'acesse o site',
  'garanta sua vaga',
] as const

/** frases que convidam pro direct */
export const PADROES_DIRECT = [
  'chama no direct',
  'chama na dm',
  'me chama',
  'chame no direct',
  'manda mensagem',
  'mande mensagem',
  'manda um oi',
  'manda uma mensagem',
  'fala comigo',
  'fale comigo',
  'me manda',
  'enviar mensagem',
  'envie mensagem',
  'agende pelo direct',
  'agenda pelo direct',
] as const

/** o texto empurra a pessoa para o link? */
export function apontaParaLink(s: string): boolean {
  const n = normalizar(s)
  return PADROES_LINK.some((p) => n.includes(p))
}

/** o texto convida explicitamente para conversa no direct? */
export function convidaParaDirect(s: string): boolean {
  const n = normalizar(s)
  if (PADROES_DIRECT.some((p) => n.includes(p))) return true
  return /\b(direct|dm|inbox)\b/.test(n)
}

/** o link é um agregador (linktree e afins) que dilui o clique? */
export function linkEhAgregador(link: string): boolean {
  const n = normalizar(link)
  return AGREGADORES_LINK.some((d) => n.includes(d))
}

/**
 * Heurística: o campo Nome parece conter APENAS o nome próprio, sem indicar
 * o que a pessoa faz. Sinais de que há mais do que nome: separadores
 * (| · • — /), dígitos, mais de 4 palavras, ou uma palavra de ofício.
 */
export function pareceSoNomeProprio(nome: string): boolean {
  const bruto = nome.trim()
  if (!bruto) return false // vazio é outra regra
  if (/[|•·\-–—/:+,]/.test(bruto)) return false
  if (/\d/.test(bruto)) return false
  const palavras = normalizar(bruto).split(/\s+/)
  if (palavras.length > 4) return false
  const temOficio = palavras.some(
    (w) =>
      w === 'dr' ||
      w === 'dra' ||
      SINAIS_OFICIO.some((s) => w.startsWith(s)),
  )
  return !temOficio
}

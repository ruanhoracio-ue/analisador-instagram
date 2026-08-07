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

/** o texto empurra a pessoa para o link? */
export function apontaParaLink(s: string): boolean {
  const n = normalizar(s)
  return [
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
  ].some((p) => n.includes(p))
}

/** o texto convida explicitamente para conversa no direct? */
export function convidaParaDirect(s: string): boolean {
  const n = normalizar(s)
  if (
    [
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
    ].some((p) => n.includes(p))
  ) {
    return true
  }
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

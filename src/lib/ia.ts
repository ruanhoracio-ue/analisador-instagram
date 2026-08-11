/**
 * Análise com IA (OpenAI) — a leitura de estrategista que as regras fixas não
 * alcançam: nicho, posicionamento, o que o perfil deixa na mesa.
 *
 * Princípio inegociável, o mesmo do app inteiro: a IA NÃO escreve o perfil
 * pela pessoa. Ela aponta, explica o porquê e dá a fórmula; exemplo curto é
 * permitido como ilustração, nunca como texto pronto pra colar inteiro.
 *
 * Módulo puro: sem React, sem Next. A chave nunca sai do servidor.
 */

export interface EntradaIA {
  objetivo: string
  tipo: string
  usuario: string
  nome: string
  bio: string
  link: string
  ctaBotao: string
  seguidores?: number
  totalPosts?: number
  diasDesdeUltimoPost?: number
  legendasRecentes?: string[]
  /** o que as regras fixas já apontaram — pra IA complementar, não repetir */
  jaApontado: string[]
}

export interface OportunidadeIA {
  titulo: string
  porque: string
  comoResolver: string
  exemplo?: string
}

export interface AnaliseIA {
  /** o nicho/posicionamento como a IA leu — mostra que ela olhou ESTE perfil */
  leitura: string
  forcas: string[]
  oportunidades: OportunidadeIA[]
  proximaAcao: string
}

export type FalhaIA =
  | 'sem-configuracao'
  | 'chave-invalida'
  | 'limite-excedido'
  | 'resposta-invalida'
  | 'erro-openai'

export class ErroIA extends Error {
  constructor(
    readonly tipo: FalhaIA,
    mensagem: string,
    readonly saida: string,
  ) {
    super(mensagem)
    this.name = 'ErroIA'
  }
}

const MODELO_PADRAO = 'gpt-4o-mini'

const SCHEMA = {
  name: 'analise_perfil',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['leitura', 'forcas', 'oportunidades', 'proximaAcao'],
    properties: {
      leitura: { type: 'string' },
      forcas: { type: 'array', items: { type: 'string' } },
      oportunidades: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['titulo', 'porque', 'comoResolver', 'exemplo'],
          properties: {
            titulo: { type: 'string' },
            porque: { type: 'string' },
            comoResolver: { type: 'string' },
            exemplo: { type: ['string', 'null'] },
          },
        },
      },
      proximaAcao: { type: 'string' },
    },
  },
} as const

const SISTEMA = `Você é estrategista sênior de Instagram da escola Instagram Extremo, analisando perfis para alunos de marketing.

REGRAS INEGOCIÁVEIS:
1. Seja ESPECÍFICO a este perfil e a este nicho — nada que sirva para qualquer conta. Cite trechos do que a pessoa escreveu (entre aspas) sempre que apontar algo.
2. NÃO escreva a bio/nome prontos para colar. Dê a fórmula e o caminho; um exemplo curto aplicado ao nicho é permitido como ilustração.
3. Todo apontamento vem com o PORQUÊ em linguagem simples — o aluno precisa aprender a decisão, não decorar o texto.
4. Não repita o que as regras automáticas já apontaram (você recebe a lista); complemente com o que só uma leitura de estrategista enxerga: posicionamento, promessa, prova, coerência entre conteúdo e objetivo, ângulo do nicho.
5. Escreva em português do Brasil, direto, sem jargão.
6. "forcas": 2 a 4 itens. "oportunidades": 3 a 5, em ordem de impacto. "proximaAcao": UMA ação concreta para hoje.
7. Se os dados forem escassos, diga o que não dá para avaliar em vez de inventar.`

export function montarMensagens(e: EntradaIA): { role: string; content: string }[] {
  const legendas =
    e.legendasRecentes?.length
      ? e.legendasRecentes.map((l, i) => `  ${i + 1}. ${l.slice(0, 300)}`).join('\n')
      : '  (não disponíveis)'

  const numeros = [
    e.seguidores !== undefined ? `${e.seguidores} seguidores` : null,
    e.totalPosts !== undefined ? `${e.totalPosts} posts` : null,
    e.diasDesdeUltimoPost !== undefined ? `último post há ${e.diasDesdeUltimoPost} dias` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const conteudo = `PERFIL ANALISADO
@${e.usuario || '(sem @)'} — tipo: ${e.tipo} — objetivo declarado: ${e.objetivo}
Nome: ${e.nome || '(vazio)'}
Bio:
${e.bio || '(vazia)'}
Link: ${e.link || '(sem link)'}
Botão de ação: ${e.ctaBotao || '(nenhum)'}
Números: ${numeros || '(não disponíveis)'}
Legendas dos posts recentes:
${legendas}

O QUE AS REGRAS AUTOMÁTICAS JÁ APONTARAM (não repita):
${e.jaApontado.length ? e.jaApontado.map((a) => `- ${a}`).join('\n') : '- nada'}
`
  return [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: conteudo },
  ]
}

export async function analisarComIA(
  entrada: EntradaIA,
  chave: string,
  modelo: string = MODELO_PADRAO,
  fetchImpl: typeof fetch = fetch,
): Promise<AnaliseIA> {
  let resposta: Response
  try {
    resposta = await fetchImpl('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${chave}`,
      },
      body: JSON.stringify({
        model: modelo,
        messages: montarMensagens(entrada),
        response_format: { type: 'json_schema', json_schema: SCHEMA },
        temperature: 0.4,
      }),
    })
  } catch {
    throw new ErroIA(
      'erro-openai',
      'não foi possível falar com a OpenAI',
      'Tente de novo em instantes — a análise por regras acima continua valendo.',
    )
  }

  if (!resposta.ok) {
    throw traduzirErroHttp(resposta.status)
  }

  const corpo = (await resposta.json().catch(() => null)) as {
    choices?: { message?: { content?: string } }[]
  } | null

  const texto = corpo?.choices?.[0]?.message?.content
  if (!texto) {
    throw new ErroIA(
      'resposta-invalida',
      'a OpenAI devolveu uma resposta vazia',
      'Tente de novo — se persistir, o modelo configurado pode não suportar saída estruturada.',
    )
  }

  let dados: AnaliseIA
  try {
    dados = JSON.parse(texto) as AnaliseIA
  } catch {
    throw new ErroIA(
      'resposta-invalida',
      'a resposta da IA veio num formato inesperado',
      'Tente de novo — foi um tropeço pontual do modelo.',
    )
  }

  if (!dados.leitura || !Array.isArray(dados.oportunidades)) {
    throw new ErroIA(
      'resposta-invalida',
      'a resposta da IA veio incompleta',
      'Tente de novo — foi um tropeço pontual do modelo.',
    )
  }
  return dados
}

function traduzirErroHttp(status: number): ErroIA {
  if (status === 401) {
    return new ErroIA(
      'chave-invalida',
      'a chave da OpenAI foi recusada',
      'Confira a OPENAI_API_KEY no painel da hospedagem — a chave pode ter sido revogada. (Admin: DEPLOY.md)',
    )
  }
  if (status === 429) {
    return new ErroIA(
      'limite-excedido',
      'limite ou créditos da OpenAI esgotados no momento',
      'Espere um pouco e tente de novo — ou confira os créditos da conta na OpenAI.',
    )
  }
  return new ErroIA(
    'erro-openai',
    `erro da OpenAI (HTTP ${status})`,
    'Tente de novo em instantes — a análise por regras acima continua valendo.',
  )
}

/**
 * Captura de perfil via Instagram Graph API — endpoint Business Discovery.
 *
 * Caminho oficial e dentro dos termos: a conta conectada (a sua, Comercial ou
 * Criador) consulta dados PÚBLICOS de outra conta Profissional. Perfil pessoal
 * comum não é alcançável por esse endpoint — é limite da API, não do app.
 *
 * Módulo puro, sem React e sem Next: só fala HTTP e devolve dados normalizados.
 * O token nunca sai do servidor.
 */

export interface PerfilCapturado {
  usuario: string
  nome: string
  bio: string
  link: string
  foto: string | null
  seguidores: number | null
  posts: number | null
  /** capas das primeiras miniaturas, na ordem do grid */
  miniaturas: string[]
}

/** por que a captura falhou — cada caso tem uma saída diferente na tela */
export type FalhaCaptura =
  | 'sem-configuracao'
  | 'usuario-invalido'
  | 'nao-encontrado'
  | 'nao-profissional'
  | 'token-invalido'
  | 'permissao-faltando'
  | 'limite-excedido'
  | 'erro-instagram'

export class ErroCaptura extends Error {
  constructor(
    readonly tipo: FalhaCaptura,
    mensagem: string,
    /** o que a pessoa pode fazer agora */
    readonly saida: string,
  ) {
    super(mensagem)
    this.name = 'ErroCaptura'
  }
}

/**
 * Aceita o que a pessoa tiver na mão: @usuario, usuario, ou a URL do perfil
 * (com ou sem https, com ou sem barra e parâmetros).
 */
export function extrairUsuario(entrada: string): string | null {
  const bruto = entrada.trim()
  if (!bruto) return null

  let candidato = bruto
  const comoUrl = bruto.replace(/^https?:\/\//i, '')
  if (/^(www\.)?instagram\.com\//i.test(comoUrl)) {
    candidato = comoUrl.replace(/^(www\.)?instagram\.com\//i, '').split(/[/?#]/)[0] ?? ''
  }

  candidato = candidato.replace(/^@/, '').split(/[/?#]/)[0] ?? ''
  // regra do Instagram: letras, números, ponto e underline, até 30
  return /^[A-Za-z0-9._]{1,30}$/.test(candidato) ? candidato.toLowerCase() : null
}

const VERSAO = 'v21.0'

/** permissões que o Business Discovery exige do token */
export const PERMISSOES_NECESSARIAS = [
  'instagram_basic',
  'pages_show_list',
  'pages_read_engagement',
  'business_management',
] as const

export interface EstadoDoToken {
  ok: boolean
  concedidas: string[]
  faltando: string[]
  recusadas: string[]
  /** o @ da conta Instagram alcançada, quando as permissões já bastam */
  contaEncontrada: string | null
  diagnostico: string
}

/**
 * Diz o que o token realmente carrega — sem nunca devolver o token.
 *
 * Existe porque a variável de ambiente é opaca depois de salva: quem
 * configura não consegue reler o valor pra conferir, e o erro que chega
 * ("sem permissão") não distingue token errado de permissão faltando.
 */
export async function verificarToken(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<EstadoDoToken> {
  const url =
    `https://graph.facebook.com/${VERSAO}/me/permissions` +
    `?access_token=${encodeURIComponent(token)}`

  let dados: {
    data?: { permission?: string; status?: string }[]
    error?: NonNullable<RespostaBD['error']>
  }
  try {
    const resposta = await fetchImpl(url, { headers: { accept: 'application/json' } })
    dados = await resposta.json()
  } catch {
    return {
      ok: false,
      concedidas: [],
      faltando: [...PERMISSOES_NECESSARIAS],
      recusadas: [],
      contaEncontrada: null,
      diagnostico: 'Não consegui falar com o Facebook para conferir o token.',
    }
  }

  if (dados.error) {
    const erro = traduzirErro(dados.error, '')
    return {
      ok: false,
      concedidas: [],
      faltando: [...PERMISSOES_NECESSARIAS],
      recusadas: [],
      contaEncontrada: null,
      diagnostico: `${erro.message}. ${erro.saida}`,
    }
  }

  const itens = dados.data ?? []
  const concedidas = itens.filter((p) => p.status === 'granted').map((p) => p.permission ?? '')
  const recusadas = itens.filter((p) => p.status === 'declined').map((p) => p.permission ?? '')
  const faltando = PERMISSOES_NECESSARIAS.filter((p) => !concedidas.includes(p))

  if (faltando.length > 0) {
    return {
      ok: false,
      concedidas,
      faltando,
      recusadas,
      contaEncontrada: null,
      diagnostico:
        'O token está válido, mas foi gerado sem todas as permissões. No Graph API Explorer, marque as permissões que faltam e clique em Generate Access Token DE NOVO — o token só recebe as permissões no momento em que é gerado.',
    }
  }

  // permissões ok: falta saber se há conta Instagram profissional alcançável
  try {
    const id = await descobrirContaId(token, fetchImpl)
    return {
      ok: true,
      concedidas,
      faltando: [],
      recusadas,
      contaEncontrada: id,
      diagnostico: 'Tudo certo: token com as permissões e conta Instagram encontrada.',
    }
  } catch (e) {
    const msg = e instanceof ErroCaptura ? `${e.message}. ${e.saida}` : 'erro ao procurar a conta'
    return { ok: false, concedidas, faltando: [], recusadas, contaEncontrada: null, diagnostico: msg }
  }
}

/**
 * Descobre o ID da conta Instagram profissional a partir do próprio token.
 *
 * Existe pra poupar quem configura: o ID é derivável do token, então pedir
 * os dois é pedir duas vezes a mesma coisa — e é justo aí que a configuração
 * costuma quebrar, com o ID errado colado no lugar certo.
 */
export async function descobrirContaId(
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const url =
    `https://graph.facebook.com/${VERSAO}/me/accounts` +
    `?fields=instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`

  let resposta: Response
  try {
    resposta = await fetchImpl(url, { headers: { accept: 'application/json' } })
  } catch {
    throw new ErroCaptura(
      'erro-instagram',
      'não foi possível falar com o Instagram',
      'Tente de novo em instantes — ou preencha os campos na mão.',
    )
  }

  const dados = (await resposta.json().catch(() => ({}))) as {
    data?: { instagram_business_account?: { id?: string } }[]
    error?: NonNullable<RespostaBD['error']>
  }

  if (dados.error) throw traduzirErro(dados.error, '')

  const id = dados.data?.find((p) => p.instagram_business_account?.id)?.instagram_business_account
    ?.id
  if (!id) {
    throw new ErroCaptura(
      'sem-configuracao',
      'nenhuma conta Instagram profissional ligada a este acesso',
      'A conta do Instagram precisa ser Comercial ou Criador e estar conectada a uma Página do Facebook. Veja o DEPLOY.md.',
    )
  }
  return id
}

interface RespostaBD {
  business_discovery?: {
    username?: string
    name?: string
    biography?: string
    website?: string
    profile_picture_url?: string
    followers_count?: number
    media_count?: number
    media?: { data?: { media_url?: string; thumbnail_url?: string; media_type?: string }[] }
  }
  error?: { message?: string; code?: number; error_subcode?: number; type?: string }
}

/**
 * Busca o perfil. `contaId` é o ID da SUA conta Instagram profissional e
 * `token` o access token — ambos vêm de variável de ambiente, no servidor.
 */
export async function buscarPerfil(
  usuarioAlvo: string,
  contaId: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<PerfilCapturado> {
  const campos = [
    'username',
    'name',
    'biography',
    'website',
    'profile_picture_url',
    'followers_count',
    'media_count',
    'media.limit(9){media_url,thumbnail_url,media_type}',
  ].join(',')

  const url =
    `https://graph.facebook.com/${VERSAO}/${encodeURIComponent(contaId)}` +
    `?fields=business_discovery.username(${encodeURIComponent(usuarioAlvo)}){${campos}}` +
    `&access_token=${encodeURIComponent(token)}`

  let resposta: Response
  try {
    resposta = await fetchImpl(url, { headers: { accept: 'application/json' } })
  } catch {
    throw new ErroCaptura(
      'erro-instagram',
      'não foi possível falar com o Instagram',
      'Tente de novo em instantes — ou preencha os campos na mão, logo abaixo.',
    )
  }

  const dados = (await resposta.json().catch(() => ({}))) as RespostaBD

  if (dados.error) {
    throw traduzirErro(dados.error, usuarioAlvo)
  }

  const bd = dados.business_discovery
  if (!bd?.username) {
    throw new ErroCaptura(
      'nao-encontrado',
      `perfil @${usuarioAlvo} não encontrado`,
      'Confira se o @ está certo. Perfis pessoais e privados não são alcançáveis pela API — nesses casos, preencha na mão.',
    )
  }

  const miniaturas = (bd.media?.data ?? [])
    .map((m) => (m.media_type === 'VIDEO' ? m.thumbnail_url : m.media_url))
    .filter((u): u is string => Boolean(u))

  return {
    usuario: bd.username,
    nome: bd.name ?? '',
    bio: bd.biography ?? '',
    link: bd.website ?? '',
    foto: bd.profile_picture_url ?? null,
    seguidores: bd.followers_count ?? null,
    posts: bd.media_count ?? null,
    miniaturas,
  }
}

/** códigos da Graph API viram uma saída acionável, não um número na tela */
function traduzirErro(erro: NonNullable<RespostaBD['error']>, usuarioAlvo: string): ErroCaptura {
  const { code, error_subcode: sub, message = '' } = erro

  if (code === 190 || sub === 463 || sub === 467) {
    return new ErroCaptura(
      'token-invalido',
      'token do Instagram inválido ou expirado',
      'O acesso ao Instagram precisa ser renovado nas configurações. Enquanto isso, preencha os campos na mão.',
    )
  }
  /* 10 e 200 = o token existe e é válido, mas não carrega as permissões da
     chamada. É o tropeço mais comum: o Graph API Explorer gera o token sem
     permissão nenhuma se elas não forem marcadas ANTES de gerar. */
  if (code === 10 || code === 200 || /permission/i.test(message)) {
    return new ErroCaptura(
      'permissao-faltando',
      'o acesso ao Instagram está sem as permissões necessárias',
      'Gere o token de novo marcando instagram_basic, pages_show_list, pages_read_engagement e business_management antes de clicar em Generate. Veja o DEPLOY.md.',
    )
  }
  if (code === 4 || code === 17 || code === 32 || code === 613) {
    return new ErroCaptura(
      'limite-excedido',
      'limite de consultas do Instagram atingido',
      'O Instagram limitou as consultas por agora. Espere alguns minutos ou preencha na mão.',
    )
  }
  // o BD devolve 110/100 quando o alvo não é conta profissional
  if (code === 110 || /does not exist|cannot be loaded|nonexisting field/i.test(message)) {
    return new ErroCaptura(
      'nao-profissional',
      `@${usuarioAlvo} não é uma conta Comercial ou de Criador`,
      'A API oficial só lê perfis Comercial/Criador. Para perfis pessoais, preencha os campos na mão — o relatório sai igual.',
    )
  }
  return new ErroCaptura(
    'erro-instagram',
    message || 'erro do Instagram',
    'Não deu pra puxar agora. Preencha os campos na mão que a análise sai do mesmo jeito.',
  )
}

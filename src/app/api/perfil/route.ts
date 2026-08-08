/**
 * GET /api/perfil?conta=<@ ou url>
 *
 * Roda no servidor porque o token do Instagram não pode chegar ao navegador.
 * Devolve o perfil normalizado ou um erro com uma saída acionável.
 */
import { NextResponse } from 'next/server'
import { buscarPerfil, descobrirContaId, ErroCaptura, extrairUsuario } from '@/lib/instagram'

export const runtime = 'nodejs'
/* a captura consulta o Instagram a cada chamada — nada de cache de rota */
export const dynamic = 'force-dynamic'

/* o ID da conta é derivado do token uma vez e reaproveitado enquanto a
   instância viver — é uma chamada a menos por análise */
let contaIdEmCache: { token: string; id: string } | null = null

async function resolverContaId(token: string): Promise<string> {
  const configurado = process.env.IG_BUSINESS_ACCOUNT_ID
  if (configurado) return configurado
  if (contaIdEmCache?.token === token) return contaIdEmCache.id
  const id = await descobrirContaId(token)
  contaIdEmCache = { token, id }
  return id
}

export async function GET(request: Request) {
  const entrada = new URL(request.url).searchParams.get('conta') ?? ''
  const usuario = extrairUsuario(entrada)

  if (!usuario) {
    return NextResponse.json(
      {
        tipo: 'usuario-invalido',
        mensagem: 'não consegui ler um @ nesse texto',
        saida: 'Cole o @ do perfil (ex.: @loja) ou o link completo (instagram.com/loja).',
      },
      { status: 400 },
    )
  }

  const token = process.env.IG_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json(
      {
        tipo: 'sem-configuracao',
        mensagem: 'a captura automática ainda não foi configurada',
        saida: 'Preencha os campos na mão — a análise funciona igual. (Admin: veja DEPLOY.md)',
      },
      { status: 503 },
    )
  }

  try {
    const contaId = await resolverContaId(token)
    const perfil = await buscarPerfil(usuario, contaId, token)
    return NextResponse.json(perfil, {
      headers: { 'cache-control': 'no-store' },
    })
  } catch (e) {
    if (e instanceof ErroCaptura) {
      const status =
        e.tipo === 'nao-encontrado' || e.tipo === 'nao-profissional'
          ? 404
          : e.tipo === 'limite-excedido'
            ? 429
            : e.tipo === 'token-invalido'
              ? 502
              : 502
      return NextResponse.json({ tipo: e.tipo, mensagem: e.message, saida: e.saida }, { status })
    }
    return NextResponse.json(
      {
        tipo: 'erro-instagram',
        mensagem: 'erro inesperado na captura',
        saida: 'Preencha os campos na mão que a análise sai do mesmo jeito.',
      },
      { status: 500 },
    )
  }
}

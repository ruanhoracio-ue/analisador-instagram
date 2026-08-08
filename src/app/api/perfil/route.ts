/**
 * GET /api/perfil?conta=<@ ou url>
 *
 * Roda no servidor porque o token do Instagram não pode chegar ao navegador.
 * Devolve o perfil normalizado ou um erro com uma saída acionável.
 */
import { NextResponse } from 'next/server'
import { buscarPerfil, ErroCaptura, extrairUsuario } from '@/lib/instagram'

export const runtime = 'nodejs'
/* a captura consulta o Instagram a cada chamada — nada de cache de rota */
export const dynamic = 'force-dynamic'

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

  const contaId = process.env.IG_BUSINESS_ACCOUNT_ID
  const token = process.env.IG_ACCESS_TOKEN

  if (!contaId || !token) {
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

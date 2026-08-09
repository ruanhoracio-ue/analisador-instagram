/**
 * GET /api/token — conferência da configuração da captura.
 *
 * Depois de salva, a variável de ambiente é opaca: quem configurou não
 * consegue reler o valor pra saber se acertou. Esta rota responde a pergunta
 * "o que está faltando?" olhando o token que o app REALMENTE está usando.
 *
 * Nunca devolve o token nem nenhum pedaço dele.
 */
import { NextResponse } from 'next/server'
import { PERMISSOES_NECESSARIAS, verificarToken } from '@/lib/instagram'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.IG_ACCESS_TOKEN

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        configurado: false,
        necessarias: PERMISSOES_NECESSARIAS,
        diagnostico:
          'A variável IG_ACCESS_TOKEN não chegou ao app. Confira se ela existe na Vercel para o ambiente Production e se houve um Redeploy depois de salvá-la.',
      },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    )
  }

  const estado = await verificarToken(token)
  return NextResponse.json(
    { configurado: true, necessarias: PERMISSOES_NECESSARIAS, ...estado },
    { status: 200, headers: { 'cache-control': 'no-store' } },
  )
}

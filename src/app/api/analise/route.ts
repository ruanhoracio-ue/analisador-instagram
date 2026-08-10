/**
 * POST /api/analise — análise com IA do perfil diagnosticado.
 * Roda no servidor: a OPENAI_API_KEY nunca chega ao navegador.
 */
import { NextResponse } from 'next/server'
import { analisarComIA, ErroIA, type EntradaIA } from '@/lib/ia'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
/* a OpenAI pode levar >10s; folga pra não morrer no meio */
export const maxDuration = 60

export async function POST(request: Request) {
  const chave = process.env.OPENAI_API_KEY
  if (!chave) {
    return NextResponse.json(
      {
        tipo: 'sem-configuracao',
        mensagem: 'a análise com IA ainda não foi configurada',
        saida: 'A análise por regras acima já cobre o essencial. (Admin: OPENAI_API_KEY — DEPLOY.md)',
      },
      { status: 503 },
    )
  }

  let entrada: EntradaIA
  try {
    entrada = (await request.json()) as EntradaIA
  } catch {
    return NextResponse.json(
      { tipo: 'erro-openai', mensagem: 'pedido inválido', saida: 'Recarregue a página e tente de novo.' },
      { status: 400 },
    )
  }

  try {
    const analise = await analisarComIA(entrada, chave, process.env.OPENAI_MODEL || undefined)
    return NextResponse.json(analise, { headers: { 'cache-control': 'no-store' } })
  } catch (e) {
    if (e instanceof ErroIA) {
      const status = e.tipo === 'limite-excedido' ? 429 : e.tipo === 'chave-invalida' ? 502 : 502
      return NextResponse.json({ tipo: e.tipo, mensagem: e.message, saida: e.saida }, { status })
    }
    return NextResponse.json(
      {
        tipo: 'erro-openai',
        mensagem: 'erro inesperado na análise',
        saida: 'Tente de novo — a análise por regras acima continua valendo.',
      },
      { status: 500 },
    )
  }
}

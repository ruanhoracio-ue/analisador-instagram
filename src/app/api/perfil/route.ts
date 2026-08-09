/**
 * GET /api/perfil?conta=<@ ou url>
 *
 * Roda no servidor porque o token do Instagram não pode chegar ao navegador.
 * Devolve o perfil normalizado ou um erro com uma saída acionável.
 */
import { NextResponse } from 'next/server'
import {
  buscarPerfil,
  descobrirContaId,
  ErroCaptura,
  extrairUsuario,
  verificarToken,
} from '@/lib/instagram'

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
      /* A Meta devolve o mesmo código 10 em duas situações muito diferentes:
         token sem escopos, e alvo que não é conta Comercial/Criador. Como o
         token é conferível, perguntamos a ele: se está íntegro, o problema é
         o perfil consultado — e mandar a pessoa refazer o token seria uma
         caçada a um erro que não existe. */
      let erro = e
      if (e.tipo === 'permissao-faltando') {
        const estado = await verificarToken(token).catch(() => null)
        if (estado?.ok) {
          erro = new ErroCaptura(
            'nao-profissional',
            `não deu pra ler @${usuario} pela API oficial`,
            'A API só alcança perfis Comercial ou Criador de Conteúdo — perfis pessoais e privados ficam de fora. Preencha os campos na mão que a análise sai igual.',
          )
        }
      }
      const status =
        erro.tipo === 'nao-encontrado' || erro.tipo === 'nao-profissional'
          ? 404
          : erro.tipo === 'limite-excedido'
            ? 429
            : 502
      return NextResponse.json(
        { tipo: erro.tipo, mensagem: erro.message, saida: erro.saida },
        { status },
      )
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

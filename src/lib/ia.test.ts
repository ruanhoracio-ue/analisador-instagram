import { describe, expect, it } from 'vitest'
import { analisarComIA, ErroIA, montarMensagens, type EntradaIA } from './ia'

const ENTRADA: EntradaIA = {
  objetivo: 'Me chamar no direct',
  tipo: 'Pessoa',
  usuario: 'ananutri',
  nome: 'Ana | Nutricionista',
  bio: 'Nutrição pra quem treina\nMe chama no direct 👇',
  link: '',
  ctaBotao: 'Enviar mensagem',
  seguidores: 5400,
  legendasRecentes: ['Receita fit de hoje', 'Treino e dieta andam juntos'],
  jaApontado: ['Menos de 4 destaques planejados.'],
}

describe('montarMensagens', () => {
  it('leva o perfil inteiro e o que as regras já apontaram', () => {
    const [sistema, usuario] = montarMensagens(ENTRADA)
    expect(sistema.role).toBe('system')
    expect(usuario.content).toContain('@ananutri')
    expect(usuario.content).toContain('Nutrição pra quem treina')
    expect(usuario.content).toContain('5400 seguidores')
    expect(usuario.content).toContain('Receita fit de hoje')
    expect(usuario.content).toContain('Menos de 4 destaques planejados.')
  })

  it('o sistema proíbe texto pronto e exige citação e porquê', () => {
    const [sistema] = montarMensagens(ENTRADA)
    expect(sistema.content).toMatch(/NÃO escreva a bio/i)
    expect(sistema.content).toMatch(/porquê/i)
    expect(sistema.content).toMatch(/cite trechos/i)
  })

  it('campos vazios viram marcadores, não undefined no prompt', () => {
    const [, usuario] = montarMensagens({ ...ENTRADA, bio: '', legendasRecentes: undefined })
    expect(usuario.content).toContain('(vazia)')
    expect(usuario.content).toContain('(não disponíveis)')
    expect(usuario.content).not.toContain('undefined')
  })

  it('legendas longas são truncadas — prompt não explode de tamanho', () => {
    const [, usuario] = montarMensagens({ ...ENTRADA, legendasRecentes: ['x'.repeat(2000)] })
    expect(usuario.content.length).toBeLessThan(2000)
  })
})

const ANALISE_OK = {
  leitura: 'Perfil de nutrição esportiva voltado a quem treina.',
  forcas: ['Convite claro pro direct'],
  oportunidades: [
    { titulo: 'Nicho amplo', porque: 'x', comoResolver: 'y', exemplo: null },
  ],
  proximaAcao: 'Fixe um post de apresentação.',
}

function fetchOpenAI(status: number, corpo?: unknown) {
  return (async () =>
    new Response(JSON.stringify(corpo ?? {}), { status })) as unknown as typeof fetch
}

function respostaChat(conteudo: string) {
  return { choices: [{ message: { content: conteudo } }] }
}

describe('analisarComIA', () => {
  it('devolve a análise estruturada', async () => {
    const a = await analisarComIA(
      ENTRADA,
      'sk-x',
      undefined,
      fetchOpenAI(200, respostaChat(JSON.stringify(ANALISE_OK))),
    )
    expect(a.leitura).toContain('nutrição')
    expect(a.oportunidades).toHaveLength(1)
  })

  it('401 vira chave inválida com saída acionável', async () => {
    const erro = await analisarComIA(ENTRADA, 'sk-x', undefined, fetchOpenAI(401)).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroIA)
    expect(erro.tipo).toBe('chave-invalida')
    expect(erro.saida).toMatch(/OPENAI_API_KEY/)
  })

  it('429 vira limite excedido', async () => {
    await expect(analisarComIA(ENTRADA, 'sk-x', undefined, fetchOpenAI(429))).rejects.toMatchObject(
      { tipo: 'limite-excedido' },
    )
  })

  it('JSON quebrado vira resposta inválida, não exceção crua', async () => {
    await expect(
      analisarComIA(ENTRADA, 'sk-x', undefined, fetchOpenAI(200, respostaChat('não sou json'))),
    ).rejects.toMatchObject({ tipo: 'resposta-invalida' })
  })

  it('resposta vazia idem', async () => {
    await expect(
      analisarComIA(ENTRADA, 'sk-x', undefined, fetchOpenAI(200, { choices: [] })),
    ).rejects.toMatchObject({ tipo: 'resposta-invalida' })
  })

  it('rede fora vira erro tratado', async () => {
    const quebrado = (async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    await expect(analisarComIA(ENTRADA, 'sk-x', undefined, quebrado)).rejects.toMatchObject({
      tipo: 'erro-openai',
    })
  })
})

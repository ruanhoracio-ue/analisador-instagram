import { describe, expect, it } from 'vitest'
import { buscarPerfil, descobrirContaId, ErroCaptura, extrairUsuario } from './instagram'

describe('extrairUsuario', () => {
  it('aceita as formas que a pessoa tem na mão', () => {
    const esperado = 'lojaexemplo'
    for (const entrada of [
      'lojaexemplo',
      '@lojaexemplo',
      '  @LojaExemplo  ',
      'instagram.com/lojaexemplo',
      'www.instagram.com/lojaexemplo',
      'https://instagram.com/lojaexemplo',
      'https://www.instagram.com/lojaexemplo/',
      'https://www.instagram.com/lojaexemplo/?hl=pt-br',
      'https://www.instagram.com/lojaexemplo/reels/',
    ]) {
      expect(extrairUsuario(entrada), entrada).toBe(esperado)
    }
  })

  it('preserva ponto e underline, que são válidos no Instagram', () => {
    expect(extrairUsuario('@dra.camila_nutri')).toBe('dra.camila_nutri')
  })

  it('rejeita o que não é usuário', () => {
    for (const entrada of ['', '   ', '@', 'com espaço', 'a'.repeat(31), '@#$%']) {
      expect(extrairUsuario(entrada), entrada).toBeNull()
    }
  })
})

/** fetch falso: devolve o JSON que a Graph API devolveria */
function fetchFalso(corpo: unknown) {
  return (async () => new Response(JSON.stringify(corpo), { status: 200 })) as unknown as typeof fetch
}

const RESPOSTA_OK = {
  business_discovery: {
    username: 'lojaexemplo',
    name: 'Loja Exemplo | Roupa de Treino',
    biography: 'Legging que não cai\nCompre no link 👇',
    website: 'https://loja.exemplo.com',
    profile_picture_url: 'https://cdn.exemplo/foto.jpg',
    followers_count: 12400,
    media_count: 340,
    media: {
      data: [
        { media_type: 'IMAGE', media_url: 'https://cdn.exemplo/1.jpg' },
        { media_type: 'VIDEO', media_url: 'https://cdn.exemplo/v.mp4', thumbnail_url: 'https://cdn.exemplo/2.jpg' },
        { media_type: 'IMAGE' },
      ],
    },
  },
}

describe('buscarPerfil', () => {
  it('normaliza a resposta para o formato do motor', async () => {
    const p = await buscarPerfil('lojaexemplo', '123', 'tok', fetchFalso(RESPOSTA_OK))
    expect(p.nome).toBe('Loja Exemplo | Roupa de Treino')
    expect(p.bio).toContain('Legging que não cai')
    expect(p.link).toBe('https://loja.exemplo.com')
    expect(p.seguidores).toBe(12400)
  })

  it('usa a thumbnail do vídeo e descarta mídia sem imagem', async () => {
    const p = await buscarPerfil('lojaexemplo', '123', 'tok', fetchFalso(RESPOSTA_OK))
    // 3 mídias, mas a terceira não tem URL utilizável
    expect(p.miniaturas).toEqual(['https://cdn.exemplo/1.jpg', 'https://cdn.exemplo/2.jpg'])
  })

  it('campos ausentes viram vazio, não undefined', async () => {
    const p = await buscarPerfil(
      'x',
      '123',
      'tok',
      fetchFalso({ business_discovery: { username: 'x' } }),
    )
    expect(p.nome).toBe('')
    expect(p.bio).toBe('')
    expect(p.link).toBe('')
    expect(p.foto).toBeNull()
    expect(p.miniaturas).toEqual([])
  })

  it('perfil ausente na resposta vira erro de não encontrado', async () => {
    await expect(buscarPerfil('x', '123', 'tok', fetchFalso({}))).rejects.toMatchObject({
      tipo: 'nao-encontrado',
    })
  })
})

describe('descobrirContaId', () => {
  it('acha o id da conta profissional a partir do token', async () => {
    const id = await descobrirContaId(
      'tok',
      fetchFalso({ data: [{ instagram_business_account: { id: '17841400000000000' } }] }),
    )
    expect(id).toBe('17841400000000000')
  })

  it('ignora páginas sem Instagram ligado e pega a primeira que tem', async () => {
    const id = await descobrirContaId(
      'tok',
      fetchFalso({ data: [{}, {}, { instagram_business_account: { id: '999' } }] }),
    )
    expect(id).toBe('999')
  })

  it('nenhuma conta profissional ligada vira orientação, não erro cru', async () => {
    const erro = await descobrirContaId('tok', fetchFalso({ data: [] })).catch((e) => e)
    expect(erro).toBeInstanceOf(ErroCaptura)
    expect(erro.tipo).toBe('sem-configuracao')
    expect(erro.saida).toMatch(/Comercial|Criador/)
  })

  it('token inválido é reconhecido também aqui', async () => {
    await expect(
      descobrirContaId('tok', fetchFalso({ error: { code: 190, message: 'expired' } })),
    ).rejects.toMatchObject({ tipo: 'token-invalido' })
  })
})

describe('tradução dos erros da Graph API', () => {
  const casos: [string, unknown, string][] = [
    ['token expirado', { error: { code: 190, message: 'Session has expired' } }, 'token-invalido'],
    ['limite de chamadas', { error: { code: 4, message: 'rate limit' } }, 'limite-excedido'],
    [
      'token sem permissões',
      { error: { code: 10, message: 'Application does not have permission for this action' } },
      'permissao-faltando',
    ],
    ['permissão ausente (200)', { error: { code: 200, message: 'Permissions error' } }, 'permissao-faltando'],
    [
      'alvo não é conta profissional',
      { error: { code: 110, message: 'Object does not exist' } },
      'nao-profissional',
    ],
    ['erro desconhecido', { error: { code: 999, message: 'boom' } }, 'erro-instagram'],
  ]

  for (const [nome, corpo, tipoEsperado] of casos) {
    it(`${nome} → ${tipoEsperado}`, async () => {
      await expect(buscarPerfil('alvo', '123', 'tok', fetchFalso(corpo))).rejects.toMatchObject({
        tipo: tipoEsperado,
      })
    })
  }

  it('todo erro traz uma saída acionável para a pessoa', async () => {
    for (const [, corpo] of casos) {
      const erro = await buscarPerfil('alvo', '123', 'tok', fetchFalso(corpo)).catch((e) => e)
      expect(erro).toBeInstanceOf(ErroCaptura)
      expect((erro as ErroCaptura).saida.length).toBeGreaterThan(20)
    }
  })

  it('rede fora vira erro tratado, não exceção crua', async () => {
    const quebrado = (async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
    await expect(buscarPerfil('alvo', '123', 'tok', quebrado)).rejects.toMatchObject({
      tipo: 'erro-instagram',
    })
  })
})

import { describe, expect, it } from 'vitest'
import { REGRAS } from '@/data/regras'
import { avaliar, progresso, regrasAplicaveis } from './avaliar'
import { perfilVazio, type Perfil } from './tipos'

/** perfil razoavelmente saudável para o objetivo direct — base dos testes */
function perfilBom(): Perfil {
  return {
    ...perfilVazio('pessoa', 'direct'),
    foto: 'foto-id',
    nome: 'Ana Ribeiro | Nutricionista',
    usuario: 'anaribeironutri',
    bio: 'Nutrição esportiva pra quem treina pesado\nPlanos que cabem na rotina\nMe chama no direct 👇',
    ctaBotao: 'Enviar mensagem',
    destaques: [
      { nome: 'Quem sou', capa: 'c1' },
      { nome: 'Provas', capa: 'c2' },
      { nome: 'Método', capa: 'c3' },
      { nome: 'Planos', capa: 'c4' },
    ],
    grid: Array.from({ length: 9 }, (_, i) => ({ imagem: `g${i}` })),
    fixados: [
      { papel: 'apresentacao', titulo: 'Quem é Ana' },
      { papel: 'prova', titulo: 'Resultados' },
      { papel: 'oferta', titulo: 'Planos' },
    ],
  }
}

describe('formato das regras', () => {
  it('toda regra tem mensagem e porquê preenchidos', () => {
    for (const r of REGRAS) {
      expect(r.mensagem.trim(), r.id).not.toBe('')
      expect(r.porque.trim(), r.id).not.toBe('')
    }
  })

  it('toda regra auto tem condição; nenhuma self-check tem', () => {
    for (const r of REGRAS) {
      if (r.kind === 'auto') expect(r.condicao, r.id).toBeTypeOf('function')
      else expect(r.condicao, r.id).toBeUndefined()
    }
  })

  it('ids são únicos', () => {
    const ids = REGRAS.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('toda regra diz como resolver', () => {
    for (const r of REGRAS) {
      expect(r.comoResolver?.trim(), r.id).toBeTruthy()
    }
  })

  it('só regras auto trazem elogio (self-check não passa nem falha sozinha)', () => {
    for (const r of REGRAS) {
      if (r.elogio) expect(r.kind, r.id).toBe('auto')
    }
  })
})

describe('evidência — a regra cita o que a pessoa escreveu', () => {
  const acharViolada = (p: Perfil, id: string) =>
    avaliar(p).violadas.find((r) => r.id === id)

  it('teste do concorrente cita a frase genérica, com os acentos originais', () => {
    const p = { ...perfilBom(), bio: 'Nutrição de verdade\nTransformando VIDAS através da comida' }
    expect(acharViolada(p, 'bio-teste-concorrente')?.trecho).toBe('Transformando VIDAS')
  })

  it('contradição CTA×objetivo cita uma frase que empurra pro link', () => {
    const p = { ...perfilBom(), bio: 'Nutrição esportiva\nGaranta sua vaga, clique no link 👇' }
    const trecho = acharViolada(p, 'link-contradicao-direct')?.trecho?.toLowerCase()
    expect(['garanta sua vaga', 'clique no link']).toContain(trecho)
  })

  it('bio estourada mostra exatamente o que o Instagram corta', () => {
    const p = { ...perfilBom(), bio: 'a'.repeat(150) + 'FICA DE FORA' }
    expect(acharViolada(p, 'bio-150-caracteres')?.trecho).toBe('…FICA DE FORA')
  })

  it('nome só próprio cita o próprio nome', () => {
    const p = { ...perfilBom(), nome: 'Ana Ribeiro' }
    expect(acharViolada(p, 'nome-so-nome-proprio')?.trecho).toBe('Ana Ribeiro')
  })

  it('destaque comprido cita só os nomes que estouram', () => {
    const p = {
      ...perfilBom(),
      destaques: [
        { nome: 'Quem sou' },
        { nome: 'Como funciona o método' },
        { nome: 'Provas' },
        { nome: 'Planos' },
      ],
    }
    const trecho = acharViolada(p, 'destaques-nome-comprido')?.trecho
    expect(trecho).toContain('Como funciona o método')
    expect(trecho).not.toContain('Quem sou')
  })

  it('regra sem evidência devolve trecho null, não quebra', () => {
    const p = { ...perfilBom(), bio: '' }
    expect(acharViolada(p, 'bio-vazia')?.trecho).toBeNull()
  })
})

describe('regras com números da captura', () => {
  it('menos de 9 posts dispara e cita a contagem', () => {
    const p: Perfil = { ...perfilBom(), totalPosts: 4 }
    const v = avaliar(p).violadas.find((r) => r.id === 'grid-pouco-conteudo')
    expect(v).toBeDefined()
    expect(v?.trecho).toBe('4 posts publicados')
  })

  it('sem o número (entrada manual), a regra não dispara', () => {
    const ids = avaliar(perfilBom()).violadas.map((r) => r.id)
    expect(ids).not.toContain('grid-pouco-conteudo')
    expect(ids).not.toContain('grid-perfil-parado')
    expect(ids).not.toContain('legendas-sem-convite-direct')
  })

  it('perfil parado há mais de 30 dias dispara e cita a recência', () => {
    const p: Perfil = { ...perfilBom(), diasDesdeUltimoPost: 47 }
    const v = avaliar(p).violadas.find((r) => r.id === 'grid-perfil-parado')
    expect(v?.trecho).toBe('último post há 47 dias')
  })

  it('postou este mês = não está parado', () => {
    const p: Perfil = { ...perfilBom(), diasDesdeUltimoPost: 12 }
    expect(avaliar(p).violadas.map((r) => r.id)).not.toContain('grid-perfil-parado')
  })

  it('objetivo direct + nenhuma legenda convidando = aviso com contagem', () => {
    const p: Perfil = {
      ...perfilBom(),
      legendasRecentes: ['Receita de hoje!', 'Treino de pernas 💪', 'Bom dia'],
    }
    const v = avaliar(p).violadas.find((r) => r.id === 'legendas-sem-convite-direct')
    expect(v?.trecho).toBe('3 legendas recentes lidas — nenhuma convida pro direct')
  })

  it('uma legenda com convite já resolve', () => {
    const p: Perfil = {
      ...perfilBom(),
      legendasRecentes: ['Receita de hoje!', 'Dúvida? Me chama no direct 👇'],
    }
    expect(avaliar(p).violadas.map((r) => r.id)).not.toContain('legendas-sem-convite-direct')
  })

  it('objetivo link cobra o empurrão nas legendas', () => {
    const p: Perfil = {
      ...perfilBom(),
      objetivo: 'link',
      link: 'https://loja.exemplo.com',
      bio: 'Roupas de treino\nCompre no link 👇',
      ctaBotao: '',
      legendasRecentes: ['Lançamento da semana', 'Look do dia'],
    }
    const ids = avaliar(p).violadas.map((r) => r.id)
    expect(ids).toContain('legendas-sem-convite-link')
  })
})

describe('progresso da sessão', () => {
  it('perfil vazio começa longe do fim; perfil pronto chega em 100%', () => {
    const vazio = progresso(perfilVazio())
    const todosChecks = new Set(REGRAS.filter((r) => r.kind === 'self-check').map((r) => r.id))
    const pronto = progresso(perfilBom(), todosChecks)
    expect(vazio.fracao).toBeLessThan(0.6)
    expect(pronto.resolvidas).toBe(pronto.total)
    expect(pronto.fracao).toBe(1)
  })

  it('confirmar um self-check avança o progresso', () => {
    const antes = progresso(perfilBom())
    const depois = progresso(perfilBom(), new Set(['grid-tema-visivel']))
    expect(depois.resolvidas).toBe(antes.resolvidas + 1)
  })

  it('o total acompanha as regras aplicáveis ao objetivo', () => {
    const direct = progresso({ ...perfilBom(), objetivo: 'direct' })
    expect(direct.total).toBe(regrasAplicaveis({ ...perfilBom(), objetivo: 'direct' }).length)
  })
})

describe('pontos fortes', () => {
  it('perfil coerente acumula acertos', () => {
    const av = avaliar(perfilBom())
    expect(av.acertos.length).toBeGreaterThan(0)
    expect(av.acertos.every((r) => r.elogio)).toBe(true)
  })

  it('perfil vazio não ganha elogio — não há o que elogiar', () => {
    expect(avaliar(perfilVazio()).acertos).toHaveLength(0)
  })

  it('a mesma regra nunca é acerto e violação ao mesmo tempo', () => {
    const av = avaliar(perfilBom())
    const violados = new Set(av.violadas.map((r) => r.id))
    expect(av.acertos.some((r) => violados.has(r.id))).toBe(false)
  })
})

describe('objetivo como eixo', () => {
  it('mudar o objetivo muda as regras aplicadas', () => {
    const direct = regrasAplicaveis({ ...perfilBom(), objetivo: 'direct' })
    const link = regrasAplicaveis({ ...perfilBom(), objetivo: 'link' })
    const idsDirect = new Set(direct.map((r) => r.id))
    const idsLink = new Set(link.map((r) => r.id))
    expect(idsDirect.has('link-contradicao-direct')).toBe(true)
    expect(idsLink.has('link-contradicao-direct')).toBe(false)
    expect(idsLink.has('link-vazio')).toBe(true)
    expect(idsDirect.has('link-vazio')).toBe(false)
  })

  it('mudar o tipo muda o recorte (foto: rosto vs símbolo)', () => {
    const pessoa = regrasAplicaveis({ ...perfilBom(), tipo: 'pessoa' })
    const negocio = regrasAplicaveis({ ...perfilBom(), tipo: 'negocio' })
    expect(pessoa.some((r) => r.id === 'foto-rosto-perto')).toBe(true)
    expect(pessoa.some((r) => r.id === 'foto-simbolo-nao-logo')).toBe(false)
    expect(negocio.some((r) => r.id === 'foto-simbolo-nao-logo')).toBe(true)
  })
})

describe('teste do concorrente', () => {
  it('bio genérica dispara', () => {
    const p = { ...perfilBom(), bio: 'Ajudo pessoas a alcançarem resultados ✨' }
    const av = avaliar(p)
    expect(av.violadas.map((r) => r.id)).toContain('bio-teste-concorrente')
  })

  it('bio específica não dispara', () => {
    const av = avaliar(perfilBom())
    expect(av.violadas.map((r) => r.id)).not.toContain('bio-teste-concorrente')
  })

  it('pega variação com acento ("transformando vidas")', () => {
    const p = { ...perfilBom(), bio: 'Transformando VIDAS através da nutrição' }
    const av = avaliar(p)
    expect(av.violadas.map((r) => r.id)).toContain('bio-teste-concorrente')
  })
})

describe('coerência CTA × objetivo (a regra mais valiosa)', () => {
  it('objetivo direct + bio empurrando pro link = contradição', () => {
    const p = {
      ...perfilBom(),
      bio: 'Nutrição esportiva pra quem treina\nGaranta sua vaga, clique no link 👇',
    }
    const av = avaliar(p)
    expect(av.violadas.map((r) => r.id)).toContain('link-contradicao-direct')
  })

  it('objetivo direct sem convite explícito = aviso', () => {
    const p = { ...perfilBom(), bio: 'Nutrição esportiva pra quem treina pesado', ctaBotao: '' }
    const av = avaliar(p)
    expect(av.violadas.map((r) => r.id)).toContain('link-direct-sem-convite')
  })

  it('objetivo link + bio chamando pro direct = contradição invertida', () => {
    const p: Perfil = {
      ...perfilBom(),
      objetivo: 'link',
      link: 'https://loja.exemplo.com',
      bio: 'Roupas de treino\nMe chama no direct pra pedir 👇',
      ctaBotao: '',
    }
    const av = avaliar(p)
    expect(av.violadas.map((r) => r.id)).toContain('link-contradicao-link')
  })

  it('objetivo link + agregador de links = destino diluído', () => {
    const p: Perfil = {
      ...perfilBom(),
      objetivo: 'link',
      link: 'https://linktr.ee/minhaloja',
      bio: 'Roupas de treino\nCompre agora no link 👇',
    }
    const av = avaliar(p)
    expect(av.violadas.map((r) => r.id)).toContain('link-destino-unico')
  })

  it('perfil coerente com direct não dispara contradição', () => {
    const av = avaliar(perfilBom())
    expect(av.violadas.map((r) => r.id)).not.toContain('link-contradicao-direct')
    expect(av.violadas.map((r) => r.id)).not.toContain('link-direct-sem-convite')
  })
})

describe('limites do Instagram', () => {
  it('bio > 150 caracteres dispara', () => {
    const p = { ...perfilBom(), bio: 'a'.repeat(151) }
    expect(avaliar(p).violadas.map((r) => r.id)).toContain('bio-150-caracteres')
  })

  it('nome > 30 caracteres dispara', () => {
    const p = { ...perfilBom(), nome: 'Ana Ribeiro | Nutricionista Esportiva e Funcional' }
    expect(avaliar(p).violadas.map((r) => r.id)).toContain('nome-30-caracteres')
  })

  it('nome só com o nome próprio dispara a crítica', () => {
    const p = { ...perfilBom(), nome: 'Ana Ribeiro' }
    expect(avaliar(p).violadas.map((r) => r.id)).toContain('nome-so-nome-proprio')
  })

  it('nome com ofício não dispara', () => {
    const p = { ...perfilBom(), nome: 'Ana Nutricionista' }
    expect(avaliar(p).violadas.map((r) => r.id)).not.toContain('nome-so-nome-proprio')
  })

  it('@ com underline ou número dispara', () => {
    const p = { ...perfilBom(), usuario: 'ana_ribeiro93' }
    expect(avaliar(p).violadas.map((r) => r.id)).toContain('usuario-dificil-de-ditar')
  })
})

describe('objetivo local', () => {
  it('cobra cidade no nome e endereço na bio', () => {
    const p: Perfil = {
      ...perfilBom(),
      objetivo: 'local',
      cidade: 'Moema',
      nome: 'Ana Ribeiro | Nutricionista',
      bio: 'Nutrição esportiva pra quem treina pesado\nMe chama no direct',
    }
    const ids = avaliar(p).violadas.map((r) => r.id)
    expect(ids).toContain('nome-cidade-local')
    expect(ids).toContain('bio-local-endereco')
  })

  it('satisfeito quando cidade aparece no nome e na bio', () => {
    const p: Perfil = {
      ...perfilBom(),
      objetivo: 'local',
      cidade: 'Moema',
      nome: 'Ana Nutricionista | Moema',
      bio: 'Nutrição esportiva em Moema\nSeg a sex, 8h–18h\nMe chama no direct',
    }
    const ids = avaliar(p).violadas.map((r) => r.id)
    expect(ids).not.toContain('nome-cidade-local')
    expect(ids).not.toContain('bio-local-endereco')
  })
})

describe('notas por bloco e próximo passo', () => {
  it('devolve nota 0–10 para cada bloco', () => {
    const av = avaliar(perfilVazio())
    for (const nota of Object.values(av.notas)) {
      expect(nota).toBeGreaterThanOrEqual(0)
      expect(nota).toBeLessThanOrEqual(10)
    }
  })

  it('perfil vazio pontua baixo; perfil bom pontua alto', () => {
    const vazio = avaliar(perfilVazio())
    const bom = avaliar(perfilBom(), new Set(REGRAS.filter((r) => r.kind === 'self-check').map((r) => r.id)))
    expect(vazio.notas.bio).toBeLessThan(5)
    expect(bom.notas.bio).toBe(10)
    expect(bom.notas.link).toBe(10)
    expect(bom.notas.destaques).toBe(10)
  })

  it('o próximo passo é um só e prioriza a crítica mais impactante', () => {
    const p = {
      ...perfilBom(),
      bio: 'Ajudo pessoas a alcançarem resultados\nClique no link pra saber mais',
    }
    const av = avaliar(p)
    // contradição CTA×objetivo vem antes do teste do concorrente no arquivo
    expect(av.proximoPasso?.id).toBe('link-contradicao-direct')
  })

  it('sem violações auto, o próximo passo cai no primeiro self-check pendente', () => {
    const av = avaliar(perfilBom())
    expect(av.proximoPasso?.kind).toBe('self-check')
  })

  it('tudo resolvido = sem próximo passo', () => {
    const todosChecks = new Set(REGRAS.filter((r) => r.kind === 'self-check').map((r) => r.id))
    const av = avaliar(perfilBom(), todosChecks)
    expect(av.violadas).toHaveLength(0)
    expect(av.proximoPasso).toBeNull()
  })

  it('self-check confirmado sobe a nota do bloco', () => {
    const sem = avaliar(perfilBom())
    const com = avaliar(perfilBom(), new Set(['grid-texto-miniatura', 'grid-tema-visivel']))
    expect(com.notas.grid).toBeGreaterThan(sem.notas.grid)
  })
})

/**
 * Perfis-modelo, um por objetivo.
 *
 * Não são gabaritos pra copiar: cada escolha vem anotada com o porquê, pra
 * pessoa entender a decisão e tomar a dela. Um exemplo sem anotação vira
 * template — e template copiado é o teste do concorrente falhando de novo.
 *
 * Arquivo de dados: edite à vontade sem tocar em componente.
 */
import type { Objetivo, Tipo } from '@/engine/tipos'

export interface Anotacao {
  /** o trecho comentado, como aparece no perfil */
  trecho: string
  /** por que essa escolha foi feita */
  porque: string
}

export interface Exemplo {
  objetivo: Objetivo
  tipo: Tipo
  titulo: string
  /** o cenário em uma frase, pra situar quem lê */
  contexto: string
  nome: string
  usuario: string
  bio: string
  link: string
  ctaBotao: string
  destaques: string[]
  fixados: string[]
  anotacoes: Anotacao[]
}

export const EXEMPLOS: Exemplo[] = [
  {
    objetivo: 'direct',
    tipo: 'pessoa',
    titulo: 'Conversa no direct',
    contexto: 'Nutricionista que fecha atendimento conversando antes — o direct é o funil dela.',
    nome: 'Ana Ribeiro | Nutri Esportiva',
    usuario: 'anaribeironutri',
    bio: 'Nutrição pra quem treina pesado e não tem tempo\n+400 atletas amadores atendidos\nMe chama no direct e eu digo se dá pra te ajudar 👇',
    link: '',
    ctaBotao: 'Enviar mensagem',
    destaques: ['Quem sou', 'Resultados', 'Método', 'Valores'],
    fixados: ['Apresentação: quem eu atendo', 'Prova: antes e depois de 3 alunos', 'Oferta: como funciona a consulta'],
    anotacoes: [
      {
        trecho: 'Ana Ribeiro | Nutri Esportiva',
        porque:
          'O campo Nome é o único que a busca lê. "Nutri Esportiva" é o que as pessoas digitam — o sobrenome foi cortado pra caber nos 30.',
      },
      {
        trecho: 'Nutrição pra quem treina pesado e não tem tempo',
        porque:
          'Primeira linha responde "pra quem é" e cabe antes do "mais". Um concorrente genérico não assinaria: tem nicho e tem a dor (falta de tempo).',
      },
      {
        trecho: '+400 atletas amadores atendidos',
        porque: 'O número faz o trabalho que o adjetivo não faz — é a prova que sustenta a promessa.',
      },
      {
        trecho: 'Me chama no direct e eu digo se dá pra te ajudar 👇',
        porque:
          'O convite é explícito e baixa a barreira: não pede compra, pede conversa. E não existe nenhum "clique no link" competindo com ele.',
      },
      {
        trecho: 'Link vazio, botão "Enviar mensagem"',
        porque:
          'Coerência com o objetivo: se a conversa é o funil, um link roubaria o clique que deveria virar mensagem.',
      },
    ],
  },
  {
    objetivo: 'link',
    tipo: 'negocio',
    titulo: 'Venda pelo link',
    contexto: 'Marca de roupa de treino que vende na própria loja online.',
    nome: 'Corpo Livre | Roupa de Treino',
    usuario: 'corpolivre',
    bio: 'Legging que não cai na agachada\nTecido testado por 200 alunas de crossfit\nFrete grátis acima de R$199 · Compre no link 👇',
    link: 'https://corpolivre.com.br/colecao',
    ctaBotao: 'Comprar agora',
    destaques: ['Novidades', 'Provando', 'Tamanhos', 'Comprar'],
    fixados: ['Apresentação: a marca em 30s', 'Prova: clientes usando', 'Oferta: coleção nova'],
    anotacoes: [
      {
        trecho: 'Legging que não cai na agachada',
        porque:
          'Abre pelo problema concreto que a cliente já viveu. "Qualidade e conforto" seria o teste do concorrente falhando.',
      },
      {
        trecho: 'Tecido testado por 200 alunas de crossfit',
        porque: 'Prova específica: número + quem testou. É o que separa promessa de marketing.',
      },
      {
        trecho: 'Compre no link 👇',
        porque:
          'Objetivo é venda no link, então a bio precisa empurrar pra lá — link sozinho não se apresenta.',
      },
      {
        trecho: 'corpolivre.com.br/colecao',
        porque:
          'Destino único, direto na coleção — não é Linktree com 8 botões nem a home do site. Cada opção a mais divide o clique.',
      },
      {
        trecho: 'Destaque "Tamanhos"',
        porque:
          'Responde a objeção que mais trava compra de roupa online. Destaque bom mata dúvida antes dela virar desistência.',
      },
    ],
  },
  {
    objetivo: 'local',
    tipo: 'negocio',
    titulo: 'Visita ao local',
    contexto: 'Clínica odontológica de bairro que vive de quem mora perto.',
    nome: 'Sorriso Moema | Dentista',
    usuario: 'sorrisomoema',
    bio: 'Odontologia sem susto no orçamento — Moema\n📍 R. Gaivota, 820 (5 min do metrô Eucaliptos)\n🕐 Seg a sex 9h–19h · Sáb 9h–13h',
    link: 'https://wa.me/5511999999999',
    ctaBotao: 'Como chegar',
    destaques: ['A clínica', 'Equipe', 'Convênios', 'Agendar'],
    fixados: ['Apresentação: tour pela clínica', 'Prova: pacientes atendidos', 'Oferta: avaliação gratuita'],
    anotacoes: [
      {
        trecho: 'Sorriso Moema | Dentista',
        porque:
          'O bairro está no Nome porque a busca local é "dentista moema" — e a busca do Instagram só lê esse campo.',
      },
      {
        trecho: '📍 R. Gaivota, 820 (5 min do metrô Eucaliptos)',
        porque:
          'Pra quem decide "vou ou não vou", endereço é a informação. A referência do metrô responde a pergunta seguinte antes dela ser feita.',
      },
      {
        trecho: '🕐 Seg a sex 9h–19h · Sáb 9h–13h',
        porque:
          'Horário é a segunda dúvida de quem vai se deslocar. Sem ele, a visita morre na incerteza.',
      },
      {
        trecho: 'Emoji só como marcador de linha',
        porque:
          'Um emoji por linha guia o olho pelo bloco de informação. Emoji decorativo espalhado viraria ruído em cima do que importa.',
      },
      {
        trecho: 'Destaque "Convênios"',
        porque: 'A objeção número um de clínica. Destaque existe pra derrubar objeção, não pra decorar.',
      },
    ],
  },
  {
    objetivo: 'seguir',
    tipo: 'criador',
    titulo: 'Ganhar seguidor',
    contexto: 'Criador de conteúdo sobre finanças pessoais construindo audiência antes de vender.',
    nome: 'Téo Mendes | Finanças',
    usuario: 'teomendes',
    bio: 'Dinheiro explicado sem economês\n1 vídeo por dia sobre o que fazer com o seu salário\nComeça pelos fixados 👇',
    link: '',
    ctaBotao: '',
    destaques: ['Comece aqui', 'Investir', 'Dívidas', 'Perguntas'],
    fixados: ['Apresentação: por que eu falo disso', 'Prova: o vídeo mais visto', 'Oferta: a série pra começar'],
    anotacoes: [
      {
        trecho: 'Dinheiro explicado sem economês',
        porque:
          'Promessa de formato, não de resultado. Quem segue criador quer saber como é consumir o conteúdo, não o que vai comprar.',
      },
      {
        trecho: '1 vídeo por dia sobre o que fazer com o seu salário',
        porque:
          'Diz a frequência e o tema. Seguir é um compromisso com o futuro — a pessoa precisa saber o que vai chegar no feed dela.',
      },
      {
        trecho: 'Começa pelos fixados 👇',
        porque:
          'O objetivo é retenção, então o convite aponta pro conteúdo, não pra venda. Fixados são a home page que decide se a pessoa fica.',
      },
      {
        trecho: 'Destaque "Comece aqui" em 1º',
        porque:
          'Os 4 primeiros são as únicas posições sem rolar, e a jornada de quem chega começa por "por onde eu entro".',
      },
    ],
  },
  {
    objetivo: 'contratar',
    tipo: 'pessoa',
    titulo: 'Ser contratado',
    contexto: 'Fotógrafa de casamento — o perfil é o portfólio e o orçamento nasce dele.',
    nome: 'Lia Costa | Foto de Casamento',
    usuario: 'liacostafoto',
    bio: 'Casamento fotografado como quem conta história\n60 casais desde 2019 · SP e litoral\nOrçamento e datas livres no link 👇',
    link: 'https://liacosta.com/orcamento',
    ctaBotao: 'Ver portfólio',
    destaques: ['Sobre mim', 'Casamentos', 'Como funciona', 'Investimento'],
    fixados: ['Apresentação: meu olhar', 'Prova: casamento completo', 'Oferta: como contratar'],
    anotacoes: [
      {
        trecho: 'Lia Costa | Foto de Casamento',
        porque:
          'Quem contrata busca pelo serviço ("fotógrafo casamento"), não pelo nome de quem ainda não conhece.',
      },
      {
        trecho: '60 casais desde 2019 · SP e litoral',
        porque:
          'Volume + tempo + onde atende. Três objeções de contratação resolvidas em uma linha: é experiente, é constante, e atende aqui.',
      },
      {
        trecho: 'Orçamento e datas livres no link 👇',
        porque:
          'Diz o que tem do outro lado. "Link na bio" sozinho não dá motivo pra clicar — o motivo é o que a pessoa vai encontrar.',
      },
      {
        trecho: 'Destaque "Investimento"',
        porque:
          'Preço é a dúvida que trava contratação. Enfrentar cedo filtra quem não é cliente e acelera quem é.',
      },
    ],
  },
]

export function exemploDoObjetivo(objetivo: Objetivo): Exemplo | undefined {
  return EXEMPLOS.find((e) => e.objetivo === objetivo)
}

/**
 * ─────────────────────────────────────────────────────────────────────────
 * AS REGRAS — arquivo de dados, separado da lógica do motor.
 *
 * Cada regra carrega:
 *   mensagem     o que está errado
 *   porque       a razão, em uma frase
 *   comoResolver a FÓRMULA para resolver — nunca o texto pronto
 *   exemplo      a fórmula aplicada, pra forma ficar concreta
 *   elogio       o que dizer quando a regra passa (ensina o acerto)
 *
 * O app não escreve o perfil pela pessoa: mostra a forma e o motivo, e deixa
 * ela preencher com o que é dela. Quem aprende o motivo escreve sozinho depois.
 *
 * A ORDEM importa: dentro da mesma severidade, a regra que aparece primeiro
 * aqui é considerada mais impactante (usada no "próximo passo único").
 *
 * kind 'auto'      → o motor avalia a cada tecla (condicao true = violada)
 * kind 'self-check'→ o que a máquina não enxerga; a pessoa confirma
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { Regra } from '@/engine/tipos'
import {
  apontaParaLink,
  contarEmojis,
  convidaParaDirect,
  encontrarTrecho,
  linkEhAgregador,
  normContem,
  PADROES_DIRECT,
  PADROES_LINK,
  pareceSoNomeProprio,
  primeiraLinha,
  tamanho,
} from '@/engine/texto'
import { FRASES_GENERICAS } from './listas'

export const REGRAS: Regra[] = [
  /* ── LINK & BOTÃO DE AÇÃO — a coerência CTA × objetivo é a regra mais
        valiosa do app inteiro, por isso abre a lista ─────────────────────── */
  {
    id: 'link-contradicao-direct',
    bloco: 'link',
    severidade: 'critica',
    aplicaObjetivos: ['direct'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => apontaParaLink(p.bio + ' ' + p.ctaBotao),
    evidencia: (p) => encontrarTrecho(p.bio + ' ' + p.ctaBotao, PADROES_LINK),
    mensagem: 'Você escolheu conversa no direct, mas o perfil empurra pro link.',
    porque:
      'Convite e botão apontando pra lugares diferentes deixam quem chega sem saber o que fazer — e quem não sabe o que fazer não faz nada.',
    comoResolver:
      'Escolha um destino só e apague o outro convite. Se é direct: tire o "clique no link" da bio e deixe a última linha chamando pra mensagem.',
    exemplo: 'Última linha: "Me chama no direct pra ver se faz sentido pra você 👇"',
    elogio: 'Bio e botão apontam pro mesmo lugar — quem chega sabe exatamente o que fazer.',
  },
  {
    id: 'link-direct-sem-convite',
    bloco: 'link',
    severidade: 'critica',
    aplicaObjetivos: ['direct'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.bio.trim() !== '' && !convidaParaDirect(p.bio + ' ' + p.ctaBotao),
    mensagem: 'Seu objetivo é o direct, mas nada no perfil convida pra mensagem.',
    porque:
      'Quase ninguém manda mensagem sem ser chamado — o convite explícito ("me chama no direct") é o que abre a conversa.',
    comoResolver:
      'Última linha da bio = o convite. Fórmula: [verbo de ação] + [onde] + [o que a pessoa ganha ao mandar].',
    exemplo: '"Manda um oi no direct e eu te digo em 2 minutos se dá pra te ajudar"',
  },
  {
    id: 'link-contradicao-link',
    bloco: 'link',
    severidade: 'critica',
    aplicaObjetivos: ['link'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) =>
      convidaParaDirect(p.bio + ' ' + p.ctaBotao) && !apontaParaLink(p.bio + ' ' + p.ctaBotao),
    evidencia: (p) =>
      encontrarTrecho(p.bio + ' ' + p.ctaBotao, [...PADROES_DIRECT, 'direct', 'dm ', ' dm']),
    mensagem: 'Você quer venda pelo link, mas o perfil chama pro direct.',
    porque:
      'Cada pedido diferente divide a atenção — se a venda é no link, todo convite do perfil precisa apontar pra ele.',
    comoResolver:
      'Troque o convite de mensagem pelo convite de clique, e deixe o link ser o único caminho citado na bio.',
    exemplo: '"Peça o seu pelo link 👇" no lugar de "chama no direct"',
  },
  {
    id: 'link-vazio',
    bloco: 'link',
    severidade: 'critica',
    aplicaObjetivos: ['link'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.link.trim() === '',
    mensagem: 'Seu objetivo é venda pelo link — e o link está vazio.',
    porque: 'Sem link não existe clique: é a única porta que leva ao seu objetivo.',
    comoResolver:
      'Coloque o endereço da página onde a compra acontece — a página final, não a home do site.',
    exemplo: 'loja.com/produto (não loja.com)',
  },
  {
    id: 'link-destino-unico',
    bloco: 'link',
    severidade: 'importante',
    aplicaObjetivos: ['link'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => linkEhAgregador(p.link),
    evidencia: (p) => p.link.trim() || null,
    mensagem: 'Seu link é uma lista de links, não um destino único.',
    porque:
      'Cada opção a mais divide o clique — quem quer vender aponta todo mundo pra uma porta só.',
    comoResolver:
      'Pergunte: qual UMA ação vale mais pra mim hoje? Aponte o link direto pra ela e guarde o resto pros destaques.',
    exemplo: 'Link direto pro checkout ou pro WhatsApp, em vez do Linktree com 8 botões',
    elogio: 'O link vai direto a um destino só — o clique não se dilui no caminho.',
  },
  {
    id: 'link-sem-empurrao',
    bloco: 'link',
    severidade: 'importante',
    aplicaObjetivos: ['link'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.bio.trim() !== '' && !apontaParaLink(p.bio + ' ' + p.ctaBotao),
    mensagem: 'Nada na bio manda a pessoa pro link.',
    porque:
      'O link sozinho não se apresenta — é a última linha da bio que diz "é ali que você clica".',
    comoResolver:
      'Última linha = seta + motivo pra clicar. Fórmula: [o que tem lá] + 👇',
    exemplo: '"Tabela de preços e horários no link 👇"',
  },

  /* ── BIO ──────────────────────────────────────────────────────────────── */
  {
    id: 'bio-vazia',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.bio.trim() === '',
    mensagem: 'A bio está vazia.',
    porque:
      'A bio é a resposta das duas perguntas de quem chega: pra quem é isso e o que eu ganho aqui.',
    comoResolver:
      'Três linhas: 1) pra quem você é + o que resolve · 2) uma prova ou diferencial concreto · 3) o convite pra ação.',
    exemplo: 'Nutrição pra quem treina pesado / +400 atletas atendidos / Me chama no direct 👇',
  },
  {
    id: 'bio-teste-concorrente',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => FRASES_GENERICAS.some((f) => normContem(p.bio, f)),
    evidencia: (p) => encontrarTrecho(p.bio, FRASES_GENERICAS),
    mensagem: 'Essa frase serviria pra qualquer concorrente seu — então não serve pra você.',
    porque:
      'Se qualquer um do seu ramo pode assinar a frase, ela não diz nada sobre você — o que diferencia é o específico.',
    comoResolver:
      'Troque o adjetivo pelo número, pelo nicho ou pelo método. Teste: se o concorrente pode copiar e colar, reescreva.',
    exemplo: '"Ajudo pessoas a emagrecer" → "Emagrecimento pra mãe que não tem 1h pra academia"',
    elogio: 'A bio fala de algo específico seu — não é frase que qualquer concorrente poderia assinar.',
  },
  {
    id: 'bio-150-caracteres',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => tamanho(p.bio) > 150,
    evidencia: (p) => {
      const corte = [...p.bio].slice(150).join('').trim()
      return corte ? `…${corte}` : null
    },
    mensagem: 'A bio passou de 150 caracteres — o Instagram corta o resto.',
    porque: 'O que passa do limite simplesmente não é publicado: são 150 e pronto.',
    comoResolver:
      'Corte adjetivo e repetição, não informação. Cada linha precisa ganhar o espaço dela — se não muda a decisão de quem lê, sai.',
  },
  {
    id: 'bio-primeira-linha-longa',
    bloco: 'bio',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => tamanho(primeiraLinha(p.bio)) > 60,
    evidencia: (p) => `${primeiraLinha(p.bio)} (${tamanho(primeiraLinha(p.bio))} caracteres)`,
    mensagem: 'A primeira linha está longa demais.',
    porque:
      'Só a primeira linha aparece antes do "mais" — o essencial precisa caber nela ou fica escondido.',
    comoResolver:
      'Deixe a 1ª linha com até ~60 caracteres, respondendo só "pra quem é + o que resolve". O resto desce pras linhas seguintes.',
    exemplo: 'Linha 1: "Nutrição esportiva pra quem treina pesado" (41 caracteres)',
    elogio: 'A primeira linha cabe antes do "mais" — o essencial aparece sem ninguém precisar expandir.',
  },
  {
    id: 'bio-emoji-excesso',
    bloco: 'bio',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => contarEmojis(p.bio) > 5,
    evidencia: (p) => {
      const achados = p.bio.match(/\p{Extended_Pictographic}/gu) ?? []
      return `${achados.join(' ')} — ${achados.length} emojis`
    },
    mensagem: 'Emoji demais na bio.',
    porque:
      'Emoji como marcador de linha guia a leitura; emoji decorativo em excesso vira ruído e esconde o texto.',
    comoResolver:
      'Um emoji por linha, no começo, funcionando como marcador. Tire os que só enfeitam o fim da frase.',
    exemplo: '📍 São Paulo · 🕐 Seg a sex, 9h–18h · 👇 Agende no link',
  },
  {
    id: 'bio-local-endereco',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: ['local'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => !p.cidade?.trim() || !normContem(p.bio, p.cidade),
    mensagem: 'Quem precisa te achar no mapa não encontra bairro nem cidade na bio.',
    porque:
      'Pra quem decide "vou ou não vou", endereço e horário são a informação — sem eles a visita morre na dúvida.',
    comoResolver: 'Uma linha com 📍 bairro/cidade e outra com 🕐 os horários de funcionamento.',
    exemplo: '📍 Rua X, 123 — Moema · 🕐 Ter a sáb, 9h–19h',
    elogio: 'O endereço está na bio — quem decide "vou ou não vou" tem a informação na hora.',
  },
  {
    id: 'bio-responde-pra-quem',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'Sua bio responde PRA QUEM é o perfil e O QUE MUDA pra essa pessoa?',
    porque:
      'Quem chega decide em segundos se aquilo é pra ela — se a bio não responde, ela vai embora sem descobrir.',
    comoResolver:
      'Leia sua 1ª linha em voz alta e pergunte: um estranho saberia dizer se isso é pra ele? Se hesitar, falta o "pra quem".',
  },

  /* ── NOME (o campo Nome, não o @) ─────────────────────────────────────── */
  {
    id: 'nome-vazio',
    bloco: 'nome',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.nome.trim() === '',
    mensagem: 'O campo Nome está vazio.',
    porque:
      'O Nome é o único campo que o Instagram usa na busca — vazio, você não existe pra quem procura.',
    comoResolver: 'Fórmula: [seu nome] + [o que você faz]. É o campo da busca, não o da identidade.',
    exemplo: 'Ana Ribeiro | Nutricionista Esportiva',
  },
  {
    id: 'nome-so-nome-proprio',
    bloco: 'nome',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => pareceSoNomeProprio(p.nome),
    evidencia: (p) => p.nome.trim(),
    mensagem: 'O campo Nome tem só o seu nome — não diz o que você faz.',
    porque:
      'O Nome é o único campo que o Instagram usa na busca — quem procura "nutricionista esportiva" só te acha se estiver escrito ali.',
    comoResolver:
      'Some o termo que as pessoas digitam pra achar alguém como você. Fórmula: [seu nome] + [termo de busca].',
    exemplo: '"Ana Ribeiro" → "Ana Ribeiro | Nutricionista Esportiva"',
    elogio: 'O Nome diz o que você faz — é o único campo que a busca do Instagram lê, e ele está trabalhando.',
  },
  {
    id: 'nome-30-caracteres',
    bloco: 'nome',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => tamanho(p.nome) > 30,
    evidencia: (p) => {
      const corte = [...p.nome].slice(30).join('').trim()
      return corte ? `…${corte} fica de fora` : null
    },
    mensagem: 'O Nome passou de 30 caracteres.',
    porque: 'O Instagram corta o que passa de 30 — a parte mais importante pode sumir.',
    comoResolver:
      'Corte o sobrenome antes de cortar o ofício: quem busca procura pelo que você faz, não pelo seu sobrenome.',
    exemplo: '"Ana Ribeiro | Nutricionista Esportiva" → "Ana | Nutricionista Esportiva"',
  },
  {
    id: 'nome-cidade-local',
    bloco: 'nome',
    severidade: 'importante',
    aplicaObjetivos: ['local'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => !p.cidade?.trim() || !normContem(p.nome, p.cidade),
    mensagem: 'Falta a cidade ou o bairro no campo Nome.',
    porque:
      'Quem busca serviço local busca com o lugar junto ("dentista moema") — e a busca só olha o campo Nome.',
    comoResolver: 'Fórmula: [nome ou marca] + [ofício] + [bairro/cidade], dentro dos 30 caracteres.',
    exemplo: 'Clínica Sorriso | Dentista Moema',
    elogio: 'A cidade está no Nome — quem busca "seu serviço + seu bairro" te encontra.',
  },

  /* ── USUÁRIO (@) ──────────────────────────────────────────────────────── */
  {
    id: 'usuario-vazio',
    bloco: 'usuario',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.usuario.trim() === '',
    mensagem: 'O @ está vazio.',
    porque: 'O @ é como as pessoas te procuram e te marcam — sem ele não dá pra te indicar.',
    comoResolver: 'Escolha o mais curto e falável possível: seu nome ou sua marca, sem enfeite.',
  },
  {
    id: 'usuario-dificil-de-ditar',
    bloco: 'usuario',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => /[_.]|\d/.test(p.usuario),
    evidencia: (p) => `@${p.usuario}`,
    mensagem: 'Underline, ponto ou número no @ — difícil de ditar e de lembrar.',
    porque:
      'O @ precisa sobreviver ao boca a boca: se a pessoa ouve e não sabe escrever, ela não te encontra.',
    comoResolver:
      'Faça o teste do telefone: fale seu @ em voz alta pra alguém escrever. Se precisar soletrar, troque. Prefira juntar palavras a usar _ . ou número.',
    exemplo: '@ana_ribeiro.nutri93 → @ananutricionista',
    elogio: 'O @ é fácil de falar e escrever de ouvido — sobrevive ao boca a boca.',
  },
  {
    id: 'usuario-coerente-marca',
    bloco: 'usuario',
    severidade: 'refino',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'O @ é coerente com o nome da sua marca (dá pra adivinhar um pelo outro)?',
    porque:
      'Quando @ e marca coincidem, quem lembra de um acha o outro — cada diferença é uma chance de errar a busca.',
    comoResolver: 'Se não puder mudar o @, aproxime o campo Nome dele — um dos dois precisa ceder.',
  },

  /* ── FOTO ─────────────────────────────────────────────────────────────── */
  {
    id: 'foto-ausente',
    bloco: 'foto',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => !p.foto,
    mensagem: 'Sem foto de perfil.',
    porque:
      'Perfil sem foto lê como perfil abandonado ou falso — ninguém segue nem chama quem parece não existir.',
    comoResolver:
      'Pessoa: rosto do peito pra cima, fundo limpo, luz na frente. Negócio: o símbolo da marca, sem texto.',
  },
  {
    id: 'foto-reconhecivel-40px',
    bloco: 'foto',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'Sua foto continua reconhecível no círculo pequeno (40px) ao lado do preview?',
    porque:
      'No feed e no direct a foto aparece minúscula — se não dá pra reconhecer ali, ela não trabalha por você.',
    comoResolver:
      'Aproxime até o rosto (ou o símbolo) ocupar quase todo o círculo. Se você precisa apertar os olhos, está longe demais.',
  },
  {
    id: 'foto-rosto-perto',
    bloco: 'foto',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: ['pessoa', 'criador'],
    kind: 'self-check',
    mensagem: 'O rosto está grande, do peito pra cima, com fundo limpo?',
    porque:
      'Pessoa segue pessoa: é o rosto que cria o reconhecimento — corpo inteiro vira silhueta no círculo.',
    comoResolver:
      'Corte na altura do peito, deixe o rosto ocupar ~60% do círculo e escolha um fundo sem informação.',
  },
  {
    id: 'foto-simbolo-nao-logo',
    bloco: 'foto',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: ['negocio'],
    kind: 'self-check',
    mensagem: 'A foto é o símbolo da marca — e não o logo com texto pequeno?',
    porque: 'Logo horizontal com letra vira borrão dentro do círculo — o símbolo sozinho sobrevive.',
    comoResolver:
      'Use só o ícone/monograma da marca, centralizado e com folga nas bordas. O nome já está no campo Nome.',
  },

  /* ── DESTAQUES ────────────────────────────────────────────────────────── */
  {
    id: 'destaques-menos-de-4',
    bloco: 'destaques',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.destaques.filter((d) => d.nome.trim() !== '').length < 4,
    mensagem: 'Menos de 4 destaques planejados.',
    porque:
      'Só os 4 primeiros aparecem sem rolar — são as únicas posições que importam, e vazias não dizem nada.',
    comoResolver:
      'Preencha as 4 primeiras posições na ordem da jornada: quem sou → prova → como funciona → como comprar.',
    exemplo: 'Sobre mim · Resultados · Como funciona · Planos',
    elogio: 'Os 4 primeiros destaques estão preenchidos — as únicas posições visíveis sem rolar.',
  },
  {
    id: 'destaques-nome-comprido',
    bloco: 'destaques',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.destaques.some((d) => tamanho(d.nome.trim()) > 10),
    evidencia: (p) =>
      p.destaques
        .map((d) => d.nome.trim())
        .filter((n) => tamanho(n) > 10)
        .map((n) => `“${n}”`)
        .join(' · ') || null,
    mensagem: 'Nome de destaque comprido demais — vai aparecer cortado.',
    porque: 'O espaço embaixo da bolinha é minúsculo: passou de ~10 letras, o Instagram corta com "…".',
    comoResolver: 'Uma palavra por destaque, até 10 letras. Substantivo, não frase.',
    exemplo: '"Como funciona o método" → "Método"',
  },
  {
    id: 'destaques-ordem-jornada',
    bloco: 'destaques',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'Os 4 primeiros seguem a jornada: quem sou → prova → como funciona → como comprar?',
    porque:
      'Quem chega segue a ordem que você deixou — se a jornada está fora de ordem, a pessoa se perde antes do fim.',
    comoResolver:
      'Reordene arrastando no Instagram: o destaque mais recente vai pra frente, então republique um story no que você quer em 1º.',
  },
  {
    id: 'destaques-capa-consistente',
    bloco: 'destaques',
    severidade: 'refino',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'As capas são legíveis em tela pequena e seguem um mesmo padrão visual?',
    porque:
      'Capas iguais entre si leem como coleção organizada — cada estilo diferente é um perfil que parece improvisado.',
    comoResolver:
      'Mesmo fundo, mesma família de ícone, mesmo peso. Se usar texto na capa, uma palavra só e bem grande.',
  },

  /* ── GRID (9 primeiras miniaturas) ────────────────────────────────────── */
  {
    id: 'grid-texto-miniatura',
    bloco: 'grid',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'Olhando o grid no tamanho real de miniatura: os textos das capas continuam legíveis?',
    porque:
      'Capa de vídeo com texto pequeno é o erro campeão — no feed ela tem 3cm, e texto ilegível é capa em branco.',
    comoResolver:
      'Máximo 4 palavras por capa, na maior fonte que couber. Teste afastando o celular meio metro: se não lê, aumenta.',
  },
  {
    id: 'grid-tema-visivel',
    bloco: 'grid',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'self-check',
    mensagem: 'Um estranho, só olhando as 9 miniaturas (sem ler nada), saberia dizer sobre o que é o perfil?',
    porque:
      'As 9 primeiras são o cartão de visita — quem bate o olho decide se fica antes de ler qualquer legenda.',
    comoResolver:
      'Mostre o print das 9 pra alguém de fora e pergunte "o que essa pessoa faz?". Se errar, falta repetir o tema.',
  },
  {
    /* usa os números da captura automática — na entrada manual (sem
       totalPosts) simplesmente não dispara */
    id: 'grid-pouco-conteudo',
    bloco: 'grid',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.totalPosts !== undefined && p.totalPosts < 9,
    evidencia: (p) =>
      p.totalPosts !== undefined
        ? `${p.totalPosts} ${p.totalPosts === 1 ? 'post publicado' : 'posts publicados'}`
        : null,
    mensagem: 'O perfil tem menos de 9 posts — o grid nem preenche a primeira tela.',
    porque:
      'Quem chega e encontra meia dúzia de posts lê como perfil parado — e perfil parado não ganha seguidor nem venda.',
    comoResolver:
      'Antes de qualquer tráfego, complete as 9 primeiras posições: alterne ensina · prova · bastidor · oferta.',
  },
  {
    id: 'grid-incompleto',
    bloco: 'grid',
    severidade: 'refino',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.grid.filter((g) => g.imagem).length < 9,
    mensagem: 'O plano das 9 miniaturas está incompleto.',
    porque:
      'O grid é avaliado como conjunto — planejar as 9 juntas é o que garante a coerência que um post de cada vez não dá.',
    comoResolver:
      'Planeje as 9 de uma vez, alternando os tipos: ensina · prova · bastidor · oferta, repetindo o ciclo.',
  },

  /* ── FIXADOS (3 posts fixos) ──────────────────────────────────────────── */
  {
    id: 'fixados-vazios',
    bloco: 'fixados',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => !p.fixados.some((f) => f.papel || f.titulo?.trim() || f.imagem),
    mensagem: 'Nenhum post fixado planejado — oportunidade desperdiçada.',
    porque:
      'Os 3 fixados são a home page do perfil: é a única vitrine que você controla por inteiro, e está vazia.',
    comoResolver:
      'Fixe 3 posts que você já tem, um de cada papel: apresentação, prova social e oferta. No post: ⋯ → Fixar no perfil.',
    elogio: 'Os fixados estão trabalhando — a única vitrine que você controla por inteiro está ocupada.',
  },
  {
    id: 'fixados-combinacao',
    bloco: 'fixados',
    severidade: 'refino',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => {
      const papeis = new Set(p.fixados.map((f) => f.papel).filter(Boolean))
      // só cobra a combinação de quem já começou a planejar os fixados
      return papeis.size > 0 && !(papeis.has('apresentacao') && papeis.has('prova') && papeis.has('oferta'))
    },
    mensagem: 'A combinação dos fixados não cobre: apresentação, prova social e oferta.',
    porque:
      'Os três juntos respondem em sequência o que todo visitante pergunta: quem é você, por que confiar, e o que fazer agora.',
    comoResolver:
      'Um de cada: 1) quem você é e pra quem trabalha · 2) resultado de cliente ou depoimento · 3) o que você vende e como comprar.',
  },
]

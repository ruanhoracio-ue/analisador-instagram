/**
 * ─────────────────────────────────────────────────────────────────────────
 * AS REGRAS — arquivo de dados, separado da lógica do motor.
 *
 * Cada regra carrega a mensagem (o que está errado) e o PORQUÊ em uma frase:
 * o app não escreve o perfil pela pessoa — aponta o problema e explica.
 *
 * A ORDEM importa: dentro da mesma severidade, a regra que aparece primeiro
 * aqui é considerada mais impactante (usada no "próximo passo único").
 *
 * kind 'auto'      → o motor avalia a cada tecla (condicao devolve true = violada)
 * kind 'self-check'→ o que a máquina não enxerga; vira checklist que a pessoa marca
 * ─────────────────────────────────────────────────────────────────────────
 */
import type { Regra } from '@/engine/tipos'
import {
  apontaParaLink,
  contarEmojis,
  convidaParaDirect,
  linkEhAgregador,
  normContem,
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
    mensagem: 'Você escolheu conversa no direct, mas o perfil empurra pro link.',
    porque:
      'Convite e botão apontando pra lugares diferentes deixam quem chega sem saber o que fazer — e quem não sabe o que fazer não faz nada.',
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
    mensagem: 'Você quer venda pelo link, mas o perfil chama pro direct.',
    porque:
      'Cada pedido diferente divide a atenção — se a venda é no link, todo convite do perfil precisa apontar pra ele.',
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
  },
  {
    id: 'link-destino-unico',
    bloco: 'link',
    severidade: 'importante',
    aplicaObjetivos: ['link'],
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => linkEhAgregador(p.link),
    mensagem: 'Seu link é uma lista de links, não um destino único.',
    porque:
      'Cada opção a mais divide o clique — quem quer vender aponta todo mundo pra uma porta só.',
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
  },
  {
    id: 'bio-teste-concorrente',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => FRASES_GENERICAS.some((f) => normContem(p.bio, f)),
    mensagem: 'Essa frase serviria pra qualquer concorrente seu — então não serve pra você.',
    porque:
      'Se qualquer um do seu ramo pode assinar a frase, ela não diz nada sobre você — o que diferencia é o específico.',
  },
  {
    id: 'bio-150-caracteres',
    bloco: 'bio',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => tamanho(p.bio) > 150,
    mensagem: 'A bio passou de 150 caracteres — o Instagram corta o resto.',
    porque: 'O que passa do limite simplesmente não é publicado: são 150 e pronto.',
  },
  {
    id: 'bio-primeira-linha-longa',
    bloco: 'bio',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => tamanho(primeiraLinha(p.bio)) > 60,
    mensagem: 'A primeira linha está longa demais.',
    porque:
      'Só a primeira linha aparece antes do "mais" — o essencial precisa caber nela ou fica escondido.',
  },
  {
    id: 'bio-emoji-excesso',
    bloco: 'bio',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => contarEmojis(p.bio) > 5,
    mensagem: 'Emoji demais na bio.',
    porque:
      'Emoji como marcador de linha guia a leitura; emoji decorativo em excesso vira ruído e esconde o texto.',
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
  },
  {
    id: 'nome-so-nome-proprio',
    bloco: 'nome',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => pareceSoNomeProprio(p.nome),
    mensagem: 'O campo Nome tem só o seu nome — não diz o que você faz.',
    porque:
      'O Nome é o único campo que o Instagram usa na busca — quem procura "nutricionista esportiva" só te acha se estiver escrito ali.',
  },
  {
    id: 'nome-30-caracteres',
    bloco: 'nome',
    severidade: 'critica',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => tamanho(p.nome) > 30,
    mensagem: 'O Nome passou de 30 caracteres.',
    porque: 'O Instagram corta o que passa de 30 — a parte mais importante pode sumir.',
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
  },
  {
    id: 'usuario-dificil-de-ditar',
    bloco: 'usuario',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => /[_.]|\d/.test(p.usuario),
    mensagem: 'Underline, ponto ou número no @ — difícil de ditar e de lembrar.',
    porque:
      'O @ precisa sobreviver ao boca a boca: se a pessoa ouve e não sabe escrever, ela não te encontra.',
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
  },
  {
    id: 'destaques-nome-comprido',
    bloco: 'destaques',
    severidade: 'importante',
    aplicaObjetivos: 'todos',
    aplicaTipos: 'todos',
    kind: 'auto',
    condicao: (p) => p.destaques.some((d) => tamanho(d.nome.trim()) > 10),
    mensagem: 'Nome de destaque comprido demais — vai aparecer cortado.',
    porque: 'O espaço embaixo da bolinha é minúsculo: passou de ~10 letras, o Instagram corta com "…".',
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
  },
]

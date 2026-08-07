# Construtor de Perfil — Instagram

App web que ajuda alunos de uma escola de marketing a deixar o perfil do
Instagram **coerente com o objetivo** que têm para ele.

**A regra que vale para tudo:** o app não escreve o perfil pela pessoa. Ele
reage ao que ela escreve, aponta o problema e explica o porquê — toda sugestão
sai com a razão em uma frase, em linguagem simples.

## Módulos

- **Construtor** (esta versão) — monta o perfil campo a campo com preview fiel
  ao lado, em 5 passos: objetivo → edição → painel de coerência → antes/depois
  → kit de aplicação.
- **Diagnóstico** (futuro) — recebe um perfil existente e devolve o que está
  errado. Compartilha o mesmo motor de regras.

## Arquitetura

```
src/
  engine/          motor de regras — módulo puro, sem React, testado
    tipos.ts       Perfil, Objetivo, Regra, Avaliacao…
    texto.ts       heurísticas de texto (CTA, frases genéricas, limites)
    avaliar.ts     avaliar(perfil) → violações + notas por bloco + próximo passo
  data/
    regras.ts      AS REGRAS — arquivo de dados, editável sem tocar na lógica
    listas.ts      frases genéricas, agregadores de link, sinais de ofício
  components/      as 5 telas + preview fiel do Instagram
  lib/             estado (localStorage) + imagens (IndexedDB)
  app/             Next.js (App Router) + tokens do design system
```

- **Objetivo é o eixo**: cada regra declara a quais objetivos e tipos se
  aplica. Mudar o objetivo muda as regras.
- **Dois tipos de regra**: `auto` (avaliada a cada tecla) e `self-check`
  (o que a máquina não enxerga vira checklist reflexivo).
- **Nota por bloco**, nunca nota geral — e um bloco com crítica em aberto
  trava em 3.
- **Sem backend**: tudo roda no navegador. Texto no localStorage, imagens no
  IndexedDB.

## Rodando

```bash
npm install
npm run dev    # http://localhost:3000
npm test       # testes do motor (vitest)
npm run build
```

## Design

Tokens e componentes portados do design system
[Conversão Extrema](https://github.com/ruanhoracio-ue/design-system-conversao)
— tema claro priorizado (branco, hairlines de 1px, esmeralda com parcimônia).

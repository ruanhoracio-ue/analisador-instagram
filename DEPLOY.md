# Publicar na Cloudflare (Workers)

O app roda inteiro no Cloudflare Workers — páginas e rotas de API — via o
adaptador oficial [OpenNext](https://opennext.js.org/cloudflare). A configuração
já está no repositório (`wrangler.jsonc`, `open-next.config.ts`).

## Publicação automática a cada push (recomendado)

1. Painel da Cloudflare → **Compute (Workers)** → **Create** →
   **Import a repository** → conecte o GitHub e escolha `analisador-instagram`.
2. A Cloudflare detecta o Next.js sozinha. Se pedir os comandos:
   - Build command: `npx opennextjs-cloudflare build`
   - Deploy command: `npx wrangler deploy`
3. Depois do primeiro deploy, abra o Worker → **Settings → Variables and
   Secrets** e adicione como **Secret**:
   - `IG_ACCESS_TOKEN` (captura automática — seção abaixo)
   - `OPENAI_API_KEY` (análise com IA — seção abaixo)
   - `OPENAI_MODEL` *(opcional)*
4. Faça um novo deploy (**Deployments → Retry/Deploy**) para o app pegar os
   segredos. Confira na tela de análise com o "Conferir a configuração".

A cada push na branch principal a Cloudflare rebuilda e publica sozinha.

## Publicar da sua máquina (alternativa)

```
npm run preview   # roda local no runtime real do Workers
npm run deploy    # builda e publica
```

*(exige `npx wrangler login` uma vez; segredos via `npx wrangler secret put NOME`)*

---

# Configurar a análise com IA (OpenAI)

Liga a "leitura de estrategista": a IA lê o perfil diagnosticado e devolve uma
análise específica do nicho — complementando as regras, nunca escrevendo o
perfil pela pessoa.

1. Crie uma chave em <https://platform.openai.com/api-keys> — de preferência
   num **Project** próprio ("Instagram Extremo"), para ver o gasto separado e
   poder revogar sem afetar outros apps.
2. No Worker: **Settings → Variables and Secrets** → **Add** (tipo Secret):

   | Nome | Valor |
   | :--- | :--- |
   | `OPENAI_API_KEY` | `sk-proj-…` |
   | `OPENAI_MODEL` *(opcional)* | modelo a usar — padrão `gpt-4o-mini` |

3. Faça um novo deploy.

Custo: com `gpt-4o-mini`, cada análise sai por ~R$0,01. Sem a chave, o app
continua inteiro — o botão de IA responde "não configurado" e as regras seguem.

---

# Configurar a captura automática de perfil

O app funciona **sem nenhuma configuração** — a análise manual (colar os campos)
sempre funciona. Este guia liga o extra: puxar os dados do perfil só com o @.

## Como funciona

Usamos o endpoint **Business Discovery** do Instagram Graph API. É o caminho
oficial da Meta: uma conta Profissional consulta dados **públicos** de outra
conta Profissional.

**O que ele entrega:** nome, bio, link, foto de perfil, nº de seguidores,
nº de posts e as capas dos posts recentes.

**O que ele NÃO entrega:** destaques e posts fixados (a API não expõe) — esses
continuam sendo marcados à mão na tela.

**Limite importante:** o perfil analisado precisa ser **Comercial ou Criador de
Conteúdo**. Perfil pessoal comum não é alcançável — nesse caso o app avisa e a
pessoa preenche na mão.

## Passo a passo (uma vez só, ~20 min)

### 1. Tenha uma conta Instagram Profissional
No Instagram: **Configurações → Tipo de conta → Mudar para conta profissional**
(Comercial ou Criador). Essa é a *sua* conta, a que faz as consultas.

### 2. Conecte a uma Página do Facebook
Instagram: **Configurações → Central de Contas → Adicionar Página do Facebook**.
Se não tiver uma Página, crie uma vazia — ela só serve de ponte.

### 3. Crie um app no Meta for Developers
1. Acesse <https://developers.facebook.com/apps> → **Criar app**
2. Tipo: **Empresa (Business)**
3. Adicione o produto **Instagram Graph API**

### 4. Gere o token
1. Abra o **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>
2. Selecione seu app e adicione as permissões:
   - `instagram_basic`
   - **`instagram_manage_insights`** ← exigida pelo Business Discovery
   - `pages_show_list`
   - `pages_read_engagement`
3. Clique em **Generate Access Token** e autorize

> ⚠️ Marque as permissões **antes** de clicar em Generate: o token recebe os
> escopos no momento em que é criado, e a lista na tela é só o pedido.
>
> Sem `instagram_manage_insights` a API responde `(#10) Application does not
> have permission` — o mesmo erro de um token sem escopo nenhum, o que torna
> a causa difícil de adivinhar. Use o "Conferir a configuração" na tela de
> análise para ver o que o token realmente carrega.

> Não é preciso anotar o ID da conta: o app descobre sozinho, a partir do
> próprio token. (Se quiser fixar um ID específico — útil se o acesso enxerga
> várias contas — use a variável opcional `IG_BUSINESS_ACCOUNT_ID`.)

### 5. Troque por um token de longa duração
O token do Explorer expira em ~1h. Para um de ~60 dias:

```
GET https://graph.facebook.com/v21.0/oauth/access_token
  ?grant_type=fb_exchange_token
  &client_id=SEU_APP_ID
  &client_secret=SEU_APP_SECRET
  &fb_exchange_token=TOKEN_CURTO
```

> ⚠️ O token de 60 dias **expira**. Quando expirar, o app avisa na tela
> ("o acesso precisa ser renovado") e a análise manual segue funcionando.
> Repita este passo para renovar.

### 6. Configure na hospedagem
No Worker (Cloudflare): **Settings → Variables and Secrets**, adicione **um**
segredo:

| Nome | Valor |
| :--- | :--- |
| `IG_ACCESS_TOKEN` | o token longo do passo 5 |

Depois faça um novo deploy para o app pegar a variável.

*(Opcional: `IG_BUSINESS_ACCOUNT_ID` para fixar uma conta específica, caso o
acesso enxergue várias.)*

### Para testar local
Crie um arquivo `.env.local` na raiz do projeto (ele já está no `.gitignore`):

```
IG_ACCESS_TOKEN=EAAG...
```

## Segurança

O token **nunca chega ao navegador**: ele só existe como variável de ambiente
no servidor, lida pela rota `/api/perfil`. Nunca commite o token no Git.

## Publicar em hospedagem estática

O Cloudflare Workers já roda tudo, incluindo as rotas de API. Mas se um dia
você preferir hospedagem de arquivo estático puro (S3, GitHub Pages), ligue
`output: 'export'` no `next.config.ts` — o app inteiro continua funcionando,
só a captura automática e a análise com IA saem de cena e fica a análise
manual por regras.

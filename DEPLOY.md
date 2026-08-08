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

### 4. Gere o token e descubra o ID da conta
1. Abra o **Graph API Explorer**: <https://developers.facebook.com/tools/explorer>
2. Selecione seu app e adicione as permissões:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
3. Clique em **Generate Access Token** e autorize
4. Rode esta consulta para achar o ID da sua conta Instagram:
   ```
   me/accounts?fields=instagram_business_account{id,username}
   ```
   Anote o `id` que aparecer dentro de `instagram_business_account`.

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

### 6. Configure na Vercel
No painel da Vercel: **Settings → Environment Variables**, adicione:

| Nome | Valor |
| :--- | :--- |
| `IG_BUSINESS_ACCOUNT_ID` | o `id` do passo 4 |
| `IG_ACCESS_TOKEN` | o token longo do passo 5 |

Depois clique em **Redeploy** para o app pegar as variáveis.

### Para testar local
Crie um arquivo `.env.local` na raiz do projeto (ele já está no `.gitignore`):

```
IG_BUSINESS_ACCOUNT_ID=178414...
IG_ACCESS_TOKEN=EAAG...
```

## Segurança

O token **nunca chega ao navegador**: ele só existe como variável de ambiente
no servidor, lida pela rota `/api/perfil`. Nunca commite o token no Git.

## Publicar em hospedagem estática

A captura automática exige servidor. Se um dia você preferir hospedagem de
arquivo estático (Cloudflare Pages, S3), ligue `output: 'export'` no
`next.config.ts` — o app inteiro continua funcionando, só a captura automática
sai de cena e fica a análise manual.

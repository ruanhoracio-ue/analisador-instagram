import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/*
 * Config padrão: sem cache incremental (o app não usa ISR — as páginas são
 * estáticas e as rotas /api/* são sempre dinâmicas), então não precisa de
 * KV/R2. Se um dia entrar ISR, ver https://opennext.js.org/cloudflare/caching
 */
export default defineCloudflareConfig()

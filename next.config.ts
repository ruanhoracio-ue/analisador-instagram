import type { NextConfig } from 'next'

/**
 * Publicado no Cloudflare Workers via @opennextjs/cloudflare (ver
 * wrangler.jsonc e DEPLOY.md): as páginas saem estáticas e as rotas /api/*
 * rodam no worker.
 * Para hospedagem de arquivo estático puro (S3…), basta ligar
 * `output: 'export'` aqui e servir a pasta `out/` — as rotas /api/* (captura
 * e IA) saem de cena, o resto segue. Verificado.
 */
const nextConfig: NextConfig = {}

export default nextConfig

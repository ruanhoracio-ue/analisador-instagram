import type { NextConfig } from 'next'

/**
 * O app é 100% cliente: todas as rotas saem pré-renderizadas como estáticas.
 * Para publicar em hospedagem de arquivo estático (Cloudflare Pages, S3…),
 * basta ligar `output: 'export'` aqui e servir a pasta `out/`.
 * Verificado: o export gera as 5 rotas e o motor de regras roda normalmente.
 */
const nextConfig: NextConfig = {}

export default nextConfig

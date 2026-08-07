import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SCRIPT_ANTI_FLASH } from '@/components/ThemeToggle'
import './globals.css'

export const metadata: Metadata = {
  title: 'Instagram Extremo — Diagnóstico e Construtor de Perfil',
  description:
    'Deixe seu perfil do Instagram coerente com o seu objetivo — campo por campo, com o porquê de cada ajuste.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* aplica o tema antes da primeira pintura — sem flash branco */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_ANTI_FLASH }} />
      </head>
      <body className="ds-app min-h-screen">
        <div className="ds-dotgrid" aria-hidden="true" />
        {children}
      </body>
    </html>
  )
}

'use client'
/**
 * Tema claro/escuro — mesmo mecanismo do design system: a classe `dark` em
 * <html> é a fonte de verdade, persistida em localStorage. useSyncExternalStore
 * mantém todos os toggles da página sincronizados sem prop drilling.
 *
 * Nenhum componente lê o tema: todos usam tokens semânticos.
 */
import { useSyncExternalStore } from 'react'

const CHAVE = 'tema'
const ouvintes = new Set<() => void>()

function avisar() {
  ouvintes.forEach((f) => f())
}

function inscrever(f: () => void) {
  ouvintes.add(f)
  return () => {
    ouvintes.delete(f)
  }
}

function lerCliente(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

/** no servidor o HTML sai sempre claro; o script anti-flash corrige antes de pintar */
function lerServidor(): 'dark' | 'light' {
  return 'light'
}

export function useTheme() {
  const tema = useSyncExternalStore(inscrever, lerCliente, lerServidor)

  const alternar = () => {
    const proximo = tema === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', proximo === 'dark')
    try {
      localStorage.setItem(CHAVE, proximo)
    } catch {
      /* modo privado: só não persiste */
    }
    avisar()
  }

  return { tema, alternar }
}

/** script que aplica o tema ANTES da primeira pintura — evita o flash branco */
export const SCRIPT_ANTI_FLASH = `(function(){try{var t=localStorage.getItem('${CHAVE}');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { tema, alternar } = useTheme()
  const escuro = tema === 'dark'
  return (
    <button
      onClick={alternar}
      aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface text-mute transition-colors hover:border-hairline-strong hover:text-ink ${className}`}
    >
      {escuro ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path d="M20 13.5A8.5 8.5 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z" />
        </svg>
      )}
    </button>
  )
}

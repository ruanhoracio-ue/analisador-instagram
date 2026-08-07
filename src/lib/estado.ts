'use client'
/**
 * Estado do construtor: texto no localStorage (sobrevive ao F5), imagens no
 * IndexedDB. O Perfil que o motor recebe é montado a partir dos dois.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Objetivo, Perfil, PapelFixado, Tipo } from '@/engine/tipos'
import { lerTodasImagens, removerImagem, salvarImagem } from './idb'

export interface EstadoAntes {
  nome: string
  usuario: string
  bio: string
  link: string
}

export interface EstadoTexto {
  tipo: Tipo
  objetivo: Objetivo | null
  nome: string
  usuario: string
  bio: string
  link: string
  ctaBotao: string
  cidade: string
  destaques: { nome: string }[]
  fixados: { titulo: string; papel: PapelFixado | '' }[]
  /** estado atual do perfil (opcional) — alimenta o antes/depois */
  antes: EstadoAntes
  antesPreenchido: boolean
  confirmados: string[]
  passo: number
}

const CHAVE = 'construtor-perfil:v1'

export function estadoInicial(): EstadoTexto {
  return {
    tipo: 'pessoa',
    objetivo: null,
    nome: '',
    usuario: '',
    bio: '',
    link: '',
    ctaBotao: '',
    cidade: '',
    destaques: [{ nome: '' }, { nome: '' }, { nome: '' }, { nome: '' }],
    fixados: [
      { titulo: '', papel: '' },
      { titulo: '', papel: '' },
      { titulo: '', papel: '' },
    ],
    antes: { nome: '', usuario: '', bio: '', link: '' },
    antesPreenchido: false,
    confirmados: [],
    passo: 0,
  }
}

export function useEstado() {
  const [estado, setEstado] = useState<EstadoTexto>(estadoInicial)
  const [imagens, setImagens] = useState<Record<string, string>>({})
  const [pronto, setPronto] = useState(false)
  const salvarTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* hidratar do localStorage + IndexedDB uma vez, no cliente */
  useEffect(() => {
    try {
      const bruto = localStorage.getItem(CHAVE)
      if (bruto) {
        const salvo = JSON.parse(bruto) as Partial<EstadoTexto>
        setEstado({ ...estadoInicial(), ...salvo })
      }
    } catch {
      /* estado corrompido: começa do zero */
    }
    lerTodasImagens()
      .then(setImagens)
      .catch(() => {})
      .finally(() => setPronto(true))
  }, [])

  /* persistir texto com debounce curto */
  useEffect(() => {
    if (!pronto) return
    if (salvarTimer.current) clearTimeout(salvarTimer.current)
    salvarTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(CHAVE, JSON.stringify(estado))
      } catch {
        /* quota — ignora */
      }
    }, 250)
    return () => {
      if (salvarTimer.current) clearTimeout(salvarTimer.current)
    }
  }, [estado, pronto])

  const mudar = useCallback(<K extends keyof EstadoTexto>(campo: K, valor: EstadoTexto[K]) => {
    setEstado((e) => ({ ...e, [campo]: valor }))
  }, [])

  const definirImagem = useCallback((id: string, dataUrl: string | null) => {
    setImagens((m) => {
      const novo = { ...m }
      if (dataUrl) novo[id] = dataUrl
      else delete novo[id]
      return novo
    })
    if (dataUrl) salvarImagem(id, dataUrl).catch(() => {})
    else removerImagem(id).catch(() => {})
  }, [])

  const alternarConfirmado = useCallback((id: string) => {
    setEstado((e) => ({
      ...e,
      confirmados: e.confirmados.includes(id)
        ? e.confirmados.filter((c) => c !== id)
        : [...e.confirmados, id],
    }))
  }, [])

  /** o Perfil que o motor avalia — composto de texto + presença de imagens */
  const perfil: Perfil = useMemo(
    () => ({
      tipo: estado.tipo,
      objetivo: estado.objetivo ?? 'direct',
      foto: imagens['foto'] ? 'foto' : undefined,
      nome: estado.nome,
      usuario: estado.usuario,
      bio: estado.bio,
      link: estado.link,
      ctaBotao: estado.ctaBotao,
      cidade: estado.cidade || undefined,
      destaques: estado.destaques.map((d, i) => ({
        nome: d.nome,
        capa: imagens[`destaque-${i}`],
      })),
      grid: Array.from({ length: 9 }, (_, i) => ({ imagem: imagens[`grid-${i}`] })),
      fixados: estado.fixados.map((f, i) => ({
        titulo: f.titulo || undefined,
        papel: f.papel || undefined,
        imagem: imagens[`fixado-${i}`],
      })),
    }),
    [estado, imagens],
  )

  const confirmados = useMemo(() => new Set(estado.confirmados), [estado.confirmados])

  return {
    estado,
    setEstado,
    mudar,
    imagens,
    definirImagem,
    perfil,
    confirmados,
    alternarConfirmado,
    pronto,
  }
}

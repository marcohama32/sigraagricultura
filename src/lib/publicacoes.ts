import { v4 as uuidv4 } from 'uuid'

// ── Tipos ───────────────────────────────────────────────────
export type TipoPublicacao =
  | 'Relatório Anual de Actividades'
  | 'Boletim Estatístico Agrário'
  | 'Plano Económico e Social (PES)'
  | 'Balanço do PES'
  | 'Manual Técnico / Guia'
  | 'Comunicado de Imprensa'
  | 'Discurso Ministerial'
  | 'Política / Estratégia / Plano'
  | 'Resultado de Inquérito Agrário (TIA/IAA)'
  | 'Publicação Científica / Artigo'
  | 'Boletim Meteorológico Agrário'
  | 'Outro'

export type StatusPublicacao = 'Publicado' | 'Rascunho' | 'Em Revisão' | 'Arquivado'
export type IdiomaPublicacao = 'Português' | 'Inglês' | 'Francês' | 'Nyanja' | 'Macua' | 'Sena'
export type AcessoPublicacao = 'Público' | 'Restrito — Uso Interno' | 'Confidencial'

export interface Publicacao {
  id: string

  // ── Identificação ─────────────────────────────────────────
  titulo: string
  tipo: TipoPublicacao
  subtitulo: string
  status: StatusPublicacao
  idioma: IdiomaPublicacao
  acesso: AcessoPublicacao

  // ── Autoria / Instituição ─────────────────────────────────
  entidade_autora: string     // Ex: MADER / DNAS / IIAM / INE
  autores: string             // Nomes dos autores (comma separated)
  departamento: string        // Direcção/Departamento responsável
  responsavel: string         // Ponto focal

  // ── Metadados Editoriais ──────────────────────────────────
  data_publicacao: string
  ano_referencia: string      // Ano a que se referem os dados (ex: 2023)
  numero_edicao: string       // Ex: "3ª Edição" / "Volume 12"
  isbn_issn: string
  numero_paginas: number
  cobertura_geografica: string // Nacional / Niassa / etc.

  // ── Temática ─────────────────────────────────────────────
  area_tematica: string       // Ex: Produção Agrícola, Irrigação, Sementes
  palavras_chave: string      // Comma separated
  sumario_executivo: string
  link_documento: string      // URL ou caminho do ficheiro

  // ── Distribuição ─────────────────────────────────────────
  numero_exemplares: number
  canais_distribuicao: string // Ex: Portal MADER, FAO, SIMA, Email

  observacoes: string
  created_at: string
}

export type PublicacaoInput = Omit<Publicacao, 'id' | 'created_at'>

export function defaultPublicacao(): PublicacaoInput {
  return {
    titulo: '', tipo: 'Relatório Anual de Actividades',
    subtitulo: '', status: 'Publicado', idioma: 'Português',
    acesso: 'Público',
    entidade_autora: 'MADER — Ministério da Agricultura e Desenvolvimento Rural',
    autores: '', departamento: '', responsavel: '',
    data_publicacao: '', ano_referencia: new Date().getFullYear().toString(),
    numero_edicao: '', isbn_issn: '', numero_paginas: 0,
    cobertura_geografica: 'Nacional',
    area_tematica: '', palavras_chave: '', sumario_executivo: '',
    link_documento: '', numero_exemplares: 0,
    canais_distribuicao: '', observacoes: '',
  }
}

// ── LocalStorage CRUD ───────────────────────────────────────
const STORAGE_KEY = 'agri_publicacoes'
function getLocal(): Publicacao[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveLocal(list: Publicacao[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
export async function getAllPublicacoes(): Promise<Publicacao[]> { return getLocal() }
export async function createPublicacao(input: PublicacaoInput): Promise<Publicacao> {
  const item: Publicacao = { ...input, id: uuidv4(), created_at: new Date().toISOString() }
  const list = getLocal(); list.unshift(item); saveLocal(list); return item
}
export async function updatePublicacao(id: string, input: Partial<PublicacaoInput>): Promise<void> {
  const list = getLocal()
  const idx = list.findIndex(p => p.id === id)
  if (idx !== -1) { list[idx] = { ...list[idx], ...input }; saveLocal(list) }
}
export async function deletePublicacao(id: string): Promise<void> {
  saveLocal(getLocal().filter(p => p.id !== id))
}

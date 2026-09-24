import { v4 as uuidv4 } from 'uuid'

// ── Tipos ───────────────────────────────────────────────────
export type EstadoConcurso =
  | 'Anunciado' | 'Aberto / Em Curso' | 'Em Avaliação'
  | 'Adjudicado' | 'Deserto / Anulado' | 'Concluído'

export type ModalidadeConcurso =
  | 'Concurso Público Nacional'
  | 'Concurso Público Internacional'
  | 'Concurso Limitado'
  | 'Concurso por Cotações'
  | 'Ajuste Directo'
  | 'Manifestação de Interesse — Pessoa Singular'
  | 'Manifestação de Interesse — Pessoa Colectiva'

export type CategoriaConcurso = 'Bens' | 'Serviços' | 'Obras' | 'Pessoal'

export interface Concurso {
  id: string

  // ── Identificação ─────────────────────────────────────────
  referencia: string         // Nº do concurso: ex CR-010/CP/MAAP/DINAMC/2026
  titulo: string             // Objecto do concurso
  ugea: string               // Unidade Gestora Executora das Aquisições
  descricao: string          // Descrição/especificação detalhada

  // ── Categorização ─────────────────────────────────────────
  categoria_objecto: CategoriaConcurso
  modalidade: ModalidadeConcurso
  regime: string             // Geral / Especial / Simplificado
  estado: EstadoConcurso

  // ── Financiamento ─────────────────────────────────────────
  financiador: string
  valor_estimado: number
  moeda: string              // MZN / USD / EUR
  valor_caderno: number      // Preço do caderno de encargos
  garantia_bancaria: string  // Ex: "2% do valor da proposta" ou "Não Exigida"
  programa_projecto: string  // Projecto financiador (ex: SUSTENTA, PROIRRI)

  // ── Datas ─────────────────────────────────────────────────
  data_publicacao: string
  data_limite_submissao: string
  data_abertura: string
  validade_propostas: number // dias

  // ── Local e Documentação ─────────────────────────────────
  local_submissao: string
  contacto_ugea: string      // Email/telefone da UGEA
  link_edital: string        // Link para PDF do edital/TDR

  // ── Adjudicação ───────────────────────────────────────────
  empresa_adjudicataria: string
  valor_adjudicado: number
  data_adjudicacao: string
  prazo_execucao: string

  observacoes: string
  created_at: string
}

export type ConcursoInput = Omit<Concurso, 'id' | 'created_at'>

export function defaultConcurso(): ConcursoInput {
  return {
    referencia: '', titulo: '', ugea: '', descricao: '',
    categoria_objecto: 'Bens', modalidade: 'Concurso Público Nacional',
    regime: 'Geral', estado: 'Anunciado',
    financiador: 'Orçamento do Estado (OE)', valor_estimado: 0,
    moeda: 'MZN', valor_caderno: 0, garantia_bancaria: '', programa_projecto: '',
    data_publicacao: '', data_limite_submissao: '', data_abertura: '',
    validade_propostas: 90,
    local_submissao: '', contacto_ugea: '', link_edital: '',
    empresa_adjudicataria: '', valor_adjudicado: 0,
    data_adjudicacao: '', prazo_execucao: '', observacoes: '',
  }
}

// ── LocalStorage CRUD ───────────────────────────────────────
const STORAGE_KEY = 'agri_concursos'
function getLocal(): Concurso[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveLocal(list: Concurso[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
export async function getAllConcursos(): Promise<Concurso[]> { return getLocal() }
export async function createConcurso(input: ConcursoInput): Promise<Concurso> {
  const item: Concurso = { ...input, id: uuidv4(), created_at: new Date().toISOString() }
  const list = getLocal(); list.unshift(item); saveLocal(list); return item
}
export async function updateConcurso(id: string, input: Partial<ConcursoInput>): Promise<void> {
  const list = getLocal()
  const idx = list.findIndex(c => c.id === id)
  if (idx !== -1) { list[idx] = { ...list[idx], ...input }; saveLocal(list) }
}
export async function deleteConcurso(id: string): Promise<void> {
  saveLocal(getLocal().filter(c => c.id !== id))
}

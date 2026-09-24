import { v4 as uuidv4 } from 'uuid'

// ── Tipos ───────────────────────────────────────────────────
export type StatusPrograma = 'Em Execução' | 'Concluído' | 'Suspenso' | 'Em Preparação' | 'Em Atraso'
export type TipoFinanciamento = 'Doação' | 'Empréstimo' | 'Governo de Moçambique' | 'Contrapartida Nacional' | 'Misto'
export type TipoPrograma = 'Programa Nacional' | 'Projecto de Investimento' | 'Projecto de Cooperação Técnica' | 'Programa Regional' | 'Fundo de Desenvolvimento'
export type ComponenteArea = 'Irrigação e Gestão de Água' | 'Sementes e Melhoramento Vegetal' | 'Mecanização Agrícola' | 'Segurança Alimentar e Nutricional' | 'Comercialização e Mercados' | 'Crédito e Seguros Agrícolas' | 'Extensão Rural e Capacitação' | 'Infraestruturas Rurais' | 'Conservação de Recursos Naturais' | 'Pecuária e Sanidade Animal' | 'Pescas e Aquacultura' | 'Investigação e Inovação Agronómica' | 'Género e Inclusão Social' | 'Gestão e Coordenação'

export interface ComponentePrograma {
  nome: string
  area: ComponenteArea | string
  orcamento_usd: number
  execucao_pct: number
  descricao: string
}

export interface MarcoPrograma {
  descricao: string
  data_prevista: string
  data_realizada: string
  status: 'Concluído' | 'Em Curso' | 'Pendente' | 'Em Atraso'
}

export interface Programa {
  id: string

  // ── Identificação ─────────────────────────────────────────
  nome: string                      // Nome oficial completo
  sigla: string                     // Acrónimo (ex: PROIRRI, SUSTENTA)
  tipo: TipoPrograma
  descricao: string                 // Descrição dos objectivos
  sector_principal: string          // Sector agrícola principal
  areas_componentes: string         // JSON: ComponenteArea[]

  // ── Enquadramento Estratégico ─────────────────────────────
  instrumento_politica: string      // Política/estratégia que enquadra (ex: PNISA, PEDSA)
  objectivo_desenvolvimento: string // Objectivo geral
  resultados_esperados: string      // Resultados/outputs principais

  // ── Estado e Calendário ───────────────────────────────────
  status: StatusPrograma
  data_inicio: string
  data_fim: string
  duracao_anos: number
  fase_actual: string               // ex: Fase I, Fase II

  // ── Cobertura Geográfica ──────────────────────────────────
  ambito: string                    // Nacional / Provincial / Distrital
  provincias: string                // Comma-separated
  distritos_alvo: number           // Nº de distritos abrangidos
  beneficiarios_directos: number   // Nº de beneficiários directos

  // ── Financiamento ─────────────────────────────────────────
  tipo_financiamento: TipoFinanciamento
  doador_principal: string          // ex: Banco Mundial, JICA, FIDA, BAD, UE, USAID
  parceiros_cofinanciadores: string // Comma-separated
  orcamento_total_usd: number       // Orçamento total em USD
  orcamento_gomz_usd: number        // Contrapartida nacional (GoMZ)
  orcamento_doador_usd: number      // Financiamento externo
  desembolsado_pct: number          // % do orçamento desembolsado
  codigo_acordo: string             // Nº do acordo/contrato de financiamento
  data_acordo: string               // Data de assinatura do acordo

  // ── Implementação ─────────────────────────────────────────
  entidade_executora: string        // Entidade responsável pela execução
  unidade_gestao: string            // Unidade de Gestão do Projecto (UGP/UIP)
  director_programa: string         // Director/Coordenador
  contacto_ugp: string              // Email ou telefone da UGP
  implementacao_pct: number         // Grau de implementação (0-100)
  componentes: string               // JSON: ComponentePrograma[]

  // ── Monitoria e Avaliação ─────────────────────────────────
  marcos: string                    // JSON: MarcoPrograma[]
  relatorio_progresso: string       // Link/referência ao último relatório
  ultima_missao_supervisao: string  // Data da última missão de supervisão
  proxima_missao: string            // Data da próxima missão
  avaliacao_intermedia: string      // Data/resultado da avaliação intercalar
  rating_desempenho: string         // Satisfatório / Moderadamente Satisfatório / etc.

  // ── Resultados Alcançados ─────────────────────────────────
  agricultores_beneficiados: number
  area_reabilitada_ha: number       // Área de irrigação reabilitada (ha)
  area_nova_ha: number              // Nova área irrigada (ha)
  infraestruturas_construidas: string // Descrição de infraestruturas
  formacoes_realizadas: number      // Nº de formações/capacitações

  // ── Documentação ─────────────────────────────────────────
  documento_projecto: string        // PAD / Project Appraisal Document
  relatorios_publicados: string     // Links a relatórios
  observacoes: string
  created_at: string
}

export type ProgramaInput = Omit<Programa, 'id' | 'created_at'>

// ── Defaults ────────────────────────────────────────────────
export function defaultPrograma(): ProgramaInput {
  return {
    nome: '', sigla: '', tipo: 'Projecto de Investimento',
    descricao: '', sector_principal: '', areas_componentes: '[]',
    instrumento_politica: '', objectivo_desenvolvimento: '', resultados_esperados: '',
    status: 'Em Execução', data_inicio: '', data_fim: '',
    duracao_anos: 0, fase_actual: '',
    ambito: 'Nacional', provincias: '', distritos_alvo: 0, beneficiarios_directos: 0,
    tipo_financiamento: 'Empréstimo', doador_principal: '', parceiros_cofinanciadores: '',
    orcamento_total_usd: 0, orcamento_gomz_usd: 0, orcamento_doador_usd: 0,
    desembolsado_pct: 0, codigo_acordo: '', data_acordo: '',
    entidade_executora: 'MADER — Ministério da Agricultura e Desenvolvimento Rural',
    unidade_gestao: '', director_programa: '', contacto_ugp: '',
    implementacao_pct: 0, componentes: '[]',
    marcos: '[]', relatorio_progresso: '', ultima_missao_supervisao: '',
    proxima_missao: '', avaliacao_intermedia: '', rating_desempenho: '',
    agricultores_beneficiados: 0, area_reabilitada_ha: 0, area_nova_ha: 0,
    infraestruturas_construidas: '', formacoes_realizadas: 0,
    documento_projecto: '', relatorios_publicados: '', observacoes: '',
  }
}

// ── LocalStorage CRUD ───────────────────────────────────────
const STORAGE_KEY_PROGRAMAS = 'agri_programas'

function getLocalProgramas(): Programa[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PROGRAMAS)
    if (!data) return []
    return JSON.parse(data) as Programa[]
  } catch { return [] }
}

function saveLocalProgramas(list: Programa[]) {
  localStorage.setItem(STORAGE_KEY_PROGRAMAS, JSON.stringify(list))
}

export async function getAllProgramas(): Promise<Programa[]> {
  return getLocalProgramas()
}

export async function createPrograma(input: ProgramaInput): Promise<Programa> {
  const item: Programa = {
    ...input,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  }
  const list = getLocalProgramas()
  list.unshift(item)
  saveLocalProgramas(list)
  return item
}

export async function updatePrograma(id: string, input: Partial<ProgramaInput>): Promise<void> {
  const list = getLocalProgramas()
  const idx = list.findIndex(p => p.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...input }
    saveLocalProgramas(list)
  }
}

export async function deletePrograma(id: string): Promise<void> {
  const list = getLocalProgramas().filter(p => p.id !== id)
  saveLocalProgramas(list)
}

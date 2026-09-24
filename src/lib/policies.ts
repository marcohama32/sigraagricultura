import { db, isLocalFallback } from './db'
import { v4 as uuidv4 } from 'uuid'

export interface PolicyAnexo {
  nome: string
  url: string // base64 data URL or http link
}

export interface Policy {
  id: string
  tipo: string
  titulo: string
  descricao: string
  categoria: string
  status: 'Ativa' | 'Inativa' | 'Em Revisão'
  responsavel: string
  data_inicio: string
  data_fim: string
  metas: string
  documento_url: string
  conteudo_completo: string
  // Módulo 2 — Âmbito Geográfico
  ambito: string
  provincias: string // comma-separated
  // Módulo 5 — Monitoria & Avaliação
  implementacao_pct: number
  estado_monitoria: string
  ultima_revisao: string
  proxima_revisao: string
  quadro_logico: string
  fonte_verificacao: string
  frequencia_monitoria: string
  responsavel_ma: string
  orcamento_ma: string
  riscos_mitigacao: string
  licoes_aprendidas: string
  // Módulo 6 — Parceiros
  parceiros: string // comma-separated
  // Módulo 3 — Anexos múltiplos
  anexos: string // JSON string of PolicyAnexo[]
  created_at: string
}

export type PolicyInput = Omit<Policy, 'id' | 'created_at'>

function rowToPolicy(row: Record<string, unknown>): Policy {
  return {
    id: String(row.id ?? ''),
    tipo: String(row.tipo ?? 'Política'),
    titulo: String(row.titulo ?? ''),
    descricao: String(row.descricao ?? ''),
    categoria: String(row.categoria ?? ''),
    status: (row.status as Policy['status']) ?? 'Ativa',
    responsavel: String(row.responsavel ?? ''),
    data_inicio: String(row.data_inicio ?? ''),
    data_fim: String(row.data_fim ?? ''),
    metas: String(row.metas ?? ''),
    documento_url: String(row.documento_url ?? ''),
    conteudo_completo: String(row.conteudo_completo ?? ''),
    ambito: String(row.ambito ?? 'Nacional'),
    provincias: String(row.provincias ?? ''),
    implementacao_pct: Number(row.implementacao_pct ?? 0),
    estado_monitoria: String(row.estado_monitoria ?? 'Em Curso'),
    ultima_revisao: String(row.ultima_revisao ?? ''),
    proxima_revisao: String(row.proxima_revisao ?? ''),
    quadro_logico: String(row.quadro_logico ?? ''),
    fonte_verificacao: String(row.fonte_verificacao ?? ''),
    frequencia_monitoria: String(row.frequencia_monitoria ?? ''),
    responsavel_ma: String(row.responsavel_ma ?? ''),
    orcamento_ma: String(row.orcamento_ma ?? ''),
    riscos_mitigacao: String(row.riscos_mitigacao ?? ''),
    licoes_aprendidas: String(row.licoes_aprendidas ?? ''),
    parceiros: String(row.parceiros ?? ''),
    anexos: String(row.anexos ?? '[]'),
    created_at: String(row.created_at ?? ''),
  }
}

// --- Local Storage Fallback Helpers ---
const STORAGE_KEY = 'agri_policies'

function getLocalPolicies(): Policy[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  return JSON.parse(data)
}

function saveLocalPolicies(policies: Policy[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policies))
}
// ---------------------------------------

// ------- READ -------
export async function getAllPolicies(): Promise<Policy[]> {
  if (isLocalFallback || !db) {
    const list = getLocalPolicies()
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  const result = await db.execute('SELECT * FROM policies ORDER BY created_at DESC')
  return result.rows.map(r => rowToPolicy(r as Record<string, unknown>))
}

export async function getPolicyById(id: string): Promise<Policy | null> {
  if (isLocalFallback || !db) {
    const list = getLocalPolicies()
    return list.find(p => p.id === id) || null
  }
  const result = await db.execute({ sql: 'SELECT * FROM policies WHERE id = ?', args: [id] })
  if (result.rows.length === 0) return null
  return rowToPolicy(result.rows[0] as Record<string, unknown>)
}

// ------- CREATE -------
export async function createPolicy(input: PolicyInput): Promise<Policy> {
  const id = uuidv4()
  const created_at = new Date().toISOString()
  const newPolicy: Policy = { id, ...input, created_at }

  if (isLocalFallback || !db) {
    const list = getLocalPolicies()
    list.push(newPolicy)
    saveLocalPolicies(list)
    return newPolicy
  }

  await db.execute({
    sql: `INSERT INTO policies
            (id, tipo, titulo, descricao, categoria, status, responsavel, data_inicio, data_fim, metas,
             documento_url, conteudo_completo, ambito, provincias, implementacao_pct, estado_monitoria,
             ultima_revisao, proxima_revisao, parceiros, anexos, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id, input.tipo, input.titulo, input.descricao, input.categoria, input.status, input.responsavel,
      input.data_inicio, input.data_fim, input.metas, input.documento_url, input.conteudo_completo,
      input.ambito, input.provincias, input.implementacao_pct, input.estado_monitoria,
      input.ultima_revisao, input.proxima_revisao, input.parceiros, input.anexos, created_at,
    ],
  })
  return newPolicy
}

// ------- UPDATE -------
export async function updatePolicy(id: string, input: Partial<PolicyInput>): Promise<void> {
  if (isLocalFallback || !db) {
    const list = getLocalPolicies()
    const index = list.findIndex(p => p.id === id)
    if (index !== -1) {
      list[index] = { ...list[index], ...input }
      saveLocalPolicies(list)
    }
    return
  }

  const fields = Object.keys(input) as (keyof PolicyInput)[]
  if (fields.length === 0) return
  const set = fields.map(f => `${f} = ?`).join(', ')
  const values = fields.map(f => input[f] ?? '')
  await db.execute({ sql: `UPDATE policies SET ${set} WHERE id = ?`, args: [...values, id] })
}

// ------- DELETE -------
export async function deletePolicy(id: string): Promise<void> {
  if (isLocalFallback || !db) {
    let list = getLocalPolicies()
    list = list.filter(p => p.id !== id)
    saveLocalPolicies(list)
    return
  }
  await db.execute({ sql: 'DELETE FROM policies WHERE id = ?', args: [id] })
}

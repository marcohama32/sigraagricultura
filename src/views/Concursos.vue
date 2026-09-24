<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDragScroll } from '../composables/useDragScroll'
import {
  getAllConcursos, createConcurso, updateConcurso, deleteConcurso, defaultConcurso
} from '../lib/concursos'
import type { Concurso, ConcursoInput, EstadoConcurso } from '../lib/concursos'
import {
  ClipboardList, Plus, Search, X, BarChart2, FileText,
  Clock, CheckCircle2, AlertCircle, Briefcase, Pencil, Trash2,
  Save, Loader2, DollarSign, Calendar, Building2, AlertTriangle
} from 'lucide-vue-next'

// ── State ───────────────────────────────────────────────────
const concursos  = ref<Concurso[]>([])
const loading    = ref(false)
const saving     = ref(false)
const view       = ref<'stats' | 'list'>('stats')
const showForm   = ref(false)
const editingId  = ref<string | null>(null)
const searchQuery = ref('')
const filterStatus = ref('')
const activeTab  = ref<'identificacao' | 'financiamento' | 'datas' | 'adjudicacao'>('identificacao')

const tabBarRef = ref<HTMLElement | null>(null)
useDragScroll(tabBarRef)

onMounted(async () => {
  loading.value = true
  concursos.value = await getAllConcursos()
  loading.value = false
})

// ── KPIs ────────────────────────────────────────────────────
const emCurso      = computed(() => concursos.value.filter(c => c.estado === 'Aberto / Em Curso').length)
const emAvaliacao  = computed(() => concursos.value.filter(c => c.estado === 'Em Avaliação').length)
const adjudicados  = computed(() => concursos.value.filter(c => c.estado === 'Adjudicado' || c.estado === 'Concluído').length)
const totalValor   = computed(() => concursos.value.reduce((s, c) => s + (c.valor_estimado || 0), 0))

// ── Filter ──────────────────────────────────────────────────
const filtered = computed(() => {
  let list = concursos.value
  if (filterStatus.value) list = list.filter(c => c.estado === filterStatus.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(c =>
      c.titulo.toLowerCase().includes(q) ||
      c.referencia.toLowerCase().includes(q) ||
      c.ugea.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Stats ───────────────────────────────────────────────────
const byEstado = computed(() => {
  const m: Record<string, number> = {}
  for (const c of concursos.value) m[c.estado] = (m[c.estado] ?? 0) + 1
  return m
})
const byModalidade = computed(() => {
  const m: Record<string, number> = {}
  for (const c of concursos.value) m[c.modalidade] = (m[c.modalidade] ?? 0) + 1
  return Object.entries(m).sort((a,b) => b[1]-a[1])
})

// ── Form ────────────────────────────────────────────────────
const form = ref<ConcursoInput>(defaultConcurso())

function openNew() {
  form.value = defaultConcurso()
  editingId.value = null
  activeTab.value = 'identificacao'
  showForm.value = true
}
function openEdit(c: Concurso) {
  const { id, created_at, ...rest } = c
  form.value = { ...rest }
  editingId.value = id
  activeTab.value = 'identificacao'
  showForm.value = true
}
function closeForm() { showForm.value = false }

async function submitForm() {
  if (!form.value.titulo.trim()) { activeTab.value = 'identificacao'; alert('O objecto do concurso é obrigatório.'); return }
  saving.value = true
  try {
    if (editingId.value) {
      await updateConcurso(editingId.value, form.value)
    } else {
      await createConcurso(form.value)
    }
    concursos.value = await getAllConcursos()
    showForm.value = false
  } finally { saving.value = false }
}

async function remove(id: string) {
  if (!confirm('Confirma a eliminação deste registo?')) return
  await deleteConcurso(id)
  concursos.value = concursos.value.filter(c => c.id !== id)
}

// ── Helpers ─────────────────────────────────────────────────
function fmtVal(v: number, moeda = 'MZN') {
  if (!v) return '—'
  if (v >= 1_000_000) return `${moeda} ${(v/1_000_000).toFixed(1)} M`
  if (v >= 1_000)     return `${moeda} ${(v/1_000).toFixed(0)} K`
  return `${moeda} ${v.toLocaleString()}`
}
function estadoColor(s: EstadoConcurso): string {
  const m: Record<string, string> = {
    'Anunciado':           '#2563eb',
    'Aberto / Em Curso':   '#16a34a',
    'Em Avaliação':        '#d97706',
    'Adjudicado':          '#0d9488',
    'Deserto / Anulado':   '#dc2626',
    'Concluído':           '#6b7280',
  }
  return m[s] ?? '#6b7280'
}
function estadoBg(s: EstadoConcurso): string {
  const m: Record<string, string> = {
    'Anunciado':           '#dbeafe',
    'Aberto / Em Curso':   '#dcfce7',
    'Em Avaliação':        '#fef3c7',
    'Adjudicado':          '#ccfbf1',
    'Deserto / Anulado':   '#fee2e2',
    'Concluído':           '#f3f4f6',
  }
  return m[s] ?? '#f3f4f6'
}

const UGEAS = [
  'UGEA — MADER (Sede, Maputo)',
  'UFSA — SUSTENTA',
  'UFSA — PROIRRI',
  'UFSA — MOSAP III',
  'DPPADER — Niassa', 'DPPADER — Cabo Delgado', 'DPPADER — Nampula',
  'DPPADER — Zambézia', 'DPPADER — Tete', 'DPPADER — Manica',
  'DPPADER — Sofala', 'DPPADER — Inhambane', 'DPPADER — Gaza',
  'DPPADER — Maputo Província', 'SDAE — Distrital', 'Outro',
]
const FINANCIADORES = [
  'Orçamento do Estado (OE)', 'Banco Mundial (BM)', 'Banco Africano de Desenvolvimento (BAD)',
  'Fundo Internacional de Desenvolvimento Agrícola (FIDA)',
  'Agência Japonesa de Cooperação Internacional (JICA)',
  'USAID', 'União Europeia (UE)', 'GIZ', 'Cooperação Suíça (SDC)',
  'Fundo Verde para o Clima (GCF)', 'Outro',
]
const MOEDAS = ['MZN','USD','EUR','ZAR']
</script>

<template>
  <div class="concursos-view">

    <!-- ══ HEADER ═══════════════════════════════════════════ -->
    <div class="page-header card">
      <div class="page-title-section">
        <div class="page-icon"><ClipboardList :size="22" /></div>
        <div>
          <h1 class="page-title">Concursos Públicos</h1>
          <p class="page-subtitle">Gestão de concursos, licitações e adjudicações — MADER / UGEA</p>
        </div>
      </div>
      <div class="header-actions">
        <div class="view-toggle">
          <button :class="['vt-btn', view === 'stats' && 'active']" @click="view = 'stats'">
            <BarChart2 :size="14" /> Estatísticas
          </button>
          <button :class="['vt-btn', view === 'list' && 'active']" @click="view = 'list'">
            <FileText :size="14" /> Lista
          </button>
        </div>
        <button class="btn-new" @click="openNew"><Plus :size="17" /> Novo Concurso</button>
      </div>
    </div>

    <!-- ══ KPIs ══════════════════════════════════════════════ -->
    <div class="kpi-row">
      <div class="kpi-card kpi-green">
        <div class="kpi-icon-box"><Clock :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Aberto / Em Curso</div>
          <div class="kpi-value">{{ emCurso }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-icon-box"><AlertCircle :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Em Avaliação</div>
          <div class="kpi-value">{{ emAvaliacao }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-icon-box"><CheckCircle2 :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Adjudicados</div>
          <div class="kpi-value">{{ adjudicados }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon-box"><Briefcase :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Total Registados</div>
          <div class="kpi-value">{{ concursos.length }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-icon-box"><DollarSign :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Valor Estimado Total</div>
          <div class="kpi-value">{{ fmtVal(totalValor) }}</div>
        </div>
      </div>
    </div>

    <!-- ══ STATS ══════════════════════════════════════════════ -->
    <template v-if="view === 'stats'">
      <div v-if="!concursos.length" class="empty-state card">
        <ClipboardList :size="52" style="color:#d1d5db" />
        <h3>Nenhum concurso registado</h3>
        <p>Registe concursos públicos, manifestações de interesse e ajustes directos do MADER para acompanhar prazos, valores e adjudicações.</p>
        <div class="tags-row">
          <span class="ex-tag">Concurso Público Nacional</span>
          <span class="ex-tag">Concurso Público Internacional</span>
          <span class="ex-tag">Ajuste Directo</span>
          <span class="ex-tag">Manifestação de Interesse</span>
        </div>
        <button class="btn-new" style="margin-top:8px" @click="openNew">
          <Plus :size="16" /> Registar Primeiro Concurso
        </button>
      </div>
      <div v-else class="stats-grid">
        <div class="stat-card card">
          <h3 class="stat-title">Distribuição por Estado</h3>
          <div class="status-list">
            <div v-for="(count, estado) in byEstado" :key="estado" class="status-row">
              <span class="sr-dot" :style="{ background: estadoColor(estado as EstadoConcurso) }"></span>
              <span class="sr-label">{{ estado }}</span>
              <div class="sr-track">
                <div class="sr-fill" :style="{ width: (count/concursos.length*100)+'%', background: estadoColor(estado as EstadoConcurso) }"></div>
              </div>
              <span class="sr-count">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="stat-card card">
          <h3 class="stat-title">Modalidades Utilizadas</h3>
          <div class="status-list">
            <div v-for="[mod, count] in byModalidade" :key="mod" class="status-row">
              <span class="sr-dot" style="background:#7c3aed"></span>
              <span class="sr-label">{{ mod }}</span>
              <div class="sr-track">
                <div class="sr-fill" :style="{ width: (count/concursos.length*100)+'%', background: '#7c3aed' }"></div>
              </div>
              <span class="sr-count">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="stat-card wide-card card">
          <h3 class="stat-title">Concursos em Aberto — Prazo de Submissão</h3>
          <div class="impl-list">
            <div v-for="c in concursos.filter(x => x.estado === 'Aberto / Em Curso')" :key="c.id" class="impl-row">
              <div class="ir-info">
                <span class="ir-sigla">{{ c.referencia || '—' }}</span>
                <span class="ir-nome">{{ c.titulo }}</span>
              </div>
              <span class="ir-budget">{{ c.data_limite_submissao || '—' }}</span>
              <span class="ir-pct">{{ fmtVal(c.valor_estimado, c.moeda) }}</span>
            </div>
            <p v-if="!concursos.filter(x=>x.estado==='Aberto / Em Curso').length" class="text-hint">Nenhum concurso em aberto</p>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ LIST ══════════════════════════════════════════════ -->
    <template v-if="view === 'list'">
      <div class="toolbar card">
        <div class="search-box">
          <Search :size="16" style="color:#9ca3af;flex-shrink:0" />
          <input v-model="searchQuery" placeholder="Pesquisar referência, objecto ou UGEA…" class="search-input" />
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos os estados</option>
          <option v-for="s in ['Anunciado','Aberto / Em Curso','Em Avaliação','Adjudicado','Deserto / Anulado','Concluído']" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div v-if="filtered.length" class="cc-list">
        <div v-for="c in filtered" :key="c.id" class="cc-card card">
          <div class="cc-top">
            <span class="cc-ref">{{ c.referencia || 'Ref. não definida' }}</span>
            <span class="cc-badge" :style="{ background: estadoBg(c.estado), color: estadoColor(c.estado) }">{{ c.estado }}</span>
            <span class="cc-cat">{{ c.categoria_objecto }}</span>
          </div>
          <h3 class="cc-titulo">{{ c.titulo }}</h3>
          <p class="cc-modalidade">{{ c.modalidade }}</p>
          <div class="cc-meta">
            <span class="cc-meta-item"><Building2 :size="13" /> {{ c.ugea || '—' }}</span>
            <span class="cc-meta-item"><DollarSign :size="13" /> {{ fmtVal(c.valor_estimado, c.moeda) }}</span>
            <span class="cc-meta-item"><Calendar :size="13" /> Limite: {{ c.data_limite_submissao || '—' }}</span>
          </div>
          <div v-if="c.empresa_adjudicataria" class="cc-adj">
            <CheckCircle2 :size="13" style="color:#16a34a" />
            Adjudicado a: <strong>{{ c.empresa_adjudicataria }}</strong> — {{ fmtVal(c.valor_adjudicado, c.moeda) }}
          </div>
          <div class="form-actions" style="padding:0;margin-top:4px">
            <button class="btn-cancel" @click="openEdit(c)"><Pencil :size="14" /> Editar</button>
            <button class="btn-danger" @click="remove(c.id)"><Trash2 :size="14" /> Eliminar</button>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="empty-state card">
        <ClipboardList :size="44" style="color:#d1d5db" />
        <h3>Nenhum resultado encontrado</h3>
        <p>Ajuste os filtros ou registe um novo concurso.</p>
      </div>
    </template>

    <!-- ══ MODAL FORM ════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="overlay" @click.self="closeForm">
          <div class="modal">
            <div class="modal-header">
              <div>
                <h2 class="flex items-center gap-2">
                  <component :is="editingId ? Save : Plus" class="icon-md" />
                  {{ editingId ? 'Actualização de Concurso Público' : 'Registo de Novo Concurso Público' }}
                </h2>
                <p>{{ editingId ? 'Actualize os dados do procedimento de aquisição.' : 'Preencha os campos para registar o procedimento de aquisição no SiGRA.' }}</p>
              </div>
              <button class="close-btn" @click="closeForm"><X :size="20" /></button>
            </div>

            <div ref="tabBarRef" class="tab-bar" @wheel.prevent="(e) => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY }">
              <button :class="['tab-btn', { active: activeTab === 'identificacao' }]" @click="activeTab = 'identificacao'">
                Identificação e Objecto
              </button>
              <button :class="['tab-btn', { active: activeTab === 'financiamento' }]" @click="activeTab = 'financiamento'">
                <DollarSign :size="14" /> Financiamento e Valores
              </button>
              <button :class="['tab-btn', { active: activeTab === 'datas' }]" @click="activeTab = 'datas'">
                <Calendar :size="14" /> Datas e Documentação
              </button>
              <button :class="['tab-btn', { active: activeTab === 'adjudicacao' }]" @click="activeTab = 'adjudicacao'">
                <CheckCircle2 :size="14" /> Adjudicação
              </button>
            </div>

            <form @submit.prevent="submitForm">

              <div class="form-scroll">

              <!-- TAB 1: Identificação -->
              <div v-show="activeTab === 'identificacao'" class="form-grid">
                <div class="field">
                  <label>Número de Referência do Concurso</label>
                  <input v-model="form.referencia" type="text" placeholder="Ex: CR-010/CP/MAAP/UGEA/2026" />
                </div>
                <div class="field">
                  <label>Estado do Procedimento</label>
                  <select v-model="form.estado">
                    <option v-for="s in ['Anunciado','Aberto / Em Curso','Em Avaliação','Adjudicado','Deserto / Anulado','Concluído']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Objecto do Concurso / Denominação <span class="required">*</span></label>
                  <input v-model="form.titulo" type="text" placeholder="Ex: Aquisição de Equipamentos de Irrigação para o Projecto PROIRRI" />
                </div>
                <div class="field">
                  <label>Modalidade de Concurso</label>
                  <select v-model="form.modalidade">
                    <option v-for="m in ['Concurso Público Nacional','Concurso Público Internacional','Concurso Limitado','Concurso por Cotações','Ajuste Directo','Manifestação de Interesse — Pessoa Singular','Manifestação de Interesse — Pessoa Colectiva']" :key="m">{{ m }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Categoria do Objecto</label>
                  <select v-model="form.categoria_objecto">
                    <option v-for="c in ['Bens','Serviços','Obras','Pessoal']" :key="c">{{ c }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Regime</label>
                  <select v-model="form.regime">
                    <option v-for="r in ['Geral','Especial','Simplificado']" :key="r">{{ r }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>UGEA / Entidade Contratante</label>
                  <select v-model="form.ugea">
                    <option value="">Seleccionar…</option>
                    <option v-for="u in UGEAS" :key="u">{{ u }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Descrição / Especificação do Objecto</label>
                  <textarea v-model="form.descricao" rows="4" placeholder="Descreva o objecto da aquisição, finalidade, âmbito geográfico e principais requisitos técnicos…"></textarea>
                </div>
                <div class="field full">
                  <label>Contacto da UGEA (e-mail / telefone)</label>
                  <input v-model="form.contacto_ugea" type="text" placeholder="ugea@mader.gov.mz / +258 21 xxx xxx" />
                </div>
              </div>

              <!-- TAB 2: Financiamento -->
              <div v-show="activeTab === 'financiamento'" class="form-grid">
                <div class="field">
                  <label>Fonte de Financiamento</label>
                  <select v-model="form.financiador">
                    <option value="">Seleccionar…</option>
                    <option v-for="f in FINANCIADORES" :key="f">{{ f }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Programa / Projecto Financiador</label>
                  <input v-model="form.programa_projecto" type="text" placeholder="Ex: SUSTENTA, PROIRRI, MOSAP III" />
                </div>
                <div class="field">
                  <label>Valor Estimado da Aquisição</label>
                  <input v-model.number="form.valor_estimado" type="number" min="0" placeholder="Ex: 5000000" />
                </div>
                <div class="field">
                  <label>Moeda</label>
                  <select v-model="form.moeda">
                    <option v-for="m in MOEDAS" :key="m">{{ m }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Preço do Caderno de Encargos</label>
                  <input v-model.number="form.valor_caderno" type="number" min="0" placeholder="Ex: 500 (MZN)" />
                </div>
                <div class="field">
                  <label>Garantia Bancária / Caução Exigida</label>
                  <input v-model="form.garantia_bancaria" type="text" placeholder="Ex: 2% do valor da proposta / Não Exigida" />
                </div>
                <div class="field">
                  <label>Validade das Propostas (dias)</label>
                  <input v-model.number="form.validade_propostas" type="number" min="0" placeholder="Ex: 90" />
                </div>
              </div>

              <!-- TAB 3: Datas -->
              <div v-show="activeTab === 'datas'" class="form-grid">
                <div class="field">
                  <label>Data de Publicação / Lançamento</label>
                  <input v-model="form.data_publicacao" type="date" />
                </div>
                <div class="field">
                  <label>Data Limite de Submissão de Propostas</label>
                  <input v-model="form.data_limite_submissao" type="date" />
                </div>
                <div class="field">
                  <label>Data de Abertura das Propostas</label>
                  <input v-model="form.data_abertura" type="date" />
                </div>
                <div class="field full">
                  <label>Local de Submissão das Propostas</label>
                  <input v-model="form.local_submissao" type="text" placeholder="Ex: UGEA-MADER, Av. Tomás Nduda nº 1102, Maputo — Sala de Reuniões" />
                </div>
                <div class="field full">
                  <label>Link para Edital / Caderno de Encargos / TDR</label>
                  <input v-model="form.link_edital" type="text" placeholder="https://www.mader.gov.mz/concursos/... ou caminho do ficheiro" />
                </div>
                <div class="field full">
                  <label>Observações / Condições Gerais</label>
                  <textarea v-model="form.observacoes" rows="4" placeholder="Critérios de habilitação, condições especiais, esclarecimentos…"></textarea>
                </div>
              </div>

              <!-- TAB 4: Adjudicação -->
              <div v-show="activeTab === 'adjudicacao'" class="form-grid">
                <div v-if="form.estado !== 'Adjudicado' && form.estado !== 'Concluído'" class="field full">
                  <div class="info-box">
                    <AlertTriangle :size="20" />
                    <div>
                      <strong>Concurso não adjudicado</strong>
                      <p>Altere o estado para "Adjudicado" ou "Concluído" para registar os dados de adjudicação.</p>
                    </div>
                  </div>
                </div>
                <div class="field full">
                  <label>Empresa / Entidade Adjudicatária</label>
                  <input v-model="form.empresa_adjudicataria" type="text" placeholder="Nome da empresa ou entidade adjudicada" />
                </div>
                <div class="field">
                  <label>Valor do Contrato Adjudicado</label>
                  <input v-model.number="form.valor_adjudicado" type="number" min="0" />
                </div>
                <div class="field">
                  <label>Data de Adjudicação</label>
                  <input v-model="form.data_adjudicacao" type="date" />
                </div>
                <div class="field full">
                  <label>Prazo de Execução do Contrato</label>
                  <input v-model="form.prazo_execucao" type="text" placeholder="Ex: 12 meses a partir da assinatura do contrato" />
                </div>
              </div>

              </div><!-- /.form-scroll -->

              <div class="form-actions">
                <button type="button" class="btn-cancel" @click="closeForm">Cancelar Operação</button>
                <button type="submit" class="btn-submit" :disabled="saving">
                  <Loader2 v-if="saving" :size="16" class="spin" />
                  <component v-else :is="editingId ? Save : Plus" :size="16" />
                  {{ editingId ? 'Submeter Alterações' : 'Registar Concurso' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.icon-md { width: 20px; height: 20px; }

.concursos-view { display: flex; flex-direction: column; gap: 14px; }

.page-header.card { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
@media (min-width: 640px) { .page-header.card { flex-direction: row; justify-content: space-between; align-items: center; padding: 18px 24px; } }
.page-title-section { display: flex; align-items: center; gap: 14px; }
.page-icon    { width: 44px; height: 44px; border-radius: 12px; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title   { font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0 0 3px; }
.page-subtitle{ font-size: 0.78rem; color: var(--text-muted); margin: 0; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.view-toggle { display: flex; background: #f3f4f6; border-radius: 10px; padding: 3px; gap: 2px; }
.vt-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; }
.vt-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.btn-new { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 11px; border: none; background: var(--bg-sidebar); color: white; font-size: 0.84rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
.btn-new:hover { background: #2c6c58; }

.kpi-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media (min-width: 640px)  { .kpi-row { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .kpi-row { grid-template-columns: repeat(5, 1fr); } }
.kpi-card { background: white; border-radius: 12px; padding: 12px 10px; display: flex; align-items: center; gap: 9px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; overflow: hidden; min-width: 0; }
.kpi-icon-box { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue   .kpi-icon-box { background: #dbeafe; color: #2563eb; }
.kpi-green  .kpi-icon-box { background: #dcfce7; color: #16a34a; }
.kpi-teal   .kpi-icon-box { background: #ccfbf1; color: #0d9488; }
.kpi-amber  .kpi-icon-box { background: #fef3c7; color: #d97706; }
.kpi-info { min-width: 0; flex: 1; }
.kpi-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
.kpi-value { font-size: 1.1rem; font-weight: 800; color: var(--text-main); white-space: nowrap; }

.stats-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
.stat-card { padding: 18px; }
.wide-card { grid-column: 1 / -1; }
.stat-title { font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin: 0 0 14px; }
.status-list { display: flex; flex-direction: column; gap: 9px; }
.status-row { display: flex; align-items: center; gap: 8px; }
.sr-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sr-label { font-size: 0.78rem; color: var(--text-main); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sr-track { width: 80px; flex-shrink: 0; height: 6px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.sr-fill  { height: 100%; border-radius: 10px; }
.sr-count { font-size: 0.78rem; font-weight: 800; min-width: 20px; text-align: right; }
.impl-list { display: flex; flex-direction: column; gap: 10px; }
.impl-row { display: flex; align-items: center; gap: 10px; }
.ir-info  { display: flex; flex-direction: column; flex: 1; min-width: 0; }
.ir-sigla { font-size: 0.68rem; font-weight: 800; color: #7c3aed; text-transform: uppercase; }
.ir-nome  { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ir-pct   { font-size: 0.78rem; font-weight: 800; min-width: 80px; text-align: right; }
.ir-budget{ font-size: 0.72rem; color: var(--text-muted); min-width: 100px; text-align: right; }
.text-hint { font-size: 0.82rem; color: var(--text-muted); text-align: center; padding: 16px 0; }

.empty-state.card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 50px 24px; gap: 14px; }
.empty-state h3 { font-size: 1.05rem; color: var(--text-main); margin: 0; }
.empty-state p  { font-size: 0.84rem; color: var(--text-muted); max-width: 480px; line-height: 1.7; margin: 0; }
.tags-row { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; }
.ex-tag { background: #f5f3ff; border: 1px solid #ddd6fe; color: #6d28d9; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }

.toolbar.card { display: flex; flex-direction: column; gap: 10px; padding: 12px 16px; }
@media (min-width: 640px) { .toolbar.card { flex-direction: row; padding: 12px 20px; } }
.search-box { display: flex; align-items: center; gap: 9px; flex: 1; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 12px; height: 40px; }
.search-input { flex: 1; border: none; background: transparent; font-size: 0.85rem; outline: none; font-family: inherit; }
.filter-select { padding: 0 12px; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.84rem; background: #f8fafc; outline: none; cursor: pointer; }

.cc-list { display: flex; flex-direction: column; gap: 12px; }
.cc-card.card { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.cc-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.cc-ref { font-size: 0.7rem; font-weight: 800; color: #7c3aed; background: #f5f3ff; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
.cc-badge { padding: 3px 9px; border-radius: 7px; font-size: 0.7rem; font-weight: 800; }
.cc-cat { font-size: 0.7rem; font-weight: 700; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 6px; }
.cc-titulo { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 0; }
.cc-modalidade { font-size: 0.76rem; color: var(--text-muted); margin: 0; }
.cc-meta { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.cc-meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.76rem; color: var(--text-muted); }
.cc-adj { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-main); background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 6px 10px; }
.btn-danger { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; border: 1.5px solid #fee2e2; background: white; font-family: inherit; font-size: 0.88rem; cursor: pointer; color: #dc2626; }

/* ── Modal — same as PolicyForm ── */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; padding: 0; }
@media (min-width: 640px) { .overlay { align-items: center; padding: 16px; } }
.modal { background: white; border-radius: 20px 20px 0 0; width: 100%; max-width: 100%; max-height: 95dvh; overflow: hidden; box-shadow: 0 -8px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column; }
@media (min-width: 640px) { .modal { border-radius: 20px; max-width: 860px; max-height: 92vh; box-shadow: 0 24px 70px rgba(0,0,0,0.2); } }
form { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.form-scroll { flex: 1; overflow-y: auto; min-height: 0; scrollbar-width: none; }
.form-scroll::-webkit-scrollbar { display: none; }
.form-scroll:hover { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
.form-scroll:hover::-webkit-scrollbar { display: block; width: 5px; }
.form-scroll:hover::-webkit-scrollbar-track { background: transparent; }
.form-scroll:hover::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
.modal-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 20px 16px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; }
@media (min-width: 640px) { .modal-header { padding: 28px 32px 20px; } }
.modal-header h2 { font-size: 1.2rem; color: var(--text-main); margin-bottom: 4px; }
.modal-header p  { font-size: 0.85rem; color: var(--text-muted); }
.close-btn { background: #f3f4f6; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #666; flex-shrink: 0; }
.close-btn:hover { background: #e5e7eb; }
.tab-bar { display: flex; gap: 2px; padding: 10px 16px 0; border-bottom: 1px solid #f0f0f0; flex-shrink: 0; overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; cursor: grab; }
.tab-bar::-webkit-scrollbar { display: none; }
@media (min-width: 640px) { .tab-bar { padding: 12px 32px 0; gap: 4px; } }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border: none; background: transparent; font-family: inherit; font-size: 0.83rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.2s, border-color 0.2s; white-space: nowrap; flex-shrink: 0; }
.tab-btn:hover { color: var(--text-main); }
.tab-btn.active { color: var(--accent-green); border-bottom-color: var(--accent-green); }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; padding: 18px 16px; }
@media (min-width: 640px) { .form-grid { grid-template-columns: 1fr 1fr; gap: 18px; padding: 24px 32px; } }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }
label { font-size: 0.82rem; font-weight: 600; color: #555; }
.required { color: #ef4444; }
input[type=text], input[type=date], input[type=number], select, textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-family: inherit; font-size: 0.9rem; outline: none; transition: border-color 0.2s; resize: vertical; }
input:focus, select:focus, textarea:focus { border-color: var(--accent-green); }
.info-box { display: flex; align-items: flex-start; gap: 16px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; color: #92400e; }
.info-box strong { display: block; margin-bottom: 4px; }
.info-box p { font-size: 0.85rem; margin: 0; }
.form-actions { display: flex; justify-content: flex-start; gap: 12px; padding: 0 32px 28px; flex-shrink: 0; }
.btn-cancel { padding: 11px 24px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: white; font-family: inherit; font-size: 0.9rem; cursor: pointer; color: #555; }
.btn-cancel:hover { background: #f9fafb; }
.btn-submit { display: flex; align-items: center; gap: 8px; padding: 11px 28px; border-radius: 10px; border: none; background: var(--bg-sidebar); color: white; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.btn-submit:hover { background: #2c6c58; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.7s linear infinite; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>

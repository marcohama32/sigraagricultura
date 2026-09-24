<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDragScroll } from '../composables/useDragScroll'
import {
  getAllProgramas, createPrograma, updatePrograma, deletePrograma,
  defaultPrograma,
} from '../lib/programas'
import type { Programa, ProgramaInput, StatusPrograma } from '../lib/programas'
import {
  FolderKanban, Plus, Search, X,
  Clock, CheckCircle2, AlertTriangle, TrendingUp, Pencil, Trash2,
  DollarSign, MapPin, Users, Calendar, Building2, BarChart2,
  FileText, Save, Loader2, Paperclip
} from 'lucide-vue-next'

// ── State ───────────────────────────────────────────────────
const programas    = ref<Programa[]>([])
const loading      = ref(false)
const saving       = ref(false)
const view         = ref<'stats' | 'list'>('stats')
const showForm     = ref(false)
const editingId    = ref<string | null>(null)
const searchQuery  = ref('')
const filterStatus = ref('')
const activeTab    = ref<'identificacao' | 'enquadramento' | 'ambito' | 'financiamento' | 'implementacao' | 'monitoria'>('identificacao')

const tabBarRef = ref<HTMLElement | null>(null)
useDragScroll(tabBarRef)

// ── Load ────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  programas.value = await getAllProgramas()
  loading.value = false
})

// ── KPIs ────────────────────────────────────────────────────
const emExecucao     = computed(() => programas.value.filter(p => p.status === 'Em Execução').length)
const concluidos     = computed(() => programas.value.filter(p => p.status === 'Concluído').length)
const emAtraso       = computed(() => programas.value.filter(p => p.status === 'Em Atraso').length)
const totalOrcamento = computed(() => programas.value.reduce((s, p) => s + (p.orcamento_total_usd || 0), 0))
const mediaImpl      = computed(() => {
  const ativos = programas.value.filter(p => p.status === 'Em Execução')
  if (!ativos.length) return 0
  return Math.round(ativos.reduce((s, p) => s + (p.implementacao_pct || 0), 0) / ativos.length)
})

// ── Filter ──────────────────────────────────────────────────
const filtered = computed(() => {
  let list = programas.value
  if (filterStatus.value) list = list.filter(p => p.status === filterStatus.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.nome.toLowerCase().includes(q) ||
      p.sigla.toLowerCase().includes(q) ||
      p.doador_principal.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Stats ───────────────────────────────────────────────────
const byStatus = computed(() => {
  const map: Record<string, number> = {}
  for (const p of programas.value) map[p.status] = (map[p.status] ?? 0) + 1
  return map
})
const byDoador = computed(() => {
  const map: Record<string, number> = {}
  for (const p of programas.value) {
    if (p.doador_principal) map[p.doador_principal] = (map[p.doador_principal] ?? 0) + 1
  }
  return Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 5)
})

// ── Form ────────────────────────────────────────────────────
const form = ref<ProgramaInput>(defaultPrograma())

function openNew() {
  form.value = defaultPrograma()
  editingId.value = null
  activeTab.value = 'identificacao'
  showForm.value = true
}

function openEdit(p: Programa) {
  const { id, created_at, ...rest } = p
  form.value = { ...rest }
  editingId.value = id
  activeTab.value = 'identificacao'
  showForm.value = true
}

function closeForm() { showForm.value = false }

async function submitForm() {
  if (!form.value.nome.trim()) { activeTab.value = 'identificacao'; alert('A denominação oficial é obrigatória.'); return }
  saving.value = true
  try {
    if (editingId.value) {
      await updatePrograma(editingId.value, form.value)
    } else {
      await createPrograma(form.value)
    }
    programas.value = await getAllProgramas()
    showForm.value = false
  } finally {
    saving.value = false
  }
}

async function removePrograma(id: string) {
  if (!confirm('Confirma a eliminação deste registo? Esta acção é irreversível.')) return
  await deletePrograma(id)
  programas.value = programas.value.filter(p => p.id !== id)
}

// ── Helpers ─────────────────────────────────────────────────
function fmtUSD(v: number) {
  if (!v) return '—'
  if (v >= 1_000_000) return `USD ${(v/1_000_000).toFixed(1)} M`
  if (v >= 1_000)     return `USD ${(v/1_000).toFixed(0)} K`
  return `USD ${v.toLocaleString()}`
}
function fmtNum(v: number) { return v ? v.toLocaleString('pt-PT') : '—' }

function statusColor(s: StatusPrograma): string {
  return ({ 'Em Execução':'#16a34a','Concluído':'#2563eb','Suspenso':'#dc2626','Em Preparação':'#d97706','Em Atraso':'#ef4444' } as any)[s] ?? '#6b7280'
}
function statusBg(s: StatusPrograma): string {
  return ({ 'Em Execução':'#dcfce7','Concluído':'#dbeafe','Suspenso':'#fee2e2','Em Preparação':'#fef3c7','Em Atraso':'#fee2e2' } as any)[s] ?? '#f3f4f6'
}

const PROVINCIAS_MZ = [
  'Niassa','Cabo Delgado','Nampula','Zambézia','Tete',
  'Manica','Sofala','Inhambane','Gaza','Maputo Província','Cidade de Maputo'
]

function toggleProvincia(prov: string) {
  const list = form.value.provincias ? form.value.provincias.split(',').map(s => s.trim()).filter(Boolean) : []
  const idx = list.indexOf(prov)
  if (idx === -1) list.push(prov)
  else list.splice(idx, 1)
  form.value.provincias = list.join(', ')
}

function provSelected(prov: string) {
  return form.value.provincias.split(',').map(s => s.trim()).includes(prov)
}

const DOADORES_COMUNS = [
  'Banco Mundial (BM)', 'Banco Africano de Desenvolvimento (BAD)',
  'Fundo Internacional de Desenvolvimento Agrícola (FIDA)',
  'Agência Japonesa de Cooperação Internacional (JICA)',
  'United States Agency for International Development (USAID)',
  'União Europeia (UE)', 'Agência de Cooperação Internacional da Alemanha (GIZ)',
  'Cooperação Suíça (SDC)', 'Cooperação Sueca (SIDA)',
  'Fundo Verde para o Clima (GCF)', 'FAO — Organização das Nações Unidas para a Alimentação',
  'Programa Alimentar Mundial (PAM)', 'Governo de Moçambique (GdM)', 'Outro'
]

const ENTIDADES_EXECUTORAS = [
  'MADER — Ministério da Agricultura e Desenvolvimento Rural',
  'DNAS — Direcção Nacional de Agricultura e Silvicultura',
  'DNPDR — Direcção Nacional de Promoção do Desenvolvimento Rural',
  'IIAM — Instituto de Investigação Agrária de Moçambique',
  'DNEA — Direcção Nacional de Extensão Agrária',
  'INIR — Instituto Nacional de Irrigação',
  'Outro'
]

const RATING_OPTIONS = [
  'Altamente Satisfatório (HS)', 'Satisfatório (S)',
  'Moderadamente Satisfatório (MS)', 'Moderadamente Insatisfatório (MI)',
  'Insatisfatório (I)', 'Altamente Insatisfatório (HI)', 'Não Avaliado',
]

const EXEMPLOS_SIGLAS = ['PROIRRI','SUSTENTA','MOSAP III','ProSAVANA','PROMER','PDSA','PNISA','PASP','PAPA','PROAGRI']

// Componentes checkboxes
const AREAS_COMPONENTES = [
  'Irrigação e Gestão de Água','Sementes e Melhoramento Vegetal','Mecanização Agrícola',
  'Segurança Alimentar e Nutricional','Comercialização e Mercados','Crédito e Seguros Agrícolas',
  'Extensão Rural e Capacitação','Infraestruturas Rurais','Conservação de Recursos Naturais',
  'Pecuária e Sanidade Animal','Investigação e Inovação Agronómica','Género e Inclusão Social','Gestão e Coordenação'
]
function areaSelected(area: string) {
  try { return JSON.parse(form.value.areas_componentes || '[]').includes(area) } catch { return false }
}
function toggleArea(area: string) {
  let list: string[] = []
  try { list = JSON.parse(form.value.areas_componentes || '[]') } catch {}
  const idx = list.indexOf(area)
  if (idx === -1) list.push(area)
  else list.splice(idx, 1)
  form.value.areas_componentes = JSON.stringify(list)
}
</script>

<template>
  <div class="prog-view">

    <!-- ══ PAGE HEADER ══════════════════════════════════════ -->
    <div class="page-header card">
      <div class="page-title-section">
        <div class="page-icon">
          <FolderKanban :size="22" />
        </div>
        <div>
          <h1 class="page-title">Programas e Projectos</h1>
          <p class="page-subtitle">Acompanhamento de programas e projectos agrícolas em execução — MADER</p>
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
        <button class="btn-new" @click="openNew">
          <Plus :size="17" /> Novo Projecto
        </button>
      </div>
    </div>

    <!-- ══ KPI CARDS ════════════════════════════════════════ -->
    <div class="kpi-row">
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon-box"><Clock :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Em Execução</div>
          <div class="kpi-value">{{ emExecucao }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-green">
        <div class="kpi-icon-box"><CheckCircle2 :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Concluídos</div>
          <div class="kpi-value">{{ concluidos }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-red">
        <div class="kpi-icon-box"><AlertTriangle :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Em Atraso</div>
          <div class="kpi-value">{{ emAtraso }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-teal">
        <div class="kpi-icon-box"><TrendingUp :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Implementação Média</div>
          <div class="kpi-value">{{ mediaImpl || '—' }}{{ mediaImpl ? '%' : '' }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-icon-box"><DollarSign :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Carteira Total</div>
          <div class="kpi-value">{{ fmtUSD(totalOrcamento) }}</div>
        </div>
      </div>
    </div>

    <!-- ══ STATS VIEW ═══════════════════════════════════════ -->
    <template v-if="view === 'stats'">
      <div v-if="!programas.length" class="empty-state card">
        <FolderKanban :size="52" style="color:#d1d5db" />
        <h3>Nenhum programa ou projecto registado</h3>
        <p>Registe os programas e projectos do MADER para acompanhar orçamentos, prazos, doadores e grau de implementação de cada iniciativa.</p>
        <div class="tags-row">
          <span v-for="s in EXEMPLOS_SIGLAS" :key="s" class="ex-tag">{{ s }}</span>
        </div>
        <button class="btn-submit" style="margin-top:8px" @click="openNew">
          <Plus :size="16" /> Registar Primeiro Projecto
        </button>
      </div>

      <div v-else class="stats-grid">
        <div class="stat-card card">
          <h3 class="stat-title">Distribuição por Estado</h3>
          <div class="status-list">
            <div v-for="(count, status) in byStatus" :key="status" class="status-row">
              <span class="sr-dot" :style="{ background: statusColor(status as StatusPrograma) }"></span>
              <span class="sr-label">{{ status }}</span>
              <div class="sr-track">
                <div class="sr-fill" :style="{ width: (count / programas.length * 100) + '%', background: statusColor(status as StatusPrograma) }"></div>
              </div>
              <span class="sr-count">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card card">
          <h3 class="stat-title">Principais Doadores / Financiadores</h3>
          <div v-if="byDoador.length" class="status-list">
            <div v-for="[doador, count] in byDoador" :key="doador" class="status-row">
              <span class="sr-dot" style="background:#2563eb"></span>
              <span class="sr-label">{{ doador }}</span>
              <div class="sr-track">
                <div class="sr-fill" :style="{ width: (count / programas.length * 100) + '%', background: '#2563eb' }"></div>
              </div>
              <span class="sr-count">{{ count }}</span>
            </div>
          </div>
          <p v-else class="text-hint">Nenhum dado disponível</p>
        </div>

        <div class="stat-card wide-card card">
          <h3 class="stat-title">Projectos em Execução — Grau de Implementação</h3>
          <div class="impl-list">
            <div v-for="p in programas.filter(x => x.status === 'Em Execução')" :key="p.id" class="impl-row">
              <div class="ir-info">
                <span class="ir-sigla">{{ p.sigla || p.nome.substring(0,8) }}</span>
                <span class="ir-nome">{{ p.nome }}</span>
              </div>
              <div class="ir-bar">
                <div class="ir-fill" :style="{ width: p.implementacao_pct + '%', background: p.implementacao_pct >= 75 ? '#16a34a' : p.implementacao_pct >= 40 ? '#d97706' : '#dc2626' }"></div>
              </div>
              <span class="ir-pct">{{ p.implementacao_pct }}%</span>
              <span class="ir-budget">{{ fmtUSD(p.orcamento_total_usd) }}</span>
            </div>
            <p v-if="!programas.filter(x=>x.status==='Em Execução').length" class="text-hint">Nenhum projecto em execução registado</p>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ LIST VIEW ════════════════════════════════════════ -->
    <template v-if="view === 'list'">
      <div class="toolbar card">
        <div class="search-box">
          <Search :size="16" style="color:#9ca3af;flex-shrink:0" />
          <input v-model="searchQuery" placeholder="Pesquisar programa, sigla ou doador…" class="search-input" />
        </div>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos os estados</option>
          <option v-for="s in ['Em Execução','Concluído','Em Preparação','Em Atraso','Suspenso']" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <div v-if="filtered.length" class="prog-list">
        <div v-for="p in filtered" :key="p.id" class="prog-card card">
          <div class="pc-header">
            <div class="pc-top">
              <span class="pc-sigla">{{ p.sigla || '—' }}</span>
              <span class="pc-badge" :style="{ background: statusBg(p.status), color: statusColor(p.status) }">{{ p.status }}</span>
            </div>
            <h3 class="pc-nome">{{ p.nome }}</h3>
            <p class="pc-tipo">{{ p.tipo }}</p>
          </div>
          <div class="pc-meta">
            <span class="pc-meta-item"><Building2 :size="13" /> {{ p.doador_principal || 'Doador não definido' }}</span>
            <span class="pc-meta-item"><MapPin :size="13" /> {{ p.ambito }}</span>
            <span class="pc-meta-item"><Users :size="13" /> {{ fmtNum(p.beneficiarios_directos) }} beneficiários</span>
            <span class="pc-meta-item"><Calendar :size="13" /> {{ p.data_inicio || '—' }} → {{ p.data_fim || '—' }}</span>
          </div>
          <div class="pc-impl">
            <div class="pc-impl-row">
              <span class="pc-impl-label">Grau de Implementação: <strong>{{ p.implementacao_pct }}%</strong></span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" :style="{ width: p.implementacao_pct + '%', background: p.implementacao_pct >= 75 ? '#16a34a' : p.implementacao_pct >= 40 ? '#d97706' : '#dc2626' }"></div>
            </div>
          </div>
          <div class="pc-budget">
            <div class="pc-budget-item">
              <span class="pb-label">Orçamento Total</span>
              <span class="pb-val">{{ fmtUSD(p.orcamento_total_usd) }}</span>
            </div>
            <div class="pc-budget-item">
              <span class="pb-label">Desembolsado</span>
              <span class="pb-val">{{ p.desembolsado_pct }}%</span>
            </div>
            <div class="pc-budget-item">
              <span class="pb-label">Rating</span>
              <span class="pb-val">{{ p.rating_desempenho || '—' }}</span>
            </div>
          </div>
          <div class="form-actions" style="padding:0;margin-top:4px">
            <button class="btn-cancel" @click="openEdit(p)"><Pencil :size="14" /> Editar</button>
            <button class="btn-danger" @click="removePrograma(p.id)"><Trash2 :size="14" /> Eliminar</button>
          </div>
        </div>
      </div>

      <div v-else-if="!loading" class="empty-state card">
        <FolderKanban :size="44" style="color:#d1d5db" />
        <h3>Nenhum resultado encontrado</h3>
        <p>Ajuste os filtros ou registe um novo projecto.</p>
      </div>
    </template>

    <!-- ══ MODAL FORM — same pattern as PolicyForm ══════════ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showForm" class="overlay" @click.self="closeForm">
          <div class="modal">

            <!-- Header -->
            <div class="modal-header">
              <div>
                <h2 class="flex items-center gap-2">
                  <component :is="editingId ? Save : Plus" class="icon-md" />
                  {{ editingId ? 'Actualização de Programa / Projecto' : 'Registo de Novo Programa / Projecto' }}
                </h2>
                <p>{{ editingId ? 'Actualize os dados do programa ou projecto agrícola.' : 'Preencha os campos para registar o novo instrumento no sistema SiGRA.' }}</p>
              </div>
              <button class="close-btn" @click="closeForm"><X :size="20" /></button>
            </div>

            <!-- Tabs — same style as PolicyForm -->
            <div ref="tabBarRef" class="tab-bar" @wheel.prevent="(e) => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY }">
              <button :class="['tab-btn', { active: activeTab === 'identificacao' }]" @click="activeTab = 'identificacao'">
                Identificação e Caracterização
              </button>
              <button :class="['tab-btn', { active: activeTab === 'enquadramento' }]" @click="activeTab = 'enquadramento'">
                Enquadramento Estratégico
              </button>
              <button :class="['tab-btn', { active: activeTab === 'ambito' }]" @click="activeTab = 'ambito'">
                <MapPin :size="14" /> Abrangência Territorial
              </button>
              <button :class="['tab-btn', { active: activeTab === 'financiamento' }]" @click="activeTab = 'financiamento'">
                <DollarSign :size="14" /> Financiamento
              </button>
              <button :class="['tab-btn', { active: activeTab === 'implementacao' }]" @click="activeTab = 'implementacao'">
                <Building2 :size="14" /> Implementação
              </button>
              <button :class="['tab-btn', { active: activeTab === 'monitoria' }]" @click="activeTab = 'monitoria'">
                <BarChart2 :size="14" /> Monitoria e Resultados
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm">

              <div class="form-scroll">

              <!-- TAB 1: Identificação -->
              <div v-show="activeTab === 'identificacao'" class="form-grid">
                <div class="field">
                  <label>Tipologia do Instrumento</label>
                  <select v-model="form.tipo">
                    <option v-for="t in ['Programa Nacional','Projecto de Investimento','Projecto de Cooperação Técnica','Programa Regional','Fundo de Desenvolvimento']" :key="t">{{ t }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Estado Actual</label>
                  <select v-model="form.status">
                    <option v-for="s in ['Em Execução','Em Preparação','Concluído','Em Atraso','Suspenso']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Denominação Oficial do Programa / Projecto <span class="required">*</span></label>
                  <input v-model="form.nome" type="text" placeholder="Ex: Projecto de Irrigação e Gestão Integrada de Água — PROIRRI" />
                </div>
                <div class="field">
                  <label>Sigla / Acrónimo</label>
                  <input v-model="form.sigla" type="text" placeholder="Ex: PROIRRI, SUSTENTA, MOSAP" />
                </div>
                <div class="field">
                  <label>Sector / Área Principal</label>
                  <select v-model="form.sector_principal">
                    <option value="">Seleccionar…</option>
                    <option v-for="a in ['Irrigação e Gestão de Água','Sementes e Melhoramento Vegetal','Mecanização Agrícola','Segurança Alimentar e Nutricional','Comercialização e Mercados','Crédito e Seguros Agrícolas','Extensão Rural e Capacitação','Infraestruturas Rurais','Conservação de Recursos Naturais','Pecuária e Sanidade Animal','Pescas e Aquacultura','Investigação e Inovação Agronómica']" :key="a">{{ a }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Fase Actual de Execução</label>
                  <input v-model="form.fase_actual" type="text" placeholder="Ex: Fase II — Componente de irrigação" />
                </div>
                <div class="field">
                  <label>Data de Início</label>
                  <input v-model="form.data_inicio" type="date" />
                </div>
                <div class="field">
                  <label>Data de Conclusão Prevista</label>
                  <input v-model="form.data_fim" type="date" />
                </div>
                <div class="field full">
                  <label>Sumário Executivo / Objectivos</label>
                  <textarea v-model="form.descricao" rows="4" placeholder="Descreva os objectivos gerais, contexto, justificação e principais actividades do programa…"></textarea>
                </div>
              </div>

              <!-- TAB 2: Enquadramento -->
              <div v-show="activeTab === 'enquadramento'" class="form-grid">
                <div class="field full">
                  <label>Instrumento de Política que Enquadra o Programa</label>
                  <input v-model="form.instrumento_politica" type="text" placeholder="Ex: PNISA 2014-2024, PEDSA 2011-2020, Agenda 2025, PAPA…" />
                </div>
                <div class="field full">
                  <label>Objectivo de Desenvolvimento (longo prazo)</label>
                  <textarea v-model="form.objectivo_desenvolvimento" rows="3" placeholder="Objectivo principal de desenvolvimento que o programa visa alcançar…"></textarea>
                </div>
                <div class="field full">
                  <label>Resultados Esperados (Outputs / Outcomes)</label>
                  <textarea v-model="form.resultados_esperados" rows="5" placeholder="Liste os principais resultados, produtos e indicadores de resultado esperados do programa…"></textarea>
                </div>
              </div>

              <!-- TAB 3: Âmbito Territorial -->
              <div v-show="activeTab === 'ambito'" class="form-grid">
                <div class="field full">
                  <label>Nível de Abrangência Territorial</label>
                  <div class="radio-group">
                    <label v-for="a in ['Nacional','Multi-provincial','Provincial','Distrital']" :key="a" class="radio-label">
                      <input type="radio" :value="a" v-model="form.ambito" />
                      {{ a }}
                    </label>
                  </div>
                </div>

                <div class="field full">
                  <label>Províncias de Intervenção</label>
                  <div class="provincia-grid">
                    <label v-for="prov in PROVINCIAS_MZ" :key="prov" class="prov-tag"
                      :class="{ selected: provSelected(prov) }"
                      @click="toggleProvincia(prov)">
                      {{ prov }}
                    </label>
                  </div>
                  <p v-if="form.provincias" class="text-hint">Seleccionadas: {{ form.provincias }}</p>
                </div>

                <div class="field">
                  <label>Número de Distritos Alvo</label>
                  <input v-model.number="form.distritos_alvo" type="number" min="0" placeholder="Ex: 23" />
                </div>
                <div class="field">
                  <label>Beneficiários Directos (nº estimado)</label>
                  <input v-model.number="form.beneficiarios_directos" type="number" min="0" placeholder="Ex: 150000" />
                </div>
              </div>

              <!-- TAB 4: Financiamento -->
              <div v-show="activeTab === 'financiamento'" class="form-grid">
                <div class="field">
                  <label>Tipo de Financiamento</label>
                  <select v-model="form.tipo_financiamento">
                    <option v-for="t in ['Empréstimo','Doação','Governo de Moçambique','Contrapartida Nacional','Misto']" :key="t">{{ t }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Doador / Financiador Principal</label>
                  <select v-model="form.doador_principal">
                    <option value="">Seleccionar…</option>
                    <option v-for="d in DOADORES_COMUNS" :key="d">{{ d }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Parceiros Co-financiadores</label>
                  <input v-model="form.parceiros_cofinanciadores" type="text" placeholder="Ex: GdM, SDC, UE (separados por vírgula)" />
                </div>
                <div class="field">
                  <label>Orçamento Total (USD)</label>
                  <input v-model.number="form.orcamento_total_usd" type="number" min="0" placeholder="Ex: 120000000" />
                </div>
                <div class="field">
                  <label>Financiamento Externo / Doador (USD)</label>
                  <input v-model.number="form.orcamento_doador_usd" type="number" min="0" placeholder="Ex: 100000000" />
                </div>
                <div class="field">
                  <label>Contrapartida Nacional / GdM (USD)</label>
                  <input v-model.number="form.orcamento_gomz_usd" type="number" min="0" placeholder="Ex: 20000000" />
                </div>
                <div class="field">
                  <label>Taxa de Desembolso Acumulado (%)</label>
                  <input v-model.number="form.desembolsado_pct" type="number" min="0" max="100" />
                </div>
                <div class="field">
                  <label>Código / Nº do Acordo de Financiamento</label>
                  <input v-model="form.codigo_acordo" type="text" placeholder="Ex: P150934 / CR-6013-MOZ" />
                </div>
                <div class="field">
                  <label>Data de Assinatura do Acordo</label>
                  <input v-model="form.data_acordo" type="date" />
                </div>
              </div>

              <!-- TAB 5: Implementação -->
              <div v-show="activeTab === 'implementacao'" class="form-grid">
                <div class="field full">
                  <label>Entidade Executora Principal</label>
                  <select v-model="form.entidade_executora">
                    <option v-for="e in ENTIDADES_EXECUTORAS" :key="e">{{ e }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Unidade de Gestão do Projecto (UGP / UIP)</label>
                  <input v-model="form.unidade_gestao" type="text" placeholder="Ex: UGP-PROIRRI, Maputo" />
                </div>
                <div class="field">
                  <label>Director / Coordenador do Programa</label>
                  <input v-model="form.director_programa" type="text" placeholder="Nome completo" />
                </div>
                <div class="field">
                  <label>Contacto da UGP (e-mail / telefone)</label>
                  <input v-model="form.contacto_ugp" type="text" placeholder="ugp@mader.gov.mz" />
                </div>
                <div class="field full">
                  <label>Grau de Implementação Acumulado: <strong>{{ form.implementacao_pct }}%</strong></label>
                  <div class="progress-control">
                    <button type="button" class="pct-btn" @click="form.implementacao_pct = Math.max(0, form.implementacao_pct - 5)">−</button>
                    <div class="progress-bar-bg" @click="(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); form.implementacao_pct = Math.round(((e.clientX - rect.left) / rect.width) * 20) * 5 }">
                      <div class="progress-bar-fill" :style="{ width: form.implementacao_pct + '%' }"></div>
                    </div>
                    <button type="button" class="pct-btn" @click="form.implementacao_pct = Math.min(100, form.implementacao_pct + 5)">+</button>
                  </div>
                </div>
                <div class="field full">
                  <label>Áreas / Componentes do Programa</label>
                  <div class="provincia-grid">
                    <label v-for="area in AREAS_COMPONENTES" :key="area" class="prov-tag"
                      :class="{ selected: areaSelected(area) }"
                      @click="toggleArea(area)">
                      {{ area }}
                    </label>
                  </div>
                </div>
              </div>

              <!-- TAB 6: Monitoria e Resultados -->
              <div v-show="activeTab === 'monitoria'" class="form-grid">
                <div class="field">
                  <label>Data da Última Missão de Supervisão</label>
                  <input v-model="form.ultima_missao_supervisao" type="date" />
                </div>
                <div class="field">
                  <label>Data da Próxima Missão</label>
                  <input v-model="form.proxima_missao" type="date" />
                </div>
                <div class="field">
                  <label>Avaliação Intercalar (data / resultado)</label>
                  <input v-model="form.avaliacao_intermedia" type="text" placeholder="Ex: Novembro 2023 — Em preparação" />
                </div>
                <div class="field">
                  <label>Rating de Desempenho</label>
                  <select v-model="form.rating_desempenho">
                    <option value="">Não avaliado</option>
                    <option v-for="r in RATING_OPTIONS" :key="r">{{ r }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Referência ao Relatório de Progresso Mais Recente</label>
                  <input v-model="form.relatorio_progresso" type="text" placeholder="Link, nome do ficheiro ou referência ao relatório" />
                </div>

                <div class="field full" style="grid-column:1/-1">
                  <div class="section-divider">Resultados Alcançados à Data</div>
                </div>

                <div class="field">
                  <label>Agricultores Beneficiados (nº)</label>
                  <input v-model.number="form.agricultores_beneficiados" type="number" min="0" />
                </div>
                <div class="field">
                  <label>Área Irrigada Reabilitada (ha)</label>
                  <input v-model.number="form.area_reabilitada_ha" type="number" min="0" />
                </div>
                <div class="field">
                  <label>Nova Área Irrigada Criada (ha)</label>
                  <input v-model.number="form.area_nova_ha" type="number" min="0" />
                </div>
                <div class="field">
                  <label>Formações / Capacitações Realizadas (nº)</label>
                  <input v-model.number="form.formacoes_realizadas" type="number" min="0" />
                </div>
                <div class="field full">
                  <label>Infraestruturas Construídas / Reabilitadas</label>
                  <input v-model="form.infraestruturas_construidas" type="text" placeholder="Ex: 3 barragens, 12 furos, 45 km de canais de irrigação" />
                </div>
                <div class="field full">
                  <label>Observações / Riscos Identificados</label>
                  <textarea v-model="form.observacoes" rows="4" placeholder="Riscos, desafios, lições aprendidas, recomendações da missão de supervisão…"></textarea>
                </div>
              </div>

              </div><!-- /.form-scroll -->

              <!-- Actions -->
              <div class="form-actions">
                <button type="button" class="btn-cancel" @click="closeForm">Cancelar Operação</button>
                <button type="submit" class="btn-submit" :disabled="saving">
                  <Loader2 v-if="saving" :size="16" class="spin" />
                  <component v-else :is="editingId ? Save : Plus" :size="16" />
                  {{ editingId ? 'Submeter Alterações' : 'Registar Projecto' }}
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
.icon-md { width: 20px; height: 20px; color: var(--text-main); }

.prog-view { display: flex; flex-direction: column; gap: 14px; }

/* ── Header ── */
.page-header.card { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
@media (min-width: 640px) {
  .page-header.card { flex-direction: row; justify-content: space-between; align-items: center; padding: 18px 24px; }
}
.page-title-section { display: flex; align-items: center; gap: 14px; }
.page-icon  { width: 44px; height: 44px; border-radius: 12px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title { font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0 0 3px; }
.page-subtitle { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.view-toggle { display: flex; background: #f3f4f6; border-radius: 10px; padding: 3px; gap: 2px; }
.vt-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; }
.vt-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.btn-new { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 11px; border: none; background: var(--bg-sidebar); color: white; font-size: 0.84rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
.btn-new:hover { background: #2c6c58; }


/* ── KPI Row ── */
.kpi-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media (min-width: 640px)  { .kpi-row { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 1280px) { .kpi-row { grid-template-columns: repeat(5, 1fr); } }
.kpi-card { background: white; border-radius: 12px; padding: 12px 10px; display: flex; align-items: center; gap: 9px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; overflow: hidden; min-width: 0; }
.kpi-icon-box { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-blue   .kpi-icon-box { background: #dbeafe; color: #2563eb; }
.kpi-green  .kpi-icon-box { background: #dcfce7; color: #16a34a; }
.kpi-red    .kpi-icon-box { background: #fee2e2; color: #dc2626; }
.kpi-teal   .kpi-icon-box { background: #ccfbf1; color: #0d9488; }
.kpi-amber  .kpi-icon-box { background: #fef3c7; color: #d97706; }
.kpi-info { min-width: 0; flex: 1; }
.kpi-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
.kpi-value { font-size: 1.1rem; font-weight: 800; color: var(--text-main); white-space: nowrap; }

/* ── Stats ── */
.stats-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
.stat-card { padding: 18px; }
.wide-card { grid-column: 1 / -1; }
.stat-title { font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin: 0 0 14px; }
.status-list { display: flex; flex-direction: column; gap: 9px; }
.status-row { display: flex; align-items: center; gap: 8px; }
.sr-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sr-label { font-size: 0.78rem; color: var(--text-main); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sr-track { width: 80px; flex-shrink: 0; height: 6px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.sr-fill  { height: 100%; border-radius: 10px; }
.sr-count { font-size: 0.78rem; font-weight: 800; min-width: 20px; text-align: right; }
.impl-list { display: flex; flex-direction: column; gap: 10px; }
.impl-row { display: flex; align-items: center; gap: 10px; }
.ir-info  { display: flex; flex-direction: column; min-width: 0; flex: 0 0 180px; }
.ir-sigla { font-size: 0.7rem; font-weight: 800; color: #0369a1; text-transform: uppercase; }
.ir-nome  { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ir-bar   { flex: 1; height: 8px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.ir-fill  { height: 100%; border-radius: 10px; }
.ir-pct   { font-size: 0.78rem; font-weight: 800; min-width: 36px; text-align: right; }
.ir-budget { font-size: 0.72rem; color: var(--text-muted); min-width: 80px; text-align: right; }

/* ── Empty ── */
.empty-state.card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 50px 24px; gap: 14px; }
.empty-state h3 { font-size: 1.05rem; color: var(--text-main); margin: 0; }
.empty-state p  { font-size: 0.84rem; color: var(--text-muted); max-width: 480px; line-height: 1.7; margin: 0; }
.tags-row { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; }
.ex-tag { background: #e0f2fe; border: 1px solid #bae6fd; color: #0369a1; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }

/* ── Toolbar ── */
.toolbar.card { display: flex; flex-direction: column; gap: 10px; padding: 12px 16px; }
@media (min-width: 640px) { .toolbar.card { flex-direction: row; padding: 12px 20px; } }
.search-box { display: flex; align-items: center; gap: 9px; flex: 1; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 12px; height: 40px; }
.search-input { flex: 1; border: none; background: transparent; font-size: 0.85rem; outline: none; font-family: inherit; }
.filter-select { padding: 0 12px; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.84rem; background: #f8fafc; outline: none; cursor: pointer; }

/* ── Prog list cards ── */
.prog-list { display: flex; flex-direction: column; gap: 12px; }
.prog-card.card { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 768px) { .prog-card.card { padding: 20px; } }
.pc-top   { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.pc-sigla { font-size: 0.72rem; font-weight: 800; color: #0369a1; background: #e0f2fe; padding: 2px 8px; border-radius: 6px; text-transform: uppercase; }
.pc-badge { padding: 3px 9px; border-radius: 7px; font-size: 0.7rem; font-weight: 800; }
.pc-nome  { font-size: 0.98rem; font-weight: 700; color: var(--text-main); margin: 0 0 2px; }
.pc-tipo  { font-size: 0.76rem; color: var(--text-muted); margin: 0; }
.pc-meta  { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.pc-meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.76rem; color: var(--text-muted); }
.pc-impl  { display: flex; flex-direction: column; gap: 5px; }
.pc-impl-row { display: flex; justify-content: space-between; }
.pc-impl-label { font-size: 0.74rem; color: var(--text-muted); }
.pc-budget { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #f8fafc; border-radius: 10px; padding: 10px 12px; }
.pc-budget-item { display: flex; flex-direction: column; gap: 2px; }
.pb-label { font-size: 0.62rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; }
.pb-val   { font-size: 0.82rem; font-weight: 700; color: var(--text-main); }
.btn-danger { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; border: 1.5px solid #fee2e2; background: white; font-family: inherit; font-size: 0.88rem; cursor: pointer; color: #dc2626; }

/* ═══════════════════════════════════════════════════════════
   MODAL — identical pattern to PolicyForm.vue
═══════════════════════════════════════════════════════════ */
.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px); z-index: 1000;
  display: flex; align-items: flex-end; justify-content: center; padding: 0;
}
@media (min-width: 640px) { .overlay { align-items: center; padding: 16px; } }

.modal {
  background: white; border-radius: 20px 20px 0 0;
  width: 100%; max-width: 100%; max-height: 95dvh;
  overflow: hidden; box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
  display: flex; flex-direction: column;
}
@media (min-width: 640px) {
  .modal { border-radius: 20px; max-width: 900px; max-height: 92vh; box-shadow: 0 24px 70px rgba(0,0,0,0.2); }
}
form { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.form-scroll { flex: 1; overflow-y: auto; min-height: 0; scrollbar-width: none; }
.form-scroll::-webkit-scrollbar { display: none; }
.form-scroll:hover { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
.form-scroll:hover::-webkit-scrollbar { display: block; width: 5px; }
.form-scroll:hover::-webkit-scrollbar-track { background: transparent; }
.form-scroll:hover::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 20px 16px; border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
}
@media (min-width: 640px) { .modal-header { padding: 28px 32px 20px; } }
.modal-header h2 { font-size: 1.2rem; color: var(--text-main); margin-bottom: 4px; }
.modal-header p  { font-size: 0.85rem; color: var(--text-muted); }

.close-btn {
  background: #f3f4f6; border: none; width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #666; flex-shrink: 0; transition: background 0.2s;
}
.close-btn:hover { background: #e5e7eb; }

/* Tabs — exact same as PolicyForm */
.tab-bar {
  display: flex; gap: 2px; padding: 10px 16px 0;
  border-bottom: 1px solid #f0f0f0; flex-shrink: 0;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  cursor: grab;
}
.tab-bar::-webkit-scrollbar { display: none; }
@media (min-width: 640px) { .tab-bar { padding: 12px 32px 0; gap: 4px; } }

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px; border: none; background: transparent;
  font-family: inherit; font-size: 0.83rem; font-weight: 600;
  color: var(--text-muted); cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap; flex-shrink: 0;
}
.tab-btn:hover { color: var(--text-main); }
.tab-btn.active { color: var(--accent-green); border-bottom-color: var(--accent-green); }

/* Form grid — exact same as PolicyForm */
.form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; padding: 18px 16px; }
@media (min-width: 640px) { .form-grid { grid-template-columns: 1fr 1fr; gap: 18px; padding: 24px 32px; } }
.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }

label { font-size: 0.82rem; font-weight: 600; color: #555; }
.required { color: #ef4444; }

input[type=text], input[type=date], input[type=number], select, textarea {
  padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-family: inherit; font-size: 0.9rem; outline: none;
  transition: border-color 0.2s; resize: vertical;
}
input:focus, select:focus, textarea:focus { border-color: var(--accent-green); }

/* Radio group — exact same */
.radio-group { display: flex; flex-wrap: wrap; gap: 16px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }

/* Province/area tags — exact same as PolicyForm */
.provincia-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; }
.prov-tag {
  padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600;
  border: 1.5px solid #e5e7eb; cursor: pointer; transition: all 0.15s;
  color: #555; background: white;
}
.prov-tag:hover   { border-color: var(--accent-green); color: var(--accent-green); }
.prov-tag.selected{ background: var(--accent-green); color: white; border-color: var(--accent-green); }

/* Progress control — clickable bar with +/- buttons */
.progress-control { display: flex; align-items: center; gap: 10px; }
.pct-btn {
  width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e5e7eb;
  background: #f9fafb; font-size: 1.1rem; font-weight: 600; color: #374151;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.15s, border-color 0.15s;
}
.pct-btn:hover { background: #e5e7eb; border-color: #d1d5db; }
.pct-btn:active { background: #d1d5db; }
.progress-bar-bg {
  flex: 1; height: 12px; background: #e5e7eb; border-radius: 10px; overflow: hidden;
  cursor: pointer; transition: box-shadow 0.15s;
}
.progress-bar-bg:hover { box-shadow: 0 0 0 3px rgba(0,128,0,0.1); }
.progress-bar-fill { height: 100%; background: var(--accent-green); border-radius: 10px; transition: width 0.3s; }

.section-divider {
  font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); padding: 4px 0; border-bottom: 1px solid #f0f0f0; margin-top: 4px;
}

.text-hint { font-size: 0.82rem; color: var(--text-muted); margin: 8px 0 0; }

/* Actions — exact same as PolicyForm */
.form-actions {
  display: flex; justify-content: flex-start; gap: 12px;
  padding: 0 32px 28px; flex-shrink: 0;
}
.btn-cancel {
  padding: 11px 24px; border-radius: 10px; border: 1.5px solid #e5e7eb;
  background: white; font-family: inherit; font-size: 0.9rem; cursor: pointer; color: #555;
}
.btn-cancel:hover { background: #f9fafb; }
.btn-submit {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 28px; border-radius: 10px; border: none;
  background: var(--bg-sidebar); color: white;
  font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer;
}
.btn-submit:hover { background: #2c6c58; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.7s linear infinite; }

/* Modal transition — exact same */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>

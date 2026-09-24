<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDragScroll } from '../composables/useDragScroll'
import {
  getAllPublicacoes, createPublicacao, updatePublicacao, deletePublicacao, defaultPublicacao
} from '../lib/publicacoes'
import type { Publicacao, PublicacaoInput, TipoPublicacao, StatusPublicacao } from '../lib/publicacoes'
import {
  BookOpen, Plus, Search, X, BarChart2, FileText,
  Newspaper, Globe, Mic2, Save, Loader2,
  Calendar, Building2, Pencil, Trash2, ExternalLink
} from 'lucide-vue-next'

// ── State ───────────────────────────────────────────────────
const publicacoes = ref<Publicacao[]>([])
const loading     = ref(false)
const saving      = ref(false)
const view        = ref<'stats' | 'list'>('stats')
const showForm    = ref(false)
const editingId   = ref<string | null>(null)
const searchQuery = ref('')
const filterTipo  = ref('')
const activeTab   = ref<'identificacao' | 'autoria' | 'metadados' | 'distribuicao'>('identificacao')

const tabBarRef = ref<HTMLElement | null>(null)
useDragScroll(tabBarRef)

onMounted(async () => {
  loading.value = true
  publicacoes.value = await getAllPublicacoes()
  loading.value = false
})

// ── KPIs ────────────────────────────────────────────────────
const publicadas  = computed(() => publicacoes.value.filter(p => p.status === 'Publicado').length)
const rascunhos   = computed(() => publicacoes.value.filter(p => p.status === 'Rascunho' || p.status === 'Em Revisão').length)
const emRevisao   = computed(() => publicacoes.value.filter(p => p.status === 'Em Revisão').length)

// ── Filter ──────────────────────────────────────────────────
const filtered = computed(() => {
  let list = publicacoes.value
  if (filterTipo.value) list = list.filter(p => p.tipo === filterTipo.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.titulo.toLowerCase().includes(q) ||
      p.area_tematica.toLowerCase().includes(q) ||
      p.entidade_autora.toLowerCase().includes(q)
    )
  }
  return list
})

// ── Stats ───────────────────────────────────────────────────
const byTipo = computed(() => {
  const m: Record<string, number> = {}
  for (const p of publicacoes.value) m[p.tipo] = (m[p.tipo] ?? 0) + 1
  return Object.entries(m).sort((a,b) => b[1]-a[1])
})
const byAno = computed(() => {
  const m: Record<string, number> = {}
  for (const p of publicacoes.value) if (p.ano_referencia) m[p.ano_referencia] = (m[p.ano_referencia] ?? 0) + 1
  return Object.entries(m).sort((a,b) => b[0].localeCompare(a[0])).slice(0,5)
})

// ── Form ────────────────────────────────────────────────────
const form = ref<PublicacaoInput>(defaultPublicacao())

function openNew() {
  form.value = defaultPublicacao()
  editingId.value = null
  activeTab.value = 'identificacao'
  showForm.value = true
}
function openEdit(p: Publicacao) {
  const { id, created_at, ...rest } = p
  form.value = { ...rest }
  editingId.value = id
  activeTab.value = 'identificacao'
  showForm.value = true
}
function closeForm() { showForm.value = false }

async function submitForm() {
  if (!form.value.titulo.trim()) { activeTab.value = 'identificacao'; alert('O título é obrigatório.'); return }
  saving.value = true
  try {
    if (editingId.value) {
      await updatePublicacao(editingId.value, form.value)
    } else {
      await createPublicacao(form.value)
    }
    publicacoes.value = await getAllPublicacoes()
    showForm.value = false
  } finally { saving.value = false }
}

async function remove(id: string) {
  if (!confirm('Confirma a eliminação deste registo?')) return
  await deletePublicacao(id)
  publicacoes.value = publicacoes.value.filter(p => p.id !== id)
}

// ── Helpers ─────────────────────────────────────────────────
function statusColor(s: StatusPublicacao): string {
  return ({ 'Publicado':'#16a34a','Rascunho':'#6b7280','Em Revisão':'#d97706','Arquivado':'#9ca3af' } as any)[s] ?? '#6b7280'
}
function statusBg(s: StatusPublicacao): string {
  return ({ 'Publicado':'#dcfce7','Rascunho':'#f3f4f6','Em Revisão':'#fef3c7','Arquivado':'#f9fafb' } as any)[s] ?? '#f3f4f6'
}
function tipoIcon(t: TipoPublicacao) {
  if (t.includes('Relatório')) return FileText
  if (t.includes('Boletim')) return Newspaper
  if (t.includes('Manual') || t.includes('Técni')) return Globe
  if (t.includes('Discurso') || t.includes('Comunicado')) return Mic2
  return BookOpen
}

const TIPOS_PUBLICACAO = [
  'Relatório Anual de Actividades',
  'Boletim Estatístico Agrário',
  'Plano Económico e Social (PES)',
  'Balanço do PES',
  'Manual Técnico / Guia',
  'Comunicado de Imprensa',
  'Discurso Ministerial',
  'Política / Estratégia / Plano',
  'Resultado de Inquérito Agrário (TIA/IAA)',
  'Publicação Científica / Artigo',
  'Boletim Meteorológico Agrário',
  'Outro',
]

const ENTIDADES = [
  'MADER — Ministério da Agricultura e Desenvolvimento Rural',
  'DNAS — Direcção Nacional de Agricultura e Silvicultura',
  'DNPDR — Direcção Nacional de Promoção do Desenvolvimento Rural',
  'IIAM — Instituto de Investigação Agrária de Moçambique',
  'DNEA — Direcção Nacional de Extensão Agrária',
  'INIR — Instituto Nacional de Irrigação',
  'INE — Instituto Nacional de Estatística',
  'MEF — Ministério da Economia e Finanças',
  'FAO Moçambique',
  'Outro',
]

const AREAS_TEMATICAS = [
  'Produção e Produtividade Agrícola', 'Irrigação e Gestão de Água',
  'Sementes e Melhoramento Vegetal', 'Mecanização Agrícola',
  'Segurança Alimentar e Nutricional', 'Comercialização e Mercados Agrícolas',
  'Extensão Rural e Capacitação', 'Pecuária e Sanidade Animal',
  'Conservação de Solos e Florestas', 'Mudanças Climáticas e Agro-meteorologia',
  'Crédito e Finanças Rurais', 'Género no Sector Agrário',
  'Gestão e Finanças Públicas', 'Cooperação e Parcerias',
]
</script>

<template>
  <div class="pub-view">

    <!-- ══ HEADER ═══════════════════════════════════════════ -->
    <div class="page-header card">
      <div class="page-title-section">
        <div class="page-icon"><BookOpen :size="22" /></div>
        <div>
          <h1 class="page-title">Publicações e Biblioteca</h1>
          <p class="page-subtitle">Repositório de relatórios, boletins, comunicados e publicações institucionais — MADER</p>
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
        <button class="btn-new" @click="openNew"><Plus :size="17" /> Nova Publicação</button>
      </div>
    </div>

    <!-- ══ KPIs ══════════════════════════════════════════════ -->
    <div class="kpi-row">
      <div class="kpi-card kpi-green">
        <div class="kpi-icon-box"><BookOpen :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Publicadas</div>
          <div class="kpi-value">{{ publicadas }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-amber">
        <div class="kpi-icon-box"><Newspaper :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Em Revisão</div>
          <div class="kpi-value">{{ emRevisao }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-blue">
        <div class="kpi-icon-box"><Globe :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Rascunhos</div>
          <div class="kpi-value">{{ rascunhos }}</div>
        </div>
      </div>
      <div class="kpi-card kpi-purple">
        <div class="kpi-icon-box"><FileText :size="18" /></div>
        <div class="kpi-info">
          <div class="kpi-label">Total no Repositório</div>
          <div class="kpi-value">{{ publicacoes.length }}</div>
        </div>
      </div>
    </div>

    <!-- ══ STATS ══════════════════════════════════════════════ -->
    <template v-if="view === 'stats'">
      <div v-if="!publicacoes.length" class="empty-state card">
        <BookOpen :size="52" style="color:#d1d5db" />
        <h3>Biblioteca Digital em Desenvolvimento</h3>
        <p>A Biblioteca Digital do SiGRA centralizará todas as publicações institucionais do MADER. Registe relatórios, boletins, manuais e comunicados.</p>
        <div class="tags-row">
          <span class="ex-tag">Relatório Anual</span>
          <span class="ex-tag">Boletim Estatístico (TIA/IAA)</span>
          <span class="ex-tag">PES / BdPES</span>
          <span class="ex-tag">Manual Técnico</span>
          <span class="ex-tag">Comunicado</span>
        </div>
        <button class="btn-new" style="margin-top:8px" @click="openNew">
          <Plus :size="16" /> Adicionar Primeira Publicação
        </button>
      </div>
      <div v-else class="stats-grid">
        <!-- Category cards -->
        <div class="stat-card wide-card card">
          <h3 class="stat-title">Publicações por Tipo</h3>
          <div class="cat-grid">
            <div v-for="[tipo, count] in byTipo" :key="tipo" class="cat-item">
              <div class="cat-icon-sm">
                <component :is="tipoIcon(tipo as TipoPublicacao)" :size="18" />
              </div>
              <div class="cat-info">
                <span class="cat-label">{{ tipo }}</span>
                <span class="cat-count">{{ count }} doc{{ count !== 1 ? 's' : '' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="stat-card card">
          <h3 class="stat-title">Publicações por Ano de Referência</h3>
          <div class="status-list">
            <div v-for="[ano, count] in byAno" :key="ano" class="status-row">
              <span class="sr-dot" style="background:#d97706"></span>
              <span class="sr-label">{{ ano }}</span>
              <div class="sr-track">
                <div class="sr-fill" :style="{ width: (count/publicacoes.length*100)+'%', background: '#d97706' }"></div>
              </div>
              <span class="sr-count">{{ count }}</span>
            </div>
          </div>
        </div>
        <div class="stat-card card">
          <h3 class="stat-title">Últimas Publicações</h3>
          <div class="recent-list">
            <div v-for="p in publicacoes.slice(0,5)" :key="p.id" class="recent-item">
              <span class="ri-badge" :style="{ background: statusBg(p.status), color: statusColor(p.status) }">{{ p.status }}</span>
              <span class="ri-titulo">{{ p.titulo }}</span>
              <span class="ri-ano">{{ p.ano_referencia }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ LIST ══════════════════════════════════════════════ -->
    <template v-if="view === 'list'">
      <div class="toolbar card">
        <div class="search-box">
          <Search :size="16" style="color:#9ca3af;flex-shrink:0" />
          <input v-model="searchQuery" placeholder="Pesquisar título, área temática ou entidade…" class="search-input" />
        </div>
        <select v-model="filterTipo" class="filter-select">
          <option value="">Todos os tipos</option>
          <option v-for="t in TIPOS_PUBLICACAO" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>
      <div v-if="filtered.length" class="pub-list">
        <div v-for="p in filtered" :key="p.id" class="pub-card card">
          <div class="pc-top">
            <span class="pc-tipo">{{ p.tipo }}</span>
            <span class="pc-badge" :style="{ background: statusBg(p.status), color: statusColor(p.status) }">{{ p.status }}</span>
            <span class="pc-acesso" v-if="p.acesso !== 'Público'">{{ p.acesso }}</span>
          </div>
          <h3 class="pc-titulo">{{ p.titulo }}</h3>
          <p v-if="p.subtitulo" class="pc-sub">{{ p.subtitulo }}</p>
          <div class="pc-meta">
            <span class="pc-meta-item"><Building2 :size="13" /> {{ p.entidade_autora }}</span>
            <span class="pc-meta-item"><Calendar :size="13" /> {{ p.data_publicacao || p.ano_referencia || '—' }}</span>
            <span v-if="p.area_tematica" class="pc-meta-item"><Globe :size="13" /> {{ p.area_tematica }}</span>
          </div>
          <div class="form-actions" style="padding:0;margin-top:4px">
            <button v-if="p.link_documento" class="btn-cancel" @click="window.open(p.link_documento,'_blank')"><ExternalLink :size="14" /> Abrir</button>
            <button class="btn-cancel" @click="openEdit(p)"><Pencil :size="14" /> Editar</button>
            <button class="btn-danger" @click="remove(p.id)"><Trash2 :size="14" /> Eliminar</button>
          </div>
        </div>
      </div>
      <div v-else-if="!loading" class="empty-state card">
        <BookOpen :size="44" style="color:#d1d5db" />
        <h3>Nenhum resultado encontrado</h3>
        <p>Ajuste os filtros ou registe uma nova publicação.</p>
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
                  {{ editingId ? 'Actualização de Publicação' : 'Registo de Nova Publicação' }}
                </h2>
                <p>{{ editingId ? 'Actualize os metadados e informações da publicação.' : 'Preencha os campos para catalogar a publicação na Biblioteca Digital SiGRA.' }}</p>
              </div>
              <button class="close-btn" @click="closeForm"><X :size="20" /></button>
            </div>

            <div ref="tabBarRef" class="tab-bar" @wheel.prevent="(e) => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY }">
              <button :class="['tab-btn', { active: activeTab === 'identificacao' }]" @click="activeTab = 'identificacao'">
                Identificação e Classificação
              </button>
              <button :class="['tab-btn', { active: activeTab === 'autoria' }]" @click="activeTab = 'autoria'">
                <Building2 :size="14" /> Autoria e Instituição
              </button>
              <button :class="['tab-btn', { active: activeTab === 'metadados' }]" @click="activeTab = 'metadados'">
                <Globe :size="14" /> Metadados Editoriais
              </button>
              <button :class="['tab-btn', { active: activeTab === 'distribuicao' }]" @click="activeTab = 'distribuicao'">
                <ExternalLink :size="14" /> Distribuição e Acesso
              </button>
            </div>

            <form @submit.prevent="submitForm">

              <div class="form-scroll">

              <!-- TAB 1: Identificação -->
              <div v-show="activeTab === 'identificacao'" class="form-grid">
                <div class="field">
                  <label>Tipo de Publicação</label>
                  <select v-model="form.tipo">
                    <option v-for="t in TIPOS_PUBLICACAO" :key="t">{{ t }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Estado</label>
                  <select v-model="form.status">
                    <option v-for="s in ['Publicado','Rascunho','Em Revisão','Arquivado']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Título da Publicação <span class="required">*</span></label>
                  <input v-model="form.titulo" type="text" placeholder="Ex: Relatório Anual de Actividades do MADER 2024" />
                </div>
                <div class="field full">
                  <label>Subtítulo / Complemento do Título</label>
                  <input v-model="form.subtitulo" type="text" placeholder="Ex: Resultados e perspectivas para o sector agrário" />
                </div>
                <div class="field">
                  <label>Área Temática</label>
                  <select v-model="form.area_tematica">
                    <option value="">Seleccionar…</option>
                    <option v-for="a in AREAS_TEMATICAS" :key="a">{{ a }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Palavras-Chave (separadas por vírgula)</label>
                  <input v-model="form.palavras_chave" type="text" placeholder="Ex: arroz, irrigação, segurança alimentar" />
                </div>
                <div class="field">
                  <label>Idioma</label>
                  <select v-model="form.idioma">
                    <option v-for="i in ['Português','Inglês','Francês','Nyanja','Macua','Sena']" :key="i">{{ i }}</option>
                  </select>
                </div>
                <div class="field">
                  <label>Nível de Acesso</label>
                  <select v-model="form.acesso">
                    <option v-for="a in ['Público','Restrito — Uso Interno','Confidencial']" :key="a">{{ a }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Sumário Executivo / Resumo</label>
                  <textarea v-model="form.sumario_executivo" rows="5" placeholder="Resuma os principais temas, resultados e conclusões desta publicação…"></textarea>
                </div>
              </div>

              <!-- TAB 2: Autoria -->
              <div v-show="activeTab === 'autoria'" class="form-grid">
                <div class="field full">
                  <label>Entidade Autora / Responsável</label>
                  <select v-model="form.entidade_autora">
                    <option v-for="e in ENTIDADES" :key="e">{{ e }}</option>
                  </select>
                </div>
                <div class="field full">
                  <label>Autores / Equipa Técnica (nomes separados por vírgula)</label>
                  <input v-model="form.autores" type="text" placeholder="Ex: João Macuácua, Ana Nhantumbo, Técnicos da DNAS" />
                </div>
                <div class="field">
                  <label>Direcção / Departamento Responsável</label>
                  <input v-model="form.departamento" type="text" placeholder="Ex: DNAS — Direcção Nacional de Agricultura e Silvicultura" />
                </div>
                <div class="field">
                  <label>Ponto Focal / Responsável Técnico</label>
                  <input v-model="form.responsavel" type="text" placeholder="Nome do responsável pela publicação" />
                </div>
              </div>

              <!-- TAB 3: Metadados -->
              <div v-show="activeTab === 'metadados'" class="form-grid">
                <div class="field">
                  <label>Data de Publicação</label>
                  <input v-model="form.data_publicacao" type="date" />
                </div>
                <div class="field">
                  <label>Ano de Referência dos Dados</label>
                  <input v-model="form.ano_referencia" type="text" placeholder="Ex: 2024" />
                </div>
                <div class="field">
                  <label>Número de Edição / Volume</label>
                  <input v-model="form.numero_edicao" type="text" placeholder="Ex: 3ª Edição / Volume 12 / Nº 45" />
                </div>
                <div class="field">
                  <label>ISBN / ISSN</label>
                  <input v-model="form.isbn_issn" type="text" placeholder="Ex: 978-972-XXX-XXX-X" />
                </div>
                <div class="field">
                  <label>Número de Páginas</label>
                  <input v-model.number="form.numero_paginas" type="number" min="0" placeholder="Ex: 120" />
                </div>
                <div class="field">
                  <label>Abrangência Geográfica</label>
                  <input v-model="form.cobertura_geografica" type="text" placeholder="Ex: Nacional / Zambézia / Nampula e Zambézia" />
                </div>
              </div>

              <!-- TAB 4: Distribuição -->
              <div v-show="activeTab === 'distribuicao'" class="form-grid">
                <div class="field full">
                  <label>Link / Caminho para o Documento</label>
                  <input v-model="form.link_documento" type="text" placeholder="https://www.mader.gov.mz/publicacoes/... ou caminho do ficheiro" />
                </div>
                <div class="field">
                  <label>Número de Exemplares Impressos</label>
                  <input v-model.number="form.numero_exemplares" type="number" min="0" placeholder="Ex: 500" />
                </div>
                <div class="field">
                  <label>Canais de Distribuição</label>
                  <input v-model="form.canais_distribuicao" type="text" placeholder="Ex: Portal MADER, FAO, SIMA, e-mail, CD-ROM" />
                </div>
                <div class="field full">
                  <label>Observações Adicionais</label>
                  <textarea v-model="form.observacoes" rows="4" placeholder="Notas sobre a publicação, revisões previstas, restrições de uso…"></textarea>
                </div>
              </div>

              </div><!-- /.form-scroll -->

              <div class="form-actions">
                <button type="button" class="btn-cancel" @click="closeForm">Cancelar Operação</button>
                <button type="submit" class="btn-submit" :disabled="saving">
                  <Loader2 v-if="saving" :size="16" class="spin" />
                  <component v-else :is="editingId ? Save : Plus" :size="16" />
                  {{ editingId ? 'Submeter Alterações' : 'Registar Publicação' }}
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

.pub-view { display: flex; flex-direction: column; gap: 14px; }

.page-header.card { display: flex; flex-direction: column; gap: 12px; padding: 16px; }
@media (min-width: 640px) { .page-header.card { flex-direction: row; justify-content: space-between; align-items: center; padding: 18px 24px; } }
.page-title-section { display: flex; align-items: center; gap: 14px; }
.page-icon    { width: 44px; height: 44px; border-radius: 12px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.page-title   { font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin: 0 0 3px; }
.page-subtitle{ font-size: 0.78rem; color: var(--text-muted); margin: 0; }
.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.view-toggle { display: flex; background: #f3f4f6; border-radius: 10px; padding: 3px; gap: 2px; }
.vt-btn { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: var(--text-muted); cursor: pointer; }
.vt-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
.btn-new { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 11px; border: none; background: var(--bg-sidebar); color: white; font-size: 0.84rem; font-weight: 700; cursor: pointer; white-space: nowrap; transition: background 0.2s; }
.btn-new:hover { background: #2c6c58; }

.kpi-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media (min-width: 640px)  { .kpi-row { grid-template-columns: repeat(4, 1fr); } }
.kpi-card { background: white; border-radius: 12px; padding: 12px 10px; display: flex; align-items: center; gap: 9px; box-shadow: 0 1px 6px rgba(0,0,0,0.05); border: 1px solid #f0f0f0; overflow: hidden; }
.kpi-icon-box { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-green  .kpi-icon-box { background: #dcfce7; color: #16a34a; }
.kpi-amber  .kpi-icon-box { background: #fef3c7; color: #d97706; }
.kpi-blue   .kpi-icon-box { background: #dbeafe; color: #2563eb; }
.kpi-purple .kpi-icon-box { background: #ede9fe; color: #7c3aed; }
.kpi-info { min-width: 0; flex: 1; }
.kpi-label { font-size: 0.58rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); }
.kpi-value { font-size: 1.1rem; font-weight: 800; color: var(--text-main); white-space: nowrap; }

.stats-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
@media (min-width: 768px) { .stats-grid { grid-template-columns: 1fr 1fr; } }
.stat-card { padding: 18px; }
.wide-card { grid-column: 1 / -1; }
.stat-title { font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin: 0 0 14px; }

.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 8px; }
.cat-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: #f8fafc; border-radius: 10px; border: 1px solid #e5e7eb; }
.cat-icon-sm { width: 32px; height: 32px; border-radius: 8px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.cat-info { display: flex; flex-direction: column; min-width: 0; }
.cat-label { font-size: 0.78rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cat-count { font-size: 0.68rem; color: var(--text-muted); }

.status-list { display: flex; flex-direction: column; gap: 9px; }
.status-row { display: flex; align-items: center; gap: 8px; }
.sr-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.sr-label { font-size: 0.78rem; color: var(--text-main); flex: 1; }
.sr-track { width: 80px; flex-shrink: 0; height: 6px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.sr-fill  { height: 100%; border-radius: 10px; }
.sr-count { font-size: 0.78rem; font-weight: 800; min-width: 20px; text-align: right; }

.recent-list { display: flex; flex-direction: column; gap: 8px; }
.recent-item { display: flex; align-items: center; gap: 8px; }
.ri-badge { padding: 2px 7px; border-radius: 6px; font-size: 0.66rem; font-weight: 800; flex-shrink: 0; }
.ri-titulo { font-size: 0.78rem; color: var(--text-main); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ri-ano { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); }

.empty-state.card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 50px 24px; gap: 14px; }
.empty-state h3 { font-size: 1.05rem; color: var(--text-main); margin: 0; }
.empty-state p  { font-size: 0.84rem; color: var(--text-muted); max-width: 480px; line-height: 1.7; margin: 0; }
.tags-row { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; }
.ex-tag { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; }

.toolbar.card { display: flex; flex-direction: column; gap: 10px; padding: 12px 16px; }
@media (min-width: 640px) { .toolbar.card { flex-direction: row; padding: 12px 20px; } }
.search-box { display: flex; align-items: center; gap: 9px; flex: 1; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0 12px; height: 40px; }
.search-input { flex: 1; border: none; background: transparent; font-size: 0.85rem; outline: none; font-family: inherit; }
.filter-select { padding: 0 12px; height: 40px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.84rem; background: #f8fafc; outline: none; cursor: pointer; }

.pub-list { display: flex; flex-direction: column; gap: 12px; }
.pub-card.card { padding: 16px; display: flex; flex-direction: column; gap: 10px; }
.pc-top { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pc-tipo { font-size: 0.7rem; font-weight: 800; color: #d97706; background: #fef3c7; padding: 2px 8px; border-radius: 6px; }
.pc-badge { padding: 3px 9px; border-radius: 7px; font-size: 0.7rem; font-weight: 800; }
.pc-acesso { font-size: 0.68rem; font-weight: 700; color: #dc2626; background: #fee2e2; padding: 2px 8px; border-radius: 6px; }
.pc-titulo { font-size: 0.95rem; font-weight: 700; color: var(--text-main); margin: 0; }
.pc-sub { font-size: 0.78rem; color: var(--text-muted); margin: 0; }
.pc-meta { display: flex; flex-wrap: wrap; gap: 8px 16px; }
.pc-meta-item { display: flex; align-items: center; gap: 5px; font-size: 0.76rem; color: var(--text-muted); }
.btn-danger { display: flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; border: 1.5px solid #fee2e2; background: white; font-family: inherit; font-size: 0.88rem; cursor: pointer; color: #dc2626; }

/* Modal — same pattern */
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
.form-actions { display: flex; justify-content: flex-start; gap: 12px; padding: 0 32px 28px; flex-shrink: 0; }
.btn-cancel { padding: 11px 24px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: white; font-family: inherit; font-size: 0.9rem; cursor: pointer; color: #555; display: flex; align-items: center; gap: 6px; }
.btn-cancel:hover { background: #f9fafb; }
.btn-submit { display: flex; align-items: center; gap: 8px; padding: 11px 28px; border-radius: 10px; border: none; background: var(--bg-sidebar); color: white; font-family: inherit; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
.btn-submit:hover { background: #2c6c58; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.7s linear infinite; }
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>

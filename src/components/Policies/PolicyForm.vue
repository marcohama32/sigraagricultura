<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDragScroll } from '../../composables/useDragScroll'
import { X, Save, Plus, Upload, Trash2, MapPin, Users, BarChart2, Paperclip } from 'lucide-vue-next'
import type { Policy, PolicyInput, PolicyAnexo } from '../../lib/policies'

const props = defineProps<{
  visible: boolean
  policy?: Policy | null
  defaultTipo?: string
}>()

const tabBarRef = ref<HTMLElement | null>(null)
useDragScroll(tabBarRef)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', data: PolicyInput): void
}>()

// ── Constants ─────────────────────────────────────────
const TIPOS = [
  'Política', 'Estratégia', 'Plano Nacional de Investimento (PNISA)',
  'Plano Estratégico (PEDSA)', 'Plano Operacional (PODA)',
  'Plano de Gestão Ambiental e Social (PGAS)', 'Programa Nacional', 'Projecto', 'Outro'
]
const CATEGORIES = [
  'Segurança Alimentar', 'Irrigação', 'Sementes', 'Fertilizantes', 'Pecuária',
  'Sanidade Vegetal', 'Sanidade Animal', 'Mecanização Agrária', 'Ambiente',
  'Desenvolvimento Rural', 'Extensão Rural', 'Recursos Hídricos', 'Outro'
]
const STATUSES = ['Ativa', 'Inativa', 'Em Revisão']
const AMBITOS = ['Nacional', 'Provincial', 'Distrital']
const PROVINCIAS_MZ = [
  'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo Cidade',
  'Maputo Província', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambézia'
]
const ESTADO_MONITORIA = ['Em Curso', 'Concluído', 'Atrasado', 'Suspenso', 'Não Iniciado']
const FREQUENCIA_MONITORIA = ['Mensal', 'Trimestral', 'Semestral', 'Anual', 'Bianual', 'Ad Hoc']

// ── State ─────────────────────────────────────────────
const activeTab = ref<'basico' | 'ambito' | 'monitoria' | 'parceiros' | 'anexos'>('basico')
const isEditing = computed(() => !!props.policy)

const emptyForm = (): PolicyInput => ({
  tipo: props.defaultTipo || 'Política',
  titulo: '',
  descricao: '',
  categoria: 'Segurança Alimentar',
  status: 'Ativa',
  responsavel: '',
  data_inicio: '',
  data_fim: '',
  metas: '',
  documento_url: '',
  conteudo_completo: '',
  ambito: 'Nacional',
  provincias: '',
  implementacao_pct: 0,
  estado_monitoria: 'Em Curso',
  ultima_revisao: '',
  proxima_revisao: '',
  quadro_logico: '',
  fonte_verificacao: '',
  frequencia_monitoria: 'Trimestral',
  responsavel_ma: '',
  orcamento_ma: '',
  riscos_mitigacao: '',
  licoes_aprendidas: '',
  parceiros: '',
  anexos: '[]',
})

const form = ref<PolicyInput>(emptyForm())
const errors = ref<Record<string, string>>({})

// Anexos local state
const anexosList = ref<PolicyAnexo[]>([])
const newAnexoNome = ref('')

// Provincias as array
const selectedProvincias = ref<string[]>([])

// Parceiros as array
const parceirosList = ref<string[]>([])
const newParceiro = ref('')

// ── Watchers ──────────────────────────────────────────
watch(() => props.visible, (val) => {
  if (val) open()
})

watch(selectedProvincias, (val) => {
  form.value.provincias = val.join(',')
})

watch(anexosList, (val) => {
  form.value.anexos = JSON.stringify(val)
}, { deep: true })

watch(parceirosList, (val) => {
  form.value.parceiros = val.join(',')
})

// ── Methods ───────────────────────────────────────────
function open() {
  activeTab.value = 'basico'
  errors.value = {}
  if (props.policy) {
    form.value = {
      tipo: props.policy.tipo || 'Política',
      titulo: props.policy.titulo,
      descricao: props.policy.descricao,
      categoria: props.policy.categoria,
      status: props.policy.status,
      responsavel: props.policy.responsavel,
      data_inicio: props.policy.data_inicio,
      data_fim: props.policy.data_fim,
      metas: props.policy.metas,
      documento_url: props.policy.documento_url,
      conteudo_completo: props.policy.conteudo_completo,
      ambito: props.policy.ambito || 'Nacional',
      provincias: props.policy.provincias || '',
      implementacao_pct: props.policy.implementacao_pct || 0,
      estado_monitoria: props.policy.estado_monitoria || 'Em Curso',
      ultima_revisao: props.policy.ultima_revisao || '',
      proxima_revisao: props.policy.proxima_revisao || '',
      parceiros: props.policy.parceiros || '',
      anexos: props.policy.anexos || '[]',
    }
    selectedProvincias.value = props.policy.provincias ? props.policy.provincias.split(',').filter(Boolean) : []
    parceirosList.value = props.policy.parceiros ? props.policy.parceiros.split(',').filter(Boolean) : []
    try { anexosList.value = JSON.parse(props.policy.anexos || '[]') } catch { anexosList.value = [] }
  } else {
    form.value = emptyForm()
    selectedProvincias.value = []
    parceirosList.value = []
    anexosList.value = []
  }
}

function validate(): boolean {
  errors.value = {}
  if (!form.value.titulo.trim()) errors.value.titulo = 'O título é obrigatório.'
  if (!form.value.tipo) errors.value.tipo = 'Selecione um tipo.'
  if (!form.value.categoria) errors.value.categoria = 'Selecione uma categoria.'
  return Object.keys(errors.value).length === 0
}

function handleSubmit() {
  if (!validate()) { activeTab.value = 'basico'; return }
  emit('submit', { ...form.value })
}

function toggleProvincia(prov: string) {
  const idx = selectedProvincias.value.indexOf(prov)
  if (idx === -1) selectedProvincias.value.push(prov)
  else selectedProvincias.value.splice(idx, 1)
}

function handleDocUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => { form.value.documento_url = e.target?.result as string }
  reader.readAsDataURL(file)
}

function handleAnexoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return
  Array.from(files).forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      anexosList.value.push({ nome: file.name, url: e.target?.result as string })
    }
    reader.readAsDataURL(file)
  })
  target.value = ''
}

function removeAnexo(index: number) {
  anexosList.value.splice(index, 1)
}

function addParceiro() {
  const p = newParceiro.value.trim()
  if (p && !parceirosList.value.includes(p)) parceirosList.value.push(p)
  newParceiro.value = ''
}

function removeParceiro(index: number) {
  parceirosList.value.splice(index, 1)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="overlay" @click.self="emit('close')">
        <div class="modal" @vue:mounted="open">
          <!-- Header -->
          <div class="modal-header">
            <div>
              <h2 class="flex items-center gap-2">
                <component :is="isEditing ? Save : Plus" class="icon-md" />
                {{ isEditing ? 'Actualização de ' + form.tipo : 'Registo de Nova ' + form.tipo }}
              </h2>
              <p>{{ isEditing ? 'Proceda à actualização dos dados do instrumento normativo.' : 'Preencha os campos obrigatórios para registar o novo instrumento no sistema.' }}</p>
            </div>
            <button class="close-btn" @click="emit('close')"><X :size="20" /></button>
          </div>

          <!-- Tabs -->
          <div ref="tabBarRef" class="tab-bar" @wheel.prevent="(e) => { (e.currentTarget as HTMLElement).scrollLeft += e.deltaY }">
            <button :class="['tab-btn', { active: activeTab === 'basico' }]" @click="activeTab = 'basico'">
              Identificação e Caracterização
            </button>
            <button :class="['tab-btn', { active: activeTab === 'ambito' }]" @click="activeTab = 'ambito'">
              <MapPin :size="14" /> Abrangência Territorial
            </button>
            <button :class="['tab-btn', { active: activeTab === 'monitoria' }]" @click="activeTab = 'monitoria'">
              <BarChart2 :size="14" /> Monitoria e Avaliação
            </button>
            <button :class="['tab-btn', { active: activeTab === 'parceiros' }]" @click="activeTab = 'parceiros'">
              <Users :size="14" /> Entidades Parceiras
            </button>
            <button :class="['tab-btn', { active: activeTab === 'anexos' }]" @click="activeTab = 'anexos'">
              <Paperclip :size="14" /> Documentação Anexa ({{ anexosList.length }})
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit">

            <div class="form-scroll">

            <!-- ── TAB 1: IDENTIFICAÇÃO E CARACTERIZAÇÃO ── -->
            <div v-show="activeTab === 'basico'" class="form-grid">
              <!-- Tipo -->
              <div class="field">
                <label>Tipologia Documental <span class="required">*</span></label>
                <select v-model="form.tipo">
                  <option v-for="t in TIPOS" :key="t" :value="t">{{ t }}</option>
                </select>
                <span v-if="errors.tipo" class="error">{{ errors.tipo }}</span>
              </div>

              <!-- Status -->
              <div class="field">
                <label>Estado de Vigência <span class="required">*</span></label>
                <select v-model="form.status">
                  <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>

              <!-- Título -->
              <div class="field full">
                <label>Denominação Oficial do Documento <span class="required">*</span></label>
                <input v-model="form.titulo" type="text" :placeholder="'Ex: ' + form.tipo + ' Nacional de Irrigação 2025–2030'" />
                <span v-if="errors.titulo" class="error">{{ errors.titulo }}</span>
              </div>

              <!-- Categoria -->
              <div class="field">
                <label>Domínio Temático / Sector <span class="required">*</span></label>
                <select v-model="form.categoria">
                  <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
                <span v-if="errors.categoria" class="error">{{ errors.categoria }}</span>
              </div>

              <!-- Responsável -->
              <div class="field">
                <label>Entidade Proponente / Responsável</label>
                <input v-model="form.responsavel" type="text" placeholder="Ex: MADER — Direcção Nacional de Irrigação" />
              </div>

              <!-- Datas -->
              <div class="field">
                <label>Data de Entrada em Vigor</label>
                <input v-model="form.data_inicio" type="date" />
              </div>

              <div class="field">
                <label>Data de Cessação de Vigência</label>
                <input v-model="form.data_fim" type="date" />
              </div>

              <!-- Descrição -->
              <div class="field full">
                <label>Sumário Executivo</label>
                <textarea v-model="form.descricao" rows="3" placeholder="Descreva os objectivos estratégicos, o âmbito de aplicação e as principais linhas de acção e intervenção..."></textarea>
              </div>

              <!-- Metas -->
              <div class="field full">
                <label>Metas Quantitativas e Indicadores de Desempenho (KPIs)</label>
                <textarea v-model="form.metas" rows="3" placeholder="Ex: Expandir a área irrigada em 40% até 2030 | Alcançar 70% de auto-suficiência alimentar | Separar por |..."></textarea>
              </div>

              <!-- Documento Principal -->
              <div class="field full">
                <label><Upload :size="14" style="display:inline;margin-right:6px" />Instrumento Normativo Principal (PDF / Word)</label>
                <input type="file" accept=".pdf,.doc,.docx" @change="handleDocUpload" class="file-input" />
                <p v-if="form.documento_url" class="file-ok">✓ Documento recepcionado e associado com sucesso</p>
              </div>
            </div>

            <!-- ── TAB 2: ÂMBITO GEOGRÁFICO ── -->
            <div v-show="activeTab === 'ambito'" class="form-grid">
              <div class="field full">
                <label>Nível de Abrangência Territorial</label>
                <div class="radio-group">
                  <label v-for="a in AMBITOS" :key="a" class="radio-label">
                    <input type="radio" :value="a" v-model="form.ambito" />
                    {{ a }}
                  </label>
                </div>
              </div>

              <div v-if="form.ambito !== 'Nacional'" class="field full">
                <label>Unidades Territoriais Abrangidas (Províncias)</label>
                <div class="provincia-grid">
                  <label v-for="prov in PROVINCIAS_MZ" :key="prov" class="prov-tag"
                    :class="{ selected: selectedProvincias.includes(prov) }"
                    @click="toggleProvincia(prov)">
                    {{ prov }}
                  </label>
                </div>
                <p v-if="selectedProvincias.length > 0" class="text-hint">
                  Seleccionadas: {{ selectedProvincias.join(', ') }}
                </p>
              </div>

              <div v-if="form.ambito === 'Nacional'" class="field full">
                <div class="info-box">
                  <MapPin :size="20" />
                  <div>
                    <strong>Âmbito Nacional</strong>
                    <p>Este documento aplica-se a todo o território nacional de Moçambique (todas as 11 províncias).</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── TAB 3: MONITORIA & AVALIAÇÃO ── -->
            <div v-show="activeTab === 'monitoria'" class="form-grid">
              <div class="field full">
                <label>Estado da Execução e Monitoria</label>
                <div class="radio-group">
                  <label v-for="e in ESTADO_MONITORIA" :key="e" class="radio-label">
                    <input type="radio" :value="e" v-model="form.estado_monitoria" />
                    {{ e }}
                  </label>
                </div>
              </div>

              <div class="field full">
                <label>Grau de Execução Acumulado: <strong>{{ form.implementacao_pct }}%</strong></label>
                <div class="progress-control">
                  <button type="button" class="pct-btn" @click="form.implementacao_pct = Math.max(0, form.implementacao_pct - 5)">−</button>
                  <div class="progress-bar-bg" @click="(e) => { const rect = (e.currentTarget as HTMLElement).getBoundingClientRect(); form.implementacao_pct = Math.round(((e.clientX - rect.left) / rect.width) * 20) * 5 }">
                    <div class="progress-bar-fill" :style="{ width: form.implementacao_pct + '%' }"></div>
                  </div>
                  <button type="button" class="pct-btn" @click="form.implementacao_pct = Math.min(100, form.implementacao_pct + 5)">+</button>
                </div>
              </div>

              <div class="field full">
                <label>Quadro Lógico / Matriz de Resultados</label>
                <textarea v-model="form.quadro_logico" rows="4" placeholder="Descreva os indicadores-chave (KPIs), metas quantitativas, produtos esperados e resultados intermediários. Ex: Indicador 1 — Área irrigada expandida (meta: 40.000 ha até 2030); Indicador 2 — Produtividade média de cereais (meta: 2,5 t/ha)..."></textarea>
              </div>

              <div class="field full">
                <label>Fontes e Meios de Verificação</label>
                <textarea v-model="form.fonte_verificacao" rows="3" placeholder="Relatórios trimestrais do MADER, Inquérito Agrário Integrado (IAI), dados do INE, relatórios de campo das DPAs, auditorias independentes, actas de reuniões..."></textarea>
              </div>

              <div class="field">
                <label>Frequência de Monitoria</label>
                <select v-model="form.frequencia_monitoria">
                  <option v-for="f in FREQUENCIA_MONITORIA" :key="f" :value="f">{{ f }}</option>
                </select>
              </div>

              <div class="field">
                <label>Unidade / Responsável pela M&A</label>
                <input v-model="form.responsavel_ma" type="text" placeholder="Ex: Direcção de Planificação e Cooperação (DPC)" />
              </div>

              <div class="field">
                <label>Data do Último Relatório de Avaliação</label>
                <input v-model="form.ultima_revisao" type="date" />
              </div>

              <div class="field">
                <label>Data Prevista para Próxima Avaliação</label>
                <input v-model="form.proxima_revisao" type="date" />
              </div>

              <div class="field">
                <label>Orçamento Alocado para M&A (MT)</label>
                <input v-model="form.orcamento_ma" type="text" placeholder="Ex: 15.000.000,00 MT" />
              </div>

              <div class="field full">
                <label>Riscos Identificados e Medidas de Mitigação</label>
                <textarea v-model="form.riscos_mitigacao" rows="3" placeholder="Risco 1 — Insuficiência de dados a nível distrital → Mitigação: Reforço da capacidade dos SDAEs; Risco 2 — Atrasos na desembolsação de fundos → Mitigação: Mecanismo de alerta trimestral..."></textarea>
              </div>

              <div class="field full">
                <label>Lições Aprendidas e Recomendações</label>
                <textarea v-model="form.licoes_aprendidas" rows="3" placeholder="Documentação de boas práticas, ajustamentos metodológicos, recomendações para ciclos futuros de planificação..."></textarea>
              </div>
            </div>

            <!-- ── TAB 4: PARCEIROS ── -->
            <div v-show="activeTab === 'parceiros'" class="form-grid">
              <div class="field full">
                <label>Registar Entidade Parceira / Co-responsável</label>
                <div class="add-tag-row">
                  <input v-model="newParceiro" type="text" placeholder="Ex: FAO, UNICEF, MEF, MOPHRH, INGD, Nutrition International..." 
                    @keydown.enter.prevent="addParceiro" />
                  <button type="button" class="btn-add-tag" @click="addParceiro"><Plus :size="18" /></button>
                </div>
                <div v-if="parceirosList.length > 0" class="tags-list">
                  <span v-for="(p, i) in parceirosList" :key="i" class="tag">
                    {{ p }}
                    <button type="button" @click="removeParceiro(i)"><X :size="12" /></button>
                  </span>
                </div>
                <p v-else class="text-hint">Nenhuma entidade parceira registada. Utilize o campo acima para adicionar organismos governamentais, organizações internacionais ou entidades co-responsáveis.</p>
              </div>
            </div>

            <!-- ── TAB 5: ANEXOS ── -->
            <div v-show="activeTab === 'anexos'" class="form-grid">
              <div class="field full">
                <label>Juntar Documentação Complementar (Anexos)</label>
                <label class="upload-zone">
                  <Paperclip :size="24" />
                  <span>Clique para carregar um ou mais ficheiros</span>
                  <small>PDF, DOC, DOCX</small>
                  <input type="file" accept=".pdf,.doc,.docx" multiple @change="handleAnexoUpload" style="display:none" />
                </label>
              </div>

              <div v-if="anexosList.length > 0" class="field full">
                <label>Documentação Anexa Recepcionada ({{ anexosList.length }} ficheiro{{ anexosList.length !== 1 ? 's' : '' }})</label>
                <div class="anexos-list">
                  <div v-for="(anexo, i) in anexosList" :key="i" class="anexo-item">
                    <Paperclip :size="16" />
                    <span class="anexo-nome">{{ anexo.nome }}</span>
                    <button type="button" class="btn-remove-anexo" @click="removeAnexo(i)">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="field full">
                <p class="text-hint">Nenhum anexo carregado. Use o botão acima para adicionar Planos de Acção, Termos de Referência ou outros documentos de suporte.</p>
              </div>
            </div>

            </div><!-- /.form-scroll -->

            <!-- ── Actions ── -->
            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="emit('close')">Cancelar Operação</button>
              <button type="submit" class="btn-submit">
                <component :is="isEditing ? Save : Plus" :size="18" />
                {{ isEditing ? 'Submeter Alterações' : 'Registar Documento' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 8px; }
.icon-md { width: 22px; height: 22px; color: var(--text-main); }

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: flex-end; /* Sheet from bottom on mobile */
  justify-content: center;
  padding: 0;
}
@media (min-width: 640px) {
  .overlay {
    align-items: center;
    padding: 16px;
  }
}

.modal {
  background: white;
  /* Mobile: full-width bottom sheet */
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 100%;
  max-height: 95dvh;
  overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}
@media (min-width: 640px) {
  .modal {
    border-radius: 20px;
    max-width: 900px;
    max-height: 92vh;
    box-shadow: 0 24px 70px rgba(0,0,0,0.2);
  }
}
form { flex: 1; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.form-scroll { flex: 1; overflow-y: auto; min-height: 0; scrollbar-width: none; }
.form-scroll::-webkit-scrollbar { display: none; }
.form-scroll:hover { scrollbar-width: thin; scrollbar-color: #d1d5db transparent; }
.form-scroll:hover::-webkit-scrollbar { display: block; width: 5px; }
.form-scroll:hover::-webkit-scrollbar-track { background: transparent; }
.form-scroll:hover::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .modal-header { padding: 28px 32px 20px; }
}

.modal-header h2 { font-size: 1.3rem; color: var(--text-main); margin-bottom: 4px; }
.modal-header p  { font-size: 0.85rem; color: var(--text-muted); }

.close-btn {
  background: #f3f4f6; border: none; width: 34px; height: 34px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  color: #666; flex-shrink: 0; transition: background 0.2s;
}
.close-btn:hover { background: #e5e7eb; }

/* Tabs — scrollable on mobile */
.tab-bar {
  display: flex;
  gap: 2px;
  padding: 10px 16px 0;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  cursor: grab;
}
.tab-bar::-webkit-scrollbar { display: none; }
@media (min-width: 640px) {
  .tab-bar { padding: 12px 32px 0; gap: 4px; }
}

.tab-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 16px;
  border: none; background: transparent;
  font-family: inherit; font-size: 0.83rem; font-weight: 600;
  color: var(--text-muted); cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap; flex-shrink: 0;
}
.tab-btn:hover { color: var(--text-main); }
.tab-btn.active { color: var(--accent-green); border-bottom-color: var(--accent-green); }

/* Form grid — mobile: 1 col, desktop: 2 col */
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 18px 16px;
}
@media (min-width: 640px) {
  .form-grid { grid-template-columns: 1fr 1fr; gap: 18px; padding: 24px 32px; }
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field.full { grid-column: 1 / -1; }

label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
}

.required { color: #ef4444; }

input[type=text], input[type=date], select, textarea {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
  resize: vertical;
}
input:focus, select:focus, textarea:focus { border-color: var(--accent-green); }

.error { color: #ef4444; font-size: 0.78rem; }

.file-input {
  padding: 8px 12px;
  border: 1.5px dashed #d1d5db;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.88rem;
}
.file-ok { font-size: 0.82rem; color: #16a34a; font-weight: 600; }

/* Radio group */
.radio-group { display: flex; flex-wrap: wrap; gap: 16px; }
.radio-label { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; }

/* Province grid */
.provincia-grid {
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;
}
.prov-tag {
  padding: 6px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600;
  border: 1.5px solid #e5e7eb; cursor: pointer; transition: all 0.15s;
  color: #555; background: white;
}
.prov-tag:hover { border-color: var(--accent-green); color: var(--accent-green); }
.prov-tag.selected { background: var(--accent-green); color: white; border-color: var(--accent-green); }

/* Info box */
.info-box {
  display: flex; align-items: flex-start; gap: 16px;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px;
  color: #15803d;
}
.info-box strong { display: block; margin-bottom: 4px; }
.info-box p { font-size: 0.85rem; margin: 0; }

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
.progress-bar-fill {
  height: 100%; background: var(--accent-green); border-radius: 10px; transition: width 0.3s;
}

/* Tags / Parceiros */
.add-tag-row { display: flex; gap: 8px; }
.add-tag-row input { flex: 1; }
.btn-add-tag {
  width: 40px; height: 40px; border-radius: 10px; border: none;
  background: var(--accent-green); color: white; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.tags-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.tag {
  display: flex; align-items: center; gap: 6px;
  background: var(--bg-app); border: 1px solid #e5e7eb; border-radius: 20px;
  padding: 5px 12px; font-size: 0.82rem; font-weight: 500; color: var(--text-main);
}
.tag button { background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; }

/* Anexos */
.upload-zone {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 32px; border: 2px dashed #d1d5db; border-radius: 12px; cursor: pointer;
  color: var(--text-muted); transition: border-color 0.2s;
  font-size: 0.9rem; font-weight: normal;
}
.upload-zone:hover { border-color: var(--accent-green); color: var(--accent-green); }
.upload-zone small { font-size: 0.78rem; }

.anexos-list { display: flex; flex-direction: column; gap: 8px; }
.anexo-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border: 1px solid #e5e7eb; border-radius: 10px;
  background: #f9fafb; font-size: 0.88rem;
}
.anexo-nome { flex: 1; color: var(--text-main); font-weight: 500; }
.btn-remove-anexo {
  background: #fee2e2; border: none; border-radius: 6px; color: #ef4444;
  width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}

.text-hint { font-size: 0.82rem; color: var(--text-muted); margin: 8px 0 0; }

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  padding: 0 32px 28px;
  flex-shrink: 0;
}

.btn-cancel {
  padding: 11px 24px; border-radius: 10px; border: 1.5px solid #e5e7eb;
  background: white; font-family: inherit; font-size: 0.9rem; cursor: pointer;
  color: #555; transition: background 0.2s;
}
.btn-cancel:hover { background: #f9fafb; }

.btn-submit {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 28px; border-radius: 10px; border: none;
  background: var(--bg-sidebar); color: white;
  font-family: inherit; font-size: 0.9rem; font-weight: 600;
  cursor: pointer; transition: background 0.2s;
}
.btn-submit:hover { background: #2c6c58; }

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s, transform 0.25s; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.96); }
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { initDb } from '../lib/db'
import { getAllPolicies, createPolicy, updatePolicy, deletePolicy } from '../lib/policies'
import type { Policy, PolicyInput } from '../lib/policies'

import PolicyList from '../components/Policies/PolicyList.vue'
import PolicyForm from '../components/Policies/PolicyForm.vue'
import PolicyDetail from '../components/Policies/PolicyDetail.vue'
import PolicyStats from '../components/Policies/PolicyStats.vue'
import { FileText, Plus, AlertTriangle, CheckCircle2, XCircle, Target, BarChart2 } from 'lucide-vue-next'

const route = useRoute()

// ── Computed Route Data ────────────────────────────────
const isEstrategias = computed(() => route.path === '/estrategias')
const docType = computed(() => isEstrategias.value ? 'Estratégia' : 'Política')
const pageTitle = computed(() => isEstrategias.value ? 'Estratégias' : 'Políticas')
const pageSubtitle = computed(() => isEstrategias.value
  ? 'Repositório e gestão de instrumentos estratégicos do sector agrário'
  : 'Repositório e gestão de instrumentos normativos e políticas sectoriais')

// ── State ─────────────────────────────────────────────
const policies = ref<Policy[]>([])
const loading  = ref(true)

const filteredPolicies = computed(() => {
  return policies.value.filter(p => p.tipo === docType.value)
})

const view       = ref<'stats' | 'list'>('stats')
const showForm   = ref(false)
const showDetail = ref(false)
const showDeleteConfirm = ref(false)

const selectedPolicy = ref<Policy | null>(null)
const isEditing      = ref(false)

// Notifications
type ToastType = 'success' | 'error'
const toast = ref<{ msg: string; type: ToastType } | null>(null)

function notify(msg: string, type: ToastType = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3000)
}

// ── Data ──────────────────────────────────────────────
async function loadPolicies() {
  loading.value = true
  try {
    policies.value = await getAllPolicies()
  } catch (e) {
    notify('Erro ao carregar registos.', 'error')
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await initDb()
  await loadPolicies()
})

// ── Actions ───────────────────────────────────────────
function openCreate() {
  selectedPolicy.value = null
  isEditing.value = false
  showDetail.value = false
  showForm.value = true
}

function openEdit(policy: Policy) {
  selectedPolicy.value = policy
  isEditing.value = true
  showDetail.value = false
  showForm.value = true
}

function openDetail(policy: Policy) {
  selectedPolicy.value = policy
  showDetail.value = true
}

function openDeleteConfirm(policy: Policy) {
  selectedPolicy.value = policy
  showDetail.value = false
  showDeleteConfirm.value = true
}

async function handleSubmit(data: PolicyInput) {
  try {
    if (isEditing.value && selectedPolicy.value) {
      await updatePolicy(selectedPolicy.value.id, data)
      notify('Instrumento normativo actualizado com sucesso no sistema.')
    } else {
      await createPolicy(data)
      notify('Novo instrumento normativo registado com sucesso.')
    }
    showForm.value = false
    await loadPolicies()
  } catch (e) {
    notify('Ocorreu um erro ao gravar o instrumento. Verifique os dados e tente novamente.', 'error')
    console.error(e)
  }
}

async function handleDelete() {
  if (!selectedPolicy.value) return
  try {
    await deletePolicy(selectedPolicy.value.id)
    notify('Instrumento normativo eliminado definitivamente do sistema.')
    showDeleteConfirm.value = false
    selectedPolicy.value = null
    await loadPolicies()
  } catch (e) {
    notify('Ocorreu um erro ao eliminar o registo. Por favor tente novamente.', 'error')
    console.error(e)
  }
}
</script>

<template>
  <div class="policies-view">
    <!-- Page Header -->
    <div class="page-header card">
      <div class="page-title-section">
        <div class="page-icon">
          <component :is="isEstrategias ? Target : FileText" :size="24" class="text-accent" />
        </div>
        <div>
          <h1 class="page-title">{{ pageTitle }}</h1>
          <p class="page-subtitle">{{ pageSubtitle }}</p>
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
        <button class="btn-new" @click="openCreate">
          <Plus :size="18" /> Registar {{ docType }}
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <PolicyStats v-if="view === 'stats'" :policies="filteredPolicies" />

    <!-- List -->
    <PolicyList
      v-if="view === 'list'"
      :policies="filteredPolicies"
      :loading="loading"
      @view="openDetail"
      @edit="openEdit"
      @delete="openDeleteConfirm"
    />

    <!-- Form Modal -->
    <PolicyForm
      :visible="showForm"
      :policy="isEditing ? selectedPolicy : null"
      :defaultTipo="docType"
      @close="showForm = false"
      @submit="handleSubmit"
    />

    <!-- Detail Drawer -->
    <PolicyDetail
      :visible="showDetail"
      :policy="selectedPolicy"
      @close="showDetail = false"
      @edit="openEdit(selectedPolicy!)"
      @delete="openDeleteConfirm(selectedPolicy!)"
    />

    <!-- Delete Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteConfirm" class="overlay" @click.self="showDeleteConfirm = false">
          <div class="confirm-box">
            <AlertTriangle :size="48" class="confirm-icon text-red" />
            <h3>Confirmação de Eliminação</h3>
            <p>Confirma a eliminação definitiva do instrumento <strong>{{ selectedPolicy?.titulo }}</strong>? Esta operação é irreversível e não poderá ser revertida.</p>
            <div class="confirm-actions">
              <button class="btn-cancel" @click="showDeleteConfirm = false">Cancelar Operação</button>
              <button class="btn-confirm-delete" @click="handleDelete">Confirmar Eliminação</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast" :class="['toast', toast.type]">
        <component :is="toast.type === 'success' ? CheckCircle2 : XCircle" :size="20" />
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.policies-view { display: flex; flex-direction: column; gap: 16px; }

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-icon {
  width: 52px;
  height: 52px;
  background: var(--bg-app);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.text-accent { color: var(--accent-green); }

.page-title    { font-size: 1.5rem; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
.page-subtitle { font-size: 0.88rem; color: var(--text-muted); }

.header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.view-toggle { display: flex; background: #f3f4f6; border-radius: 10px; padding: 3px; gap: 2px; }
.vt-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  font-size: 0.8rem; font-weight: 600;
  color: var(--text-muted); cursor: pointer;
  transition: all 0.15s;
}
.vt-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 4px rgba(0,0,0,0.08); }

.btn-new {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-sidebar);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-new:hover { background: #2c6c58; transform: translateY(-1px); }

.btn-alt {
  background: white;
  color: var(--bg-sidebar);
  border: 1.5px solid var(--bg-sidebar);
}
.btn-alt:hover {
  background: #f0fdf4;
}

/* Delete Confirm */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(4px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.confirm-box {
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.confirm-icon { margin: 0 auto 16px; }
.text-red { color: #ef4444; }

.confirm-box h3 { font-size: 1.2rem; margin-bottom: 10px; }
.confirm-box p  { color: var(--text-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 28px; }

.confirm-actions { display: flex; gap: 12px; justify-content: center; }

.btn-cancel {
  padding: 10px 24px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-confirm-delete {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: white;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-confirm-delete:hover { background: #dc2626; }

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2000;
  padding: 14px 22px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 10px;
}
.toast.success { background: var(--bg-sidebar); }
.toast.error   { background: #ef4444; }

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from,   .modal-leave-to    { opacity: 0; }

.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from { opacity: 0; transform: translateY(12px); }
.toast-leave-to   { opacity: 0; transform: translateY(12px); }
</style>

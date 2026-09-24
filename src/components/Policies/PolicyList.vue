<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Policy } from '../../lib/policies'
import PolicyBadge from './PolicyBadge.vue'
import { Search, Eye, Edit2, Trash2, FileText, LayoutList } from 'lucide-vue-next'

const props = defineProps<{
  policies: Policy[]
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'view', policy: Policy): void
  (e: 'edit', policy: Policy): void
  (e: 'delete', policy: Policy): void
}>()

const searchQuery = ref('')
const filterTipo = ref('')
const filterCategory = ref('')
const filterStatus = ref('')

const TIPOS = ['', 'Política', 'Estratégia', 'Plano Nacional de Investimento (PNISA)',
  'Plano Estratégico (PEDSA)', 'Plano Operacional (PODA)',
  'Plano de Gestão Ambiental e Social (PGAS)', 'Programa Nacional', 'Projecto', 'Outro']
const CATEGORIES = ['', 'Segurança Alimentar', 'Irrigação', 'Sementes', 'Fertilizantes',
  'Pecuária', 'Sanidade Vegetal', 'Sanidade Animal', 'Mecanização Agrária',
  'Ambiente', 'Desenvolvimento Rural', 'Extensão Rural', 'Recursos Hídricos', 'Outro']
const STATUSES = ['', 'Ativa', 'Inativa', 'Em Revisão']

const filtered = computed(() => {
  return props.policies.filter(p => {
    const matchSearch = !searchQuery.value ||
      p.titulo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.responsavel.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.descricao.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchTipo = !filterTipo.value || p.tipo === filterTipo.value
    const matchCat = !filterCategory.value || p.categoria === filterCategory.value
    const matchStatus = !filterStatus.value || p.status === filterStatus.value
    return matchSearch && matchTipo && matchCat && matchStatus
  })
})

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="policy-list-wrap">
    <!-- Toolbar -->
    <div class="toolbar card">
      <div class="search-box">
        <Search :size="18" class="text-muted" />
        <input v-model="searchQuery" type="text" placeholder="Pesquisar documentos por título, entidade ou descrição..." />
      </div>
      <div class="filters">
        <select v-model="filterTipo">
          <option v-for="t in TIPOS" :key="t" :value="t">{{ t || 'Todos os Tipos' }}</option>
        </select>
        <select v-model="filterCategory">
          <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c || 'Todas Categorias' }}</option>
        </select>
        <select v-model="filterStatus">
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s || 'Todos Status' }}</option>
        </select>
      </div>
    </div>

    <!-- Summary -->
    <p class="results-info">
      {{ filtered.length }} instrumento{{ filtered.length !== 1 ? 's' : '' }} identificado{{ filtered.length !== 1 ? 's' : '' }}
    </p>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>A carregar instrumentos normativos...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="state-box">
      <LayoutList :size="48" class="empty-icon" />
      <h3>Nenhum instrumento identificado</h3>
      <p>Refine os critérios de pesquisa ou proceda ao registo de um novo documento.</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container card">
      <table>
        <thead>
          <tr>
            <th>Instrumento Normativo</th>
            <th>Tipologia</th>
            <th>Domínio Temático</th>
            <th>Estado de Vigência</th>
            <th>Entidade Responsável</th>
            <th>Período de Vigência</th>
            <th>Operações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="policy in filtered"
            :key="policy.id"
            class="table-row"
            @click="emit('view', policy)"
          >
            <td class="title-cell">
              <div class="flex items-start gap-3">
                <FileText :size="18" class="doc-icon" />
                <div>
                  <span class="policy-title">{{ policy.titulo }}</span>
                  <span v-if="policy.descricao" class="policy-desc">{{ policy.descricao.substring(0, 60) }}{{ policy.descricao.length > 60 ? '...' : '' }}</span>
                </div>
              </div>
            </td>
            <td><span class="type-text">{{ policy.tipo }}</span></td>
            <td><PolicyBadge :value="policy.categoria" type="category" /></td>
            <td><PolicyBadge :value="policy.status" type="status" /></td>
            <td class="muted">{{ policy.responsavel || '—' }}</td>
            <td class="muted small">
              {{ formatDate(policy.data_inicio) }}
              <template v-if="policy.data_fim"><br />→ {{ formatDate(policy.data_fim) }}</template>
            </td>
            <td @click.stop>
              <div class="row-actions">
                <button class="action-btn view"   @click="emit('view', policy)"   title="Consultar ficha do instrumento"><Eye :size="16" /></button>
                <button class="action-btn edit"   @click="emit('edit', policy)"   title="Actualizar registo"><Edit2 :size="16" /></button>
                <button class="action-btn delete" @click="emit('delete', policy)" title="Eliminar do sistema"><Trash2 :size="16" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.flex { display: flex; }
.items-start { align-items: flex-start; }
.gap-3 { gap: 12px; }
.text-muted { color: #9ca3af; }

.policy-list-wrap { display: flex; flex-direction: column; gap: 14px; }

/* Toolbar — mobile: stacks vertically */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: stretch;
}
@media (min-width: 768px) {
  .toolbar { flex-direction: row; align-items: center; gap: 14px; }
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-app);
  border-radius: 12px;
  padding: 10px 16px;
  flex: 1;
  min-width: 200px;
}

.search-box input {
  border: none;
  background: transparent;
  outline: none;
  font-family: inherit;
  font-size: 0.9rem;
  width: 100%;
}

.filters {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
  flex-shrink: 0;
}
@media (min-width: 768px) { .filters { overflow-x: visible; gap: 10px; } }

.filters select {
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.83rem;
  outline: none;
  cursor: pointer;
  background: white;
  transition: border-color 0.2s;
  min-width: 130px;
  white-space: nowrap;
}
.filters select:focus { border-color: var(--accent-green); }

.results-info { font-size: 0.82rem; color: var(--text-muted); padding: 0 2px; }

/* State boxes */
.state-box {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  color: var(--text-muted);
}
.state-box h3 { margin: 12px 0 6px; font-size: 1.1rem; color: var(--text-main); }
.state-box p  { font-size: 0.9rem; }
.empty-icon   { color: #d1d5db; margin: 0 auto; }

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--accent-light-green);
  border-top-color: var(--accent-green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Table — horizontal scroll on small screens */
.table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
}
/* Minimum width so table doesn't collapse */
table { width: 100%; min-width: 640px; border-collapse: collapse; }

thead th {
  padding: 14px 20px;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  font-weight: 700;
  text-align: left;
  background: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
}

.table-row {
  cursor: pointer;
  transition: background 0.15s;
}
.table-row:hover { background: #f9fafb; }
.table-row:not(:last-child) { border-bottom: 1px solid #f7f7f7; }

td {
  padding: 14px 20px;
  vertical-align: middle;
}

.title-cell { max-width: 300px; }
.doc-icon { color: var(--accent-green); flex-shrink: 0; margin-top: 2px; }
.policy-title { display: block; font-weight: 600; font-size: 0.9rem; color: var(--text-main); line-height: 1.3; }
.policy-desc  { display: block; font-size: 0.78rem; color: var(--text-muted); margin-top: 3px; line-height: 1.4; }

.type-text { font-size: 0.85rem; font-weight: 600; color: #4b5563; }
.muted { color: var(--text-muted); font-size: 0.85rem; }
.small { font-size: 0.8rem; }

/* Row actions */
.row-actions { display: flex; gap: 6px; }

.action-btn {
  width: 36px; height: 36px;
  border: none; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
  /* Proper touch target on mobile */
  min-height: 36px; min-width: 36px;
}
.action-btn.view   { background: #f0fdf4; color: #16a34a; }
.action-btn.view:hover   { background: #dcfce7; }
.action-btn.edit   { background: #eff6ff; color: #2563eb; }
.action-btn.edit:hover   { background: #dbeafe; }
.action-btn.delete { background: #fff1f2; color: #e11d48; }
.action-btn.delete:hover { background: #fee2e2; }
</style>

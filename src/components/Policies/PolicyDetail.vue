<script setup lang="ts">
import type { Policy, PolicyAnexo } from '../../lib/policies'
import PolicyBadge from './PolicyBadge.vue'
import {
  X, Trash2, Pencil, Calendar, Clock, Link as LinkIcon, User,
  AlignLeft, Target, MapPin, Users, Paperclip, CheckCircle
} from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  policy: Policy | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })
}

const parceiros = computed(() =>
  (props.policy?.parceiros || '').split(',').filter(Boolean)
)
const provincias = computed(() =>
  (props.policy?.provincias || '').split(',').filter(Boolean)
)
const anexos = computed<PolicyAnexo[]>(() => {
  try { return JSON.parse(props.policy?.anexos || '[]') } catch { return [] }
})

function monitoriaClass(estado: string) {
  const map: Record<string, string> = {
    'Em Curso': 'badge-blue',
    'Concluído': 'badge-green',
    'Atrasado': 'badge-red',
    'Suspenso': 'badge-yellow',
    'Não Iniciado': 'badge-gray',
  }
  return map[estado] || 'badge-gray'
}
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="visible && policy" class="drawer-overlay" @click.self="emit('close')">
        <aside class="drawer">
          <!-- Header -->
          <div class="drawer-header">
            <div class="header-badges">
              <PolicyBadge :value="policy.tipo" type="category" />
              <PolicyBadge :value="policy.categoria" type="category" />
              <PolicyBadge :value="policy.status" type="status" />
            </div>
            <button class="close-btn" @click="emit('close')"><X :size="20" /></button>
          </div>

          <div class="drawer-body">
            <h1 class="title">{{ policy.titulo }}</h1>

            <!-- Progress bar de implementação -->
            <div v-if="policy.implementacao_pct !== undefined" class="impl-section">
              <div class="impl-header">
                <span class="impl-label">Implementação</span>
                <span class="impl-pct">{{ policy.implementacao_pct }}%</span>
              </div>
              <div class="impl-bar-bg">
                <div class="impl-bar-fill" :style="{ width: policy.implementacao_pct + '%' }"></div>
              </div>
              <div class="monitoria-row" v-if="policy.estado_monitoria">
                <span :class="['badge-monitoria', monitoriaClass(policy.estado_monitoria)]">
                  {{ policy.estado_monitoria }}
                </span>
              </div>
            </div>

            <!-- Meta info -->
            <div class="meta-grid">
              <div class="meta-item">
                <span class="meta-label"><User :size="13" /> Responsável</span>
                <span class="meta-value">{{ policy.responsavel || '—' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><Calendar :size="13" /> Período de Vigência</span>
                <span class="meta-value">{{ formatDate(policy.data_inicio) }} → {{ formatDate(policy.data_fim) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><MapPin :size="13" /> Âmbito</span>
                <span class="meta-value">
                  {{ policy.ambito || 'Nacional' }}
                  <template v-if="provincias.length > 0"> — {{ provincias.join(', ') }}</template>
                </span>
              </div>
              <div class="meta-item" v-if="policy.ultima_revisao">
                <span class="meta-label"><Clock :size="13" /> Última Revisão</span>
                <span class="meta-value">{{ formatDate(policy.ultima_revisao) }}</span>
              </div>
              <div class="meta-item" v-if="policy.proxima_revisao">
                <span class="meta-label"><Clock :size="13" /> Próxima Revisão</span>
                <span class="meta-value">{{ formatDate(policy.proxima_revisao) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label"><Clock :size="13" /> Criado em</span>
                <span class="meta-value">{{ formatDate(policy.created_at) }}</span>
              </div>
            </div>

            <hr class="divider" />

            <!-- Descrição -->
            <section v-if="policy.descricao">
              <h3 class="section-title"><AlignLeft :size="15" /> Descrição</h3>
              <p class="section-body">{{ policy.descricao }}</p>
            </section>

            <!-- Metas -->
            <section v-if="policy.metas" class="mt-20">
              <h3 class="section-title"><Target :size="15" /> Metas e Indicadores</h3>
              <ul class="metas-list">
                <li v-for="(meta, i) in policy.metas.split('|').map(m => m.trim()).filter(Boolean)" :key="i">
                  <CheckCircle :size="14" class="check-icon" /> {{ meta }}
                </li>
              </ul>
            </section>

            <!-- Parceiros -->
            <section v-if="parceiros.length > 0" class="mt-20">
              <h3 class="section-title"><Users :size="15" /> Entidades Parceiras</h3>
              <div class="tags-row">
                <span v-for="p in parceiros" :key="p" class="tag">{{ p }}</span>
              </div>
            </section>

            <!-- Documento Principal -->
            <section v-if="policy.documento_url" class="mt-20">
              <h3 class="section-title"><LinkIcon :size="15" /> Documento Principal</h3>
              <a :href="policy.documento_url" target="_blank" rel="noopener noreferrer" class="doc-link">
                <LinkIcon :size="16" /> Abrir / Descarregar Documento
              </a>
            </section>

            <!-- Anexos -->
            <section v-if="anexos.length > 0" class="mt-20">
              <h3 class="section-title"><Paperclip :size="15" /> Documentos Anexos ({{ anexos.length }})</h3>
              <div class="anexos-list">
                <a v-for="(a, i) in anexos" :key="i" :href="a.url" :download="a.nome" class="anexo-item">
                  <Paperclip :size="15" />
                  <span>{{ a.nome }}</span>
                </a>
              </div>
            </section>
          </div>

          <!-- Footer -->
          <div class="drawer-footer">
            <button class="btn-delete" @click="emit('delete')">
              <Trash2 :size="16" /> Eliminar
            </button>
            <button class="btn-edit" @click="emit('edit')">
              <Pencil :size="16" /> Editar
            </button>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.3); backdrop-filter: blur(3px);
  z-index: 999; display: flex; justify-content: flex-end;
}

.drawer {
  width: 700px; max-width: 95vw; background: white;
  height: 100%; display: flex; flex-direction: column;
  box-shadow: -10px 0 40px rgba(0,0,0,0.15);
}

.drawer-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px; border-bottom: 1px solid #f0f0f0; gap: 10px;
}
.header-badges { display: flex; gap: 8px; flex-wrap: wrap; }

.close-btn {
  background: #f3f4f6; border: none; width: 32px; height: 32px; border-radius: 50%;
  cursor: pointer; color: #555; display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; transition: background 0.2s;
}
.close-btn:hover { background: #e5e7eb; }

.drawer-body { flex: 1; overflow-y: auto; padding: 24px; }

.title {
  font-size: 1.3rem; font-weight: 700; color: var(--text-main);
  line-height: 1.4; margin-bottom: 20px;
}

/* Implementation progress */
.impl-section {
  background: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 20px;
}
.impl-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.impl-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.impl-pct { font-size: 1rem; font-weight: 700; color: var(--accent-green); }
.impl-bar-bg { height: 8px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.impl-bar-fill { height: 100%; background: var(--accent-green); border-radius: 10px; transition: width 0.5s; }

.monitoria-row { margin-top: 10px; }
.badge-monitoria {
  display: inline-block; padding: 4px 12px; border-radius: 20px;
  font-size: 0.78rem; font-weight: 700;
}
.badge-blue   { background: #dbeafe; color: #2563eb; }
.badge-green  { background: #dcfce7; color: #16a34a; }
.badge-red    { background: #fee2e2; color: #dc2626; }
.badge-yellow { background: #fef9c3; color: #ca8a04; }
.badge-gray   { background: #f3f4f6; color: #6b7280; }

/* Meta grid */
.meta-grid {
  display: flex; flex-direction: column; gap: 10px;
  background: #f9fafb; border-radius: 12px; padding: 16px;
}
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 0.74rem; color: var(--text-muted); font-weight: 600;
}
.meta-value { font-size: 0.9rem; color: var(--text-main); font-weight: 500; }

.divider { border: none; border-top: 1px solid #f0f0f0; margin: 20px 0; }

.section-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.82rem; font-weight: 700; color: #555; margin-bottom: 10px;
  text-transform: uppercase; letter-spacing: 0.5px;
}

.section-body { font-size: 0.95rem; color: #444; line-height: 1.7; }

.metas-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.metas-list li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.9rem; color: #444; line-height: 1.5; }
.check-icon { color: var(--accent-green); flex-shrink: 0; margin-top: 3px; }

.tags-row { display: flex; flex-wrap: wrap; gap: 8px; }
.tag {
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d;
  padding: 4px 12px; border-radius: 20px; font-size: 0.82rem; font-weight: 600;
}

.doc-link {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--bg-app); color: var(--bg-sidebar);
  padding: 10px 18px; border-radius: 10px; font-weight: 600;
  font-size: 0.9rem; text-decoration: none; transition: background 0.2s;
}
.doc-link:hover { background: var(--accent-light-green); }

.anexos-list { display: flex; flex-direction: column; gap: 8px; }
.anexo-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px;
  font-size: 0.88rem; color: var(--text-main); text-decoration: none;
  background: #f9fafb; transition: background 0.15s;
}
.anexo-item:hover { background: #f0fdf4; }

.mt-20 { margin-top: 20px; }

.drawer-footer {
  padding: 16px 24px; border-top: 1px solid #f0f0f0;
  display: flex; justify-content: flex-end; gap: 12px;
}

.btn-delete {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 20px; border-radius: 10px;
  border: 1.5px solid #fee2e2; background: white; color: #ef4444;
  font-family: inherit; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: background 0.2s;
}
.btn-delete:hover { background: #fee2e2; }

.btn-edit {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 24px; border-radius: 10px; border: none;
  background: var(--bg-sidebar); color: white;
  font-family: inherit; font-weight: 600; font-size: 0.88rem; cursor: pointer; transition: background 0.2s;
}
.btn-edit:hover { background: #2c6c58; }

/* Drawer transition */
.drawer-enter-active, .drawer-leave-active { transition: transform 0.28s ease; }
.drawer-enter-from, .drawer-leave-to { transform: translateX(100%); }
</style>

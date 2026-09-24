<script setup lang="ts">
import { computed } from 'vue'
import { Activity, Clock, PieChart, AlertTriangle, TrendingUp } from 'lucide-vue-next'
import type { Policy } from '../../lib/policies'

const props = defineProps<{
  policies: Policy[]
}>()

const activeCount = computed(() => props.policies.filter(p => p.status === 'Ativa').length)
const reviewCount = computed(() => props.policies.filter(p => p.status === 'Em Revisão').length)

const topCategory = computed(() => {
  if (props.policies.length === 0) return '—'
  const counts = props.policies.reduce((acc, p) => {
    if (p.categoria) {
      acc[p.categoria] = (acc[p.categoria] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  if (Object.keys(counts).length === 0) return '—'
  
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0][0]
})

const expiredOrExpiringCount = computed(() => {
  if (props.policies.length === 0) return 0
  const now = new Date()
  let count = 0
  props.policies.forEach(p => {
    if (p.data_fim) {
      const fim = new Date(p.data_fim)
      const diffTime = fim.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays <= 90) {
        count++
      }
    }
  })
  return count
})

const avgImplementacao = computed(() => {
  if (props.policies.length === 0) return 0
  const sum = props.policies.reduce((acc, p) => acc + (p.implementacao_pct || 0), 0)
  return Math.round(sum / props.policies.length)
})
</script>

<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon bg-green"><Activity :size="24" /></div>
      <div class="stat-content">
        <span class="stat-label">Instrumentos em Vigor</span>
        <span class="stat-value">{{ activeCount }}</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon bg-blue"><Clock :size="24" /></div>
      <div class="stat-content">
        <span class="stat-label">Em Processo de Revisão</span>
        <span class="stat-value">{{ reviewCount }}</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon bg-purple"><PieChart :size="24" /></div>
      <div class="stat-content">
        <span class="stat-label">Domínio Prioritário</span>
        <span class="stat-value text-md">{{ topCategory }}</span>
      </div>
    </div>
    
    <div class="stat-card">
      <div class="stat-icon bg-red"><AlertTriangle :size="24" /></div>
      <div class="stat-content">
        <span class="stat-label">Cessão de Vigência (&lt; 90 dias)</span>
        <span class="stat-value">{{ expiredOrExpiringCount }}</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon bg-teal"><TrendingUp :size="24" /></div>
      <div class="stat-content">
        <span class="stat-label">Grau Médio de Execução</span>
        <div class="mini-bar-wrap">
          <div class="mini-bar-bg">
            <div class="mini-bar-fill" :style="{ width: avgImplementacao + '%' }"></div>
          </div>
          <span class="stat-value mini-pct">{{ avgImplementacao }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
  border: 1px solid #f0f0f0;
}

.stat-icon {
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bg-green { background: #dcfce7; color: #16a34a; }
.bg-blue   { background: #dbeafe; color: #2563eb; }
.bg-purple { background: #f3e8ff; color: #9333ea; }
.bg-red    { background: #fee2e2; color: #dc2626; }
.bg-teal   { background: #ccfbf1; color: #0d9488; }

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.2;
}

.text-md { font-size: 1.1rem; }

.mini-bar-wrap { display: flex; align-items: center; gap: 10px; }
.mini-bar-bg { flex: 1; height: 8px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
.mini-bar-fill { height: 100%; background: #0d9488; border-radius: 10px; transition: width 0.4s; }
.mini-pct { font-size: 1.2rem; font-weight: 700; color: #0d9488; min-width: 44px; }
</style>

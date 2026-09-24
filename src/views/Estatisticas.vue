<script setup lang="ts">
import { TrendingUp, BarChart2, Wheat, Droplets, Tractor, Leaf } from 'lucide-vue-next'
</script>

<template>
  <div class="stats-view">
    <!-- Header -->
    <div class="page-header card">
      <div class="page-title-section">
        <div class="page-icon"><BarChart2 :size="24" /></div>
        <div>
          <h1 class="page-title">Estatísticas Agrárias</h1>
          <p class="page-subtitle">Indicadores de produção, campanhas agrícolas e desempenho sectorial</p>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-icon bg-green"><Wheat :size="26" /></div>
        <div class="kpi-body">
          <span class="kpi-label">Produção Cereais (ton)</span>
          <span class="kpi-value">—</span>
          <span class="kpi-sub">Campanha 2023/24</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon bg-blue"><Droplets :size="26" /></div>
        <div class="kpi-body">
          <span class="kpi-label">Área Irrigada (ha)</span>
          <span class="kpi-value">—</span>
          <span class="kpi-sub">Total nacional</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon bg-amber"><Tractor :size="26" /></div>
        <div class="kpi-body">
          <span class="kpi-label">Tractores Activos</span>
          <span class="kpi-value">—</span>
          <span class="kpi-sub">Mecanização agrária</span>
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon bg-teal"><Leaf :size="26" /></div>
        <div class="kpi-body">
          <span class="kpi-label">Agricultores Assistidos</span>
          <span class="kpi-value">—</span>
          <span class="kpi-sub">Extensão rural</span>
        </div>
      </div>
    </div>

    <!-- Placeholder chart area -->
    <div class="charts-placeholder card">
      <div class="placeholder-inner">
        <TrendingUp :size="48" class="ph-icon" />
        <h3>Módulo de Estatísticas em Desenvolvimento</h3>
        <p>Este módulo irá concentrar dados de produção agrícola por campanha, região e cultura. Os dados serão integrados com os sistemas MINAG e o TIA (Trabalho de Inquérito Agrícola).</p>
        <div class="tags">
          <span class="tag">Campanha Agrícola</span>
          <span class="tag">Produção por Cultura</span>
          <span class="tag">Área Cultivada por Província</span>
          <span class="tag">Preços de Mercado</span>
          <span class="tag">Indicadores de Segurança Alimentar</span>
          <span class="tag">Exportações Agrárias</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-view { display: flex; flex-direction: column; gap: 20px; }

.page-header.card {
  display: flex; justify-content: space-between; align-items: center; padding: 20px 24px;
}
.page-title-section { display: flex; align-items: center; gap: 16px; }
.page-icon {
  width: 48px; height: 48px; border-radius: 14px; background: #dbeafe; color: #2563eb;
  display: flex; align-items: center; justify-content: center;
}
.page-title { font-size: 1.4rem; font-weight: 700; color: var(--text-main); margin: 0 0 4px; }
.page-subtitle { font-size: 0.85rem; color: var(--text-muted); margin: 0; }

.kpi-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
}
.kpi-card {
  background: white; border-radius: 16px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f0f0f0;
}
.kpi-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.bg-green { background: #dcfce7; color: #16a34a; }
.bg-blue  { background: #dbeafe; color: #2563eb; }
.bg-amber { background: #fef3c7; color: #d97706; }
.bg-teal  { background: #ccfbf1; color: #0d9488; }

.kpi-body { display: flex; flex-direction: column; gap: 3px; }
.kpi-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
.kpi-value { font-size: 1.7rem; font-weight: 700; color: var(--text-main); }
.kpi-sub   { font-size: 0.78rem; color: var(--text-muted); }

.charts-placeholder.card {
  background: white; border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.03);
}
.placeholder-inner {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; padding: 60px 40px; gap: 16px;
}
.ph-icon { color: #d1d5db; }
.placeholder-inner h3 { font-size: 1.15rem; color: var(--text-main); margin: 0; }
.placeholder-inner p { font-size: 0.9rem; color: var(--text-muted); max-width: 520px; line-height: 1.7; margin: 0; }
.tags { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
.tag {
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d;
  padding: 5px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 600;
}
</style>

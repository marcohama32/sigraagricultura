<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAllPolicies } from '../lib/policies'
import type { Policy } from '../lib/policies'
import {
  TrendingUp, TrendingDown, FileText,
  Bell, Calendar, Activity, Droplets, Wheat,
  Tractor, Users, ArrowUpRight, Minus, MapPin
} from 'lucide-vue-next'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
)

// ── Real data ──────────────────────────────────────────────
const policies = ref<Policy[]>([])
onMounted(async () => {
  try {
    const { initDb } = await import('../lib/db')
    await initDb()
    policies.value = await getAllPolicies()
  } catch {}
})

const totalAtivos  = computed(() => policies.value.filter(p => p.status === 'Ativa').length)
const avgExecucao  = computed(() => {
  if (!policies.value.length) return 67
  return Math.round(policies.value.reduce((a, p) => a + (p.implementacao_pct || 0), 0) / policies.value.length)
})

// ── Demo data ───────────────────────────────────────────────
const hoje = computed(() => new Date().toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))

const campanhas        = ['2019/20', '2020/21', '2021/22', '2022/23', '2023/24', '2024/25*']
const producaoCereais  = [2840, 3012, 2750, 3280, 3650, 3920]
const producaoLegumes  = [1420, 1580, 1390, 1720, 1950, 2100]
const producaoCassava  = [4200, 4550, 4100, 4800, 5200, 5600]
const areaIrrigada     = [118, 134, 128, 156, 178, 195]

const anosForecast = ['2022','2023','2024','2025','2026','2027','2028','2029','2030']
const realExecucao  = [28, 42, 57, null, null, null, null, null, null]
const prevExecucao  = [28, 42, 57, 68, 76, 83, 89, 94, 100]
const metaExecucao  = [30, 50, 65, 75, 82, 88, 93, 97, 100]

const sectores      = ['Segurança Alimentar','Irrigação','Sementes','Pecuária','Mecanização','Ambiente','Outros']
const sectoresCounts = [8, 5, 4, 3, 3, 4, 2]

const provinciaData: Record<string, { index: number; producao: string; irrigada: string; tendencia: 'up' | 'down' | 'flat' }> = {
  'Niassa':        { index: 42, producao: '312 mil ton', irrigada: '8.200 ha',  tendencia: 'up' },
  'Cabo Delgado':  { index: 38, producao: '289 mil ton', irrigada: '6.100 ha',  tendencia: 'down' },
  'Nampula':       { index: 78, producao: '820 mil ton', irrigada: '18.400 ha', tendencia: 'up' },
  'Zambézia':      { index: 82, producao: '940 mil ton', irrigada: '22.100 ha', tendencia: 'up' },
  'Tete':          { index: 61, producao: '520 mil ton', irrigada: '14.200 ha', tendencia: 'up' },
  'Manica':        { index: 55, producao: '460 mil ton', irrigada: '11.800 ha', tendencia: 'flat' },
  'Sofala':        { index: 67, producao: '580 mil ton', irrigada: '16.500 ha', tendencia: 'up' },
  'Inhambane':     { index: 48, producao: '390 mil ton', irrigada: '9.600 ha',  tendencia: 'flat' },
  'Gaza':          { index: 53, producao: '420 mil ton', irrigada: '12.800 ha', tendencia: 'up' },
  'Maputo Prov.':  { index: 44, producao: '310 mil ton', irrigada: '7.900 ha',  tendencia: 'up' },
  'Cidade Maputo': { index: 15, producao: '42 mil ton',  irrigada: '1.200 ha',  tendencia: 'flat' },
}
const selectedProv = ref('Zambézia')

const kpiCards = computed(() => [
  { label: 'Produção Cereal 2023/24', value: '3,65 M ton',  delta: '+11,3%',    up: true, icon: Wheat,    color: 'green'  },
  { label: 'Área Irrigada Total',     value: '178 mil ha',  delta: '+14,1%',    up: true, icon: Droplets, color: 'blue'   },
  { label: 'Tractores Operacionais',  value: '4.820',       delta: '+8,4%',     up: true, icon: Tractor,  color: 'amber'  },
  { label: 'Agricultores Assistidos', value: '2,4 M',       delta: '+19,2%',    up: true, icon: Users,    color: 'purple' },
  { label: 'Inst. Activos',           value: String(Math.max(totalAtivos.value, 12)), delta: 'Em vigor', up: true, icon: FileText, color: 'teal' },
  { label: 'Taxa de Execução',        value: avgExecucao.value + '%', delta: 'Média geral', up: true, icon: Activity, color: 'green' },
])

// ── Chart configs ───────────────────────────────────────────
const barProducaoData = computed(() => ({
  labels: campanhas,
  datasets: [
    { label: 'Cereais (mil ton)',  data: producaoCereais, backgroundColor: 'rgba(22,163,74,0.85)',  borderRadius: 5 },
    { label: 'Legumes (mil ton)',  data: producaoLegumes, backgroundColor: 'rgba(234,179,8,0.85)', borderRadius: 5 },
    { label: 'Mandioca (mil ton)', data: producaoCassava, backgroundColor: 'rgba(37,99,235,0.85)',  borderRadius: 5 },
  ]
}))

const barProducaoOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { font: { size: 10 }, padding: 12 } },
    tooltip: { mode: 'index' as const }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } }, title: { display: true, text: 'Mil toneladas', font: { size: 10 } } }
  }
}

const lineForecastData = computed(() => ({
  labels: anosForecast,
  datasets: [
    { label: 'Execução Real (%)',  data: realExecucao, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.1)', tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#16a34a' },
    { label: 'Previsão SiGRA (%)', data: prevExecucao, borderColor: '#2563eb', borderDash: [6,3], backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#2563eb' },
    { label: 'Meta PNISA (%)',     data: metaExecucao, borderColor: '#dc2626', borderDash: [3,3], backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, pointBackgroundColor: '#dc2626' },
  ]
}))

const lineForecastOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { font: { size: 10 }, padding: 12 } },
    tooltip: { mode: 'index' as const }
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { min: 0, max: 100, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 }, callback: (v: any) => v + '%' } }
  }
}

const donutSectorData = computed(() => ({
  labels: sectores,
  datasets: [{
    data: sectoresCounts,
    backgroundColor: ['#16a34a','#2563eb','#d97706','#9333ea','#0d9488','#dc2626','#6b7280'],
    borderWidth: 2, borderColor: '#fff',
  }]
}))

const donutSectorOptions = {
  responsive: true, maintainAspectRatio: false,
  cutout: '65%',
  plugins: {
    legend: { display: false },  /* legend handled by HTML below */
    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}` } }
  }
}

const lineIrrigacaoData = computed(() => ({
  labels: campanhas,
  datasets: [{
    label: 'Área Irrigada (mil ha)',
    data: areaIrrigada,
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37,99,235,0.1)',
    tension: 0.4, fill: true, pointRadius: 4,
    pointBackgroundColor: '#2563eb',
  }]
}))

const lineIrrigacaoOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } }, title: { display: true, text: 'Mil ha', font: { size: 10 } } }
  }
}

// ── Helpers ─────────────────────────────────────────────────
function getProvColor(index: number) {
  if (index >= 75) return '#16a34a'
  if (index >= 55) return '#84cc16'
  if (index >= 40) return '#eab308'
  return '#ef4444'
}

const alertasAtivos = [
  { titulo: 'PEDSA 2020-2029',                    tipo: 'Urgente',  msg: 'Taxa de execução abaixo de 40% — muito abaixo da meta', color: 'red' },
  { titulo: 'Estratégia Nacional de Irrigação',   tipo: 'Atenção',  msg: 'Vigência cessa em 68 dias — iniciar processo de renovação', color: 'amber' },
  { titulo: 'Política de Mecanização Agrária',    tipo: 'Atenção',  msg: 'Última avaliação há mais de 18 meses — revisão pendente', color: 'amber' },
  { titulo: 'Programa Nacional de Sementes',       tipo: 'Info',     msg: 'Próxima avaliação intercalar agendada para Novembro 2024', color: 'blue' },
]
</script>

<template>
  <div class="executive-dashboard">

    <!-- ══ BANNER ══════════════════════════════════════════════ -->
    <div class="banner">
      <div class="banner-logo">
        <div class="logo-mark"></div>
        <div class="banner-text">
          <div class="banner-tag">REPÚBLICA DE MOÇAMBIQUE</div>
          <h1 class="banner-title">Ministério da Agricultura, Ambiente e Pescas</h1>
          <div class="banner-sub">SiGRA · Painel Executivo do Ministro</div>
        </div>
      </div>
      <div class="banner-right">
        <div class="banner-date">
          <Calendar :size="14" />
          <span>{{ hoje }}</span>
        </div>
        <div class="banner-pills">
          <span class="pill-green">● Sistema Operacional</span>
          <span class="pill-white">Campanha 2024/25 em curso</span>
        </div>
      </div>
    </div>

    <!-- ══ KPI ROW ══════════════════════════════════════════════ -->
    <div class="kpi-row">
      <div v-for="(k, i) in kpiCards" :key="i" class="kpi-card" :class="'kpi-' + k.color">
        <div class="kpi-icon-box">
          <component :is="k.icon" :size="18" />
        </div>
        <div class="kpi-info">
          <div class="kpi-label">{{ k.label }}</div>
          <div class="kpi-value">{{ k.value }}</div>
          <div class="kpi-delta" :class="k.up ? 'delta-up' : 'delta-down'">
            <ArrowUpRight :size="12" />{{ k.delta }}
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ROW 1: Produção + Área Irrigada ════════════════════ -->
    <div class="chart-row row1">
      <!-- Produção por Campanha -->
      <div class="chart-card card">
        <div class="chart-header">
          <div>
            <h3>Produção Agrícola por Campanha</h3>
            <p>Comparativo 2019/20 – 2024/25 (projecção) · Toneladas ×1000</p>
          </div>
          <div class="chart-tags">
            <span class="ctag green">▲ 11,3% Cereais</span>
            <span class="ctag blue">Dados TIA/MADER</span>
          </div>
        </div>
        <div class="chart-body">
          <Bar :data="barProducaoData" :options="barProducaoOptions" />
        </div>
      </div>

      <!-- Área Irrigada -->
      <div class="chart-card card">
        <div class="chart-header">
          <div>
            <h3>Área Irrigada Nacional</h3>
            <p>Evolução em mil hectares</p>
          </div>
          <span class="ctag blue">▲ 195 mil ha</span>
        </div>
        <div class="chart-body">
          <Line :data="lineIrrigacaoData" :options="lineIrrigacaoOptions" />
        </div>
        <div class="mini-kpis">
          <div class="mini-kpi">
            <span class="mk-val teal">195 mil ha</span>
            <span class="mk-label">Meta 2024/25</span>
          </div>
          <div class="mini-kpi">
            <span class="mk-val green">+65%</span>
            <span class="mk-label">vs. 2019/20</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ROW 2: Forecast + Sector ═══════════════════════════ -->
    <div class="chart-row row2">
      <!-- Previsão -->
      <div class="chart-card card">
        <div class="chart-header">
          <div>
            <h3>Previsão de Execução das Políticas 2022–2030</h3>
            <p>Execução real vs. Projecção SiGRA vs. Meta PNISA</p>
          </div>
          <div class="chart-tags">
            <span class="ctag green">Actual: 57%</span>
            <span class="ctag blue">Meta: 100% em 2030</span>
          </div>
        </div>
        <div class="chart-body chart-tall">
          <Line :data="lineForecastData" :options="lineForecastOptions" />
        </div>
        <div class="forecast-insight">
          <TrendingUp :size="15" style="color:#16a34a;flex-shrink:0;margin-top:2px" />
          <span><strong>Análise SiGRA:</strong> Com base na taxa de execução actual (57%), o sistema projecta atingir 100% de implementação em 2030. É necessário acelerar 3 p.p./ano para manter a trajectória.</span>
        </div>
      </div>

      <!-- Sector donut -->
      <div class="chart-card card">
        <div class="chart-header">
          <div>
            <h3>Distribuição por Sector</h3>
            <p>Instrumentos normativos por domínio</p>
          </div>
        </div>
        <div class="donut-wrap">
          <!-- donut-body: canvas only (no legend inside), so inset:0 centers perfectly -->
          <div class="donut-body">
            <Doughnut :data="donutSectorData" :options="donutSectorOptions" />
            <div class="donut-center">
              <span class="dc-val">{{ sectoresCounts.reduce((a,b)=>a+b,0) }}</span>
              <span class="dc-sub">Total</span>
            </div>
          </div>
          <!-- Custom HTML legend: 2-column grid -->
          <div class="donut-legend">
            <div v-for="(s, i) in sectores" :key="s" class="dl-item">
              <span class="dl-dot" :style="{ background: ['#16a34a','#2563eb','#d97706','#9333ea','#0d9488','#dc2626','#6b7280'][i] }"></span>
              <span class="dl-label">{{ s }}</span>
              <span class="dl-val">{{ sectoresCounts[i] }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ROW 3: Province Map + Right Col ════════════════════ -->
    <div class="bottom-row">

      <!-- Province Production Map -->
      <div class="card map-card">
        <div class="chart-header">
          <div>
            <h3>Índice de Produção por Província</h3>
            <p>Seleccione uma província para detalhe</p>
          </div>
          <div class="legend-map">
            <span><span class="dot-leg" style="background:#16a34a"></span>Alta ≥75</span>
            <span><span class="dot-leg" style="background:#84cc16"></span>Média</span>
            <span><span class="dot-leg" style="background:#eab308"></span>Baixa</span>
            <span><span class="dot-leg" style="background:#ef4444"></span>Crítica</span>
          </div>
        </div>

        <!-- Scrollable province bar chart — all 11 in one row -->
        <div class="prov-scroll-wrap">
          <div class="prov-grid">
            <button
              v-for="(data, prov) in provinciaData"
              :key="prov"
              class="prov-btn"
              :class="{ selected: selectedProv === prov }"
              :style="{ '--pc': getProvColor(data.index) }"
              @click="selectedProv = prov"
            >
              <div class="prov-bar" :style="{ height: data.index + '%', background: getProvColor(data.index) }"></div>
              <span class="prov-name">{{ prov }}</span>
              <span class="prov-idx" :style="{ color: getProvColor(data.index) }">{{ data.index }}</span>
            </button>
          </div>
        </div>

        <!-- Province Detail -->
        <div class="prov-detail" v-if="selectedProv">
          <div class="pd-header">
            <MapPin :size="16" style="color:#2563eb;flex-shrink:0" />
            <strong>{{ selectedProv }}</strong>
            <span class="pd-idx" :style="{ background: getProvColor(provinciaData[selectedProv].index) }">
              Índice {{ provinciaData[selectedProv].index }}
            </span>
          </div>
          <div class="pd-stats">
            <div class="pd-stat">
              <Wheat :size="14" style="color:#16a34a;flex-shrink:0" />
              <div>
                <div class="pd-val">{{ provinciaData[selectedProv].producao }}</div>
                <div class="pd-sub">Produção estimada</div>
              </div>
            </div>
            <div class="pd-stat">
              <Droplets :size="14" style="color:#2563eb;flex-shrink:0" />
              <div>
                <div class="pd-val">{{ provinciaData[selectedProv].irrigada }}</div>
                <div class="pd-sub">Área irrigada</div>
              </div>
            </div>
            <div class="pd-stat">
              <component
                :is="provinciaData[selectedProv].tendencia === 'up' ? TrendingUp : provinciaData[selectedProv].tendencia === 'down' ? TrendingDown : Minus"
                :size="14"
                :style="{ color: provinciaData[selectedProv].tendencia === 'up' ? '#16a34a' : provinciaData[selectedProv].tendencia === 'down' ? '#dc2626' : '#6b7280', flexShrink: 0 }"
              />
              <div>
                <div class="pd-val" :style="{ color: provinciaData[selectedProv].tendencia === 'up' ? '#16a34a' : provinciaData[selectedProv].tendencia === 'down' ? '#dc2626' : '#6b7280' }">
                  {{ provinciaData[selectedProv].tendencia === 'up' ? 'Crescimento' : provinciaData[selectedProv].tendencia === 'down' ? 'Declínio' : 'Estável' }}
                </div>
                <div class="pd-sub">Tendência 2023/24</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="right-col">
        <!-- Alertas -->
        <div class="card section-card">
          <div class="section-header">
            <div class="section-title-row">
              <Bell :size="17" style="color:#dc2626" />
              <h3>Alertas Ministeriais</h3>
            </div>
            <span class="alert-count">{{ alertasAtivos.length }}</span>
          </div>
          <div class="alerts-list">
            <div v-for="(a, i) in alertasAtivos" :key="i" class="alert-row" :class="'alert-' + a.color">
              <div class="ar-dot" :class="'dot-' + a.color"></div>
              <div class="ar-body">
                <div class="ar-title">{{ a.titulo }}</div>
                <div class="ar-msg">{{ a.msg }}</div>
              </div>
              <span class="ar-badge" :class="'badge-' + a.color">{{ a.tipo }}</span>
            </div>
          </div>
        </div>

        <!-- Grau de Execução -->
        <div class="card section-card">
          <div class="section-header">
            <div class="section-title-row">
              <Activity :size="17" style="color:#0d9488" />
              <h3>Grau de Execução</h3>
            </div>
          </div>
          <div class="exec-bars">
            <div v-for="item in [
              { name: 'PNISA 2018-2030', pct: 72, color: '#16a34a' },
              { name: 'Seg. Alimentar 2024-30', pct: 15, color: '#d97706' },
              { name: 'PEDSA 2020-2029', pct: 38, color: '#dc2626' },
              { name: 'Estratégia Irrigação', pct: 61, color: '#2563eb' },
              { name: 'Prog. Mecanização', pct: 83, color: '#16a34a' },
            ]" :key="item.name" class="exec-bar-row">
              <div class="eb-label">{{ item.name }}</div>
              <div class="eb-track">
                <div class="eb-fill" :style="{ width: item.pct + '%', background: item.color }"></div>
              </div>
              <span class="eb-pct" :style="{ color: item.color }">{{ item.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.executive-dashboard { display: flex; flex-direction: column; gap: 12px; }

/* ── BANNER ─────────────────────────────────────────────── */
.banner {
  background: linear-gradient(135deg, #0f3d22 0%, #1a5c38 50%, #2d7a50 100%);
  border-radius: 14px; padding: 18px 16px;
  display: flex; flex-direction: column; gap: 12px; color: white;
  overflow: hidden;
}
@media (min-width: 768px) {
  .banner { flex-direction: row; justify-content: space-between; align-items: center; padding: 22px 28px; gap: 16px; }
}
.banner-logo { display: flex; align-items: flex-start; gap: 12px; }
.logo-mark {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.15);
  position: relative;
}
.logo-mark::after { content: 'MZ'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.65rem; font-weight: 900; }
.banner-text { min-width: 0; }
.banner-tag   { font-size: 0.58rem; font-weight: 700; letter-spacing: 1.5px; color: rgba(255,255,255,0.55); text-transform: uppercase; margin-bottom: 4px; }
.banner-title { font-size: 0.9rem; font-weight: 800; margin: 0 0 4px; line-height: 1.3; }
@media (min-width: 640px) { .banner-title { font-size: 1.1rem; } }
.banner-sub   { font-size: 0.7rem; color: rgba(255,255,255,0.65); }
.banner-right { display: flex; flex-direction: row; align-items: center; gap: 10px; flex-wrap: wrap; }
@media (min-width: 768px) { .banner-right { flex-direction: column; align-items: flex-end; gap: 8px; } }
.banner-date  { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: rgba(255,255,255,0.8); text-transform: capitalize; }
.banner-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.pill-green { background: rgba(22,163,74,0.3); border: 1px solid rgba(22,163,74,0.5); color: #86efac; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; white-space: nowrap; }
.pill-white { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; white-space: nowrap; }

/* ── KPI ROW ─────────────────────────────────────────────── */
.kpi-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
@media (min-width: 640px)  { .kpi-row { grid-template-columns: repeat(3, 1fr); gap: 10px; } }
@media (min-width: 1280px) { .kpi-row { grid-template-columns: repeat(6, 1fr); gap: 12px; } }

.kpi-card {
  background: white; border-radius: 12px; padding: 12px 10px;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06); border: 1px solid #f0f0f0;
  transition: transform 0.2s; overflow: hidden; min-width: 0;
}
@media (min-width: 640px)  { .kpi-card { padding: 14px 12px; gap: 10px; border-radius: 14px; } }
@media (min-width: 1280px) { .kpi-card { padding: 16px; gap: 12px; } }
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }

.kpi-icon-box { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
@media (min-width: 640px)  { .kpi-icon-box { width: 40px; height: 40px; border-radius: 11px; } }
@media (min-width: 1280px) { .kpi-icon-box { width: 46px; height: 46px; border-radius: 12px; } }

.kpi-green .kpi-icon-box  { background: #dcfce7; color: #16a34a; }
.kpi-blue  .kpi-icon-box  { background: #dbeafe; color: #2563eb; }
.kpi-amber .kpi-icon-box  { background: #fef3c7; color: #d97706; }
.kpi-purple .kpi-icon-box { background: #f3e8ff; color: #9333ea; }
.kpi-teal  .kpi-icon-box  { background: #ccfbf1; color: #0d9488; }

.kpi-info  { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; overflow: hidden; }
.kpi-label { font-size: 0.57rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted); line-height: 1.3; }
@media (min-width: 640px) { .kpi-label { font-size: 0.63rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } }
.kpi-value { font-size: 1rem; font-weight: 800; color: var(--text-main); line-height: 1.1; white-space: nowrap; }
@media (min-width: 640px)  { .kpi-value { font-size: 1.2rem; } }
@media (min-width: 1280px) { .kpi-value { font-size: 1.4rem; } }
.kpi-delta { display: flex; align-items: center; gap: 2px; font-size: 0.6rem; font-weight: 700; }
.delta-up  { color: #16a34a; }
.delta-down{ color: #dc2626; }

/* ── CHART ROWS ──────────────────────────────────────────── */
.chart-row { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 1024px) {
  .chart-row { gap: 16px; }
  .chart-row.row1 { grid-template-columns: 2fr 1fr; }
  .chart-row.row2 { grid-template-columns: 3fr 1.1fr; }
}

.chart-card { border-radius: 14px; overflow: hidden; }

.chart-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 14px 14px 0; margin-bottom: 10px; gap: 8px; flex-wrap: wrap;
}
@media (min-width: 768px) { .chart-header { padding: 18px 18px 0; } }
.chart-header h3 { font-size: 0.88rem; font-weight: 700; color: var(--text-main); margin: 0 0 3px; }
.chart-header p  { font-size: 0.72rem; color: var(--text-muted); margin: 0; }
.chart-tags { display: flex; gap: 5px; flex-wrap: wrap; }
.ctag { padding: 3px 8px; border-radius: 8px; font-size: 0.68rem; font-weight: 700; white-space: nowrap; }
.ctag.green { background: #dcfce7; color: #16a34a; }
.ctag.blue  { background: #dbeafe; color: #2563eb; }
.ctag.red   { background: #fee2e2; color: #dc2626; }

.chart-body { padding: 0 14px 14px; height: 200px; }
@media (min-width: 768px) { .chart-body { padding: 0 18px 18px; height: 230px; } }
.chart-tall { height: 220px; }
@media (min-width: 768px) { .chart-tall { height: 250px; } }

.mini-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 14px 14px; }
@media (min-width: 768px) { .mini-kpis { padding: 0 18px 18px; } }
.mini-kpi  { background: #f8fafc; border-radius: 9px; padding: 9px; text-align: center; }
.mk-val    { display: block; font-size: 0.95rem; font-weight: 800; }
.mk-val.teal  { color: #0d9488; }
.mk-val.green { color: #16a34a; }
.mk-label  { font-size: 0.68rem; color: var(--text-muted); font-weight: 600; }

.forecast-insight {
  display: flex; align-items: flex-start; gap: 8px;
  margin: 0 14px 14px; padding: 10px 12px;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 9px;
  font-size: 0.75rem; color: var(--text-main); line-height: 1.55;
}
@media (min-width: 768px) { .forecast-insight { margin: 0 18px 18px; } }

/* ── DONUT ───────────────────────────────────────────────── */
.donut-wrap { padding: 0 14px 14px; }
@media (min-width: 768px) { .donut-wrap { padding: 0 18px 18px; } }

/* Canvas-only container — no legend inside → donut fills 100% */
.donut-body {
  position: relative;
  /* Taller now that legend is HTML below */
  height: 180px;
}
@media (min-width: 640px) { .donut-body { height: 200px; } }

/* Inset overlay: always perfectly centered regardless of canvas size */
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  /* Slight nudge: Chart.js adds small internal padding */
  padding-bottom: 4px;
}
.dc-val { font-size: 2rem; font-weight: 800; color: var(--text-main); line-height: 1; }
.dc-sub { font-size: 0.68rem; color: var(--text-muted); font-weight: 600; margin-top: 3px; }

/* Custom HTML legend — 2-column grid */
.donut-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 12px;
  margin-top: 12px;
}
.dl-item {
  display: flex; align-items: center; gap: 6px; min-width: 0;
}
.dl-dot {
  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
}
.dl-label {
  font-size: 0.7rem; color: var(--text-muted); flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dl-val {
  font-size: 0.7rem; font-weight: 700; color: var(--text-main); flex-shrink: 0;
}


/* ── BOTTOM ROW ──────────────────────────────────────────── */
.bottom-row { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 1024px) { .bottom-row { grid-template-columns: 1.6fr 1fr; gap: 16px; } }
.right-col  { display: flex; flex-direction: column; gap: 12px; }
@media (min-width: 1024px) { .right-col { gap: 16px; } }

/* ── PROVINCE MAP ────────────────────────────────────────── */
.map-card { padding: 0; overflow: hidden; }

/* Horizontal scroll so all 11 provinces stay in ONE row */
.prov-scroll-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding: 8px 14px;
}
@media (min-width: 768px) { .prov-scroll-wrap { padding: 10px 18px; } }

.prov-grid {
  display: flex;          /* flex row, NOT grid */
  gap: 6px;
  align-items: flex-end;
  height: 130px;
  min-width: max-content; /* prevent wrapping */
}
@media (min-width: 640px) { .prov-grid { height: 150px; } }

.prov-btn {
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  width: 52px; min-width: 52px;
  height: 100%;
  background: #f8fafc; border: 2px solid transparent;
  border-radius: 8px; cursor: pointer; padding: 4px 3px 4px; gap: 3px;
  transition: all 0.18s; min-height: 0;
}
.prov-btn:hover  { border-color: var(--pc, #6b7280); background: rgba(255,255,255,0.9); }
.prov-btn.selected { border-color: #1a5c38; box-shadow: 0 0 0 2px #1a5c38; }

.prov-bar  { width: 100%; border-radius: 3px 3px 0 0; min-height: 4px; }
.prov-name { font-size: 0.5rem; color: var(--text-muted); text-align: center; line-height: 1.2; font-weight: 600; }
.prov-idx  { font-size: 0.6rem; font-weight: 800; }

.legend-map { display: flex; gap: 8px; flex-wrap: wrap; }
.legend-map span { font-size: 0.68rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
.dot-leg { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }

.prov-detail { margin: 0 14px 14px; background: #f8fafc; border-radius: 11px; padding: 12px 14px; }
@media (min-width: 768px) { .prov-detail { margin: 0 18px 18px; } }
.pd-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 0.86rem; }
.pd-idx { padding: 2px 8px; border-radius: 7px; font-size: 0.7rem; font-weight: 800; color: white; margin-left: auto; white-space: nowrap; }
.pd-stats { display: grid; grid-template-columns: 1fr; gap: 8px; }
@media (min-width: 400px) { .pd-stats { grid-template-columns: repeat(3, 1fr); } }
.pd-stat  { display: flex; align-items: flex-start; gap: 7px; }
.pd-val   { font-size: 0.82rem; font-weight: 800; color: var(--text-main); }
.pd-sub   { font-size: 0.66rem; color: var(--text-muted); margin-top: 1px; }

/* ── ALERTS ──────────────────────────────────────────────── */
.section-card { padding: 14px; }
@media (min-width: 768px) { .section-card { padding: 18px; } }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.section-title-row { display: flex; align-items: center; gap: 7px; }
.section-title-row h3 { font-size: 0.86rem; font-weight: 700; color: var(--text-main); margin: 0; }
.alert-count { background: #fee2e2; color: #dc2626; font-size: 0.7rem; font-weight: 800; padding: 2px 7px; border-radius: 7px; }
.alerts-list { display: flex; flex-direction: column; gap: 7px; }
.alert-row { display: flex; align-items: flex-start; gap: 8px; padding: 9px 10px; border-radius: 9px; background: #fafafa; }
.alert-red   { border-left: 3px solid #dc2626; }
.alert-amber { border-left: 3px solid #f59e0b; }
.alert-blue  { border-left: 3px solid #2563eb; }
.ar-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
.dot-red   { background: #dc2626; }
.dot-amber { background: #f59e0b; }
.dot-blue  { background: #2563eb; }
.ar-body { flex: 1; min-width: 0; }
.ar-title { font-size: 0.78rem; font-weight: 700; color: var(--text-main); }
.ar-msg   { font-size: 0.69rem; color: var(--text-muted); margin-top: 2px; line-height: 1.4; }
.ar-badge { padding: 2px 7px; border-radius: 7px; font-size: 0.65rem; font-weight: 800; white-space: nowrap; flex-shrink: 0; margin-top: 1px; }
.badge-red   { background: #fee2e2; color: #dc2626; }
.badge-amber { background: #fef3c7; color: #d97706; }
.badge-blue  { background: #dbeafe; color: #2563eb; }

/* ── EXEC BARS ───────────────────────────────────────────── */
.exec-bars { display: flex; flex-direction: column; gap: 9px; }
.exec-bar-row { display: flex; align-items: center; gap: 8px; }
.eb-label { font-size: 0.7rem; color: var(--text-muted); min-width: 0; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.eb-track { width: 80px; flex-shrink: 0; height: 7px; background: #e5e7eb; border-radius: 10px; overflow: hidden; }
@media (min-width: 480px) { .eb-track { width: 110px; } }
.eb-fill  { height: 100%; border-radius: 10px; transition: width 0.6s; }
.eb-pct   { font-size: 0.74rem; font-weight: 800; min-width: 30px; text-align: right; }
</style>

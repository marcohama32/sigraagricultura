<script setup lang="ts">
import { useRoute } from 'vue-router'
import { Menu, Bell, Search } from 'lucide-vue-next'

const route = useRoute()
const emit = defineEmits<{ (e: 'toggle-sidebar'): void }>()

const routeLabels: Record<string, string> = {
  '/': 'Painel Executivo',
  '/politicas': 'Políticas',
  '/estrategias': 'Estratégias',
  '/programas': 'Programas e Projectos',
  '/estatisticas': 'Estatísticas Agrárias',
  '/concursos': 'Concursos Públicos',
  '/publicacoes': 'Publicações',
}
</script>

<template>
  <header class="header">
    <!-- Hamburger (mobile only) -->
    <button class="hamburger hide-desktop" @click="emit('toggle-sidebar')" aria-label="Abrir menu">
      <Menu :size="24" />
    </button>

    <!-- Page title (mobile) / Search (desktop) -->
    <div class="header-title hide-desktop">
      {{ routeLabels[route.path] ?? 'SiGRA' }}
    </div>

    <div class="search-bar hide-mobile">
      <Search :size="16" class="search-icon-inner" />
      <input type="text" placeholder="Pesquisar no sistema..." />
    </div>

    <!-- Right actions -->
    <div class="header-right">
      <button class="notif-btn">
        <Bell :size="20" />
        <span class="notif-dot"></span>
      </button>
      <div class="avatar">MIN</div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 12px;
  /* Mobile: tight */
  padding: 10px 0 12px;
  margin-bottom: 0;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .header { padding: 16px 0 18px; gap: 16px; }
}

/* Hamburger */
.hamburger {
  color: var(--text-main);
  padding: 6px;
  border-radius: 10px;
  flex-shrink: 0;
  min-height: 0;
}
.hamburger:hover { background: rgba(0,0,0,0.06); }

/* Mobile page title */
.header-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  flex: 1;
}

/* Search */
.search-bar {
  flex: 1;
  max-width: 360px;
  position: relative;
}

.search-icon-inner {
  position: absolute;
  left: 14px; top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-bar input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border-radius: 20px;
  border: none;
  background: white;
  box-shadow: var(--shadow-sm);
  outline: none;
  font-family: inherit;
  font-size: 0.88rem;
  color: var(--text-main);
}

/* Right */
.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-sidebar);
  padding: 5px 5px 5px 14px;
  border-radius: 30px;
  margin-left: auto;
}

.notif-btn {
  color: white;
  position: relative;
  padding: 4px 8px;
  min-height: 0;
}

.notif-dot {
  position: absolute;
  top: 4px; right: 6px;
  width: 7px; height: 7px;
  background: #ef4444;
  border-radius: 50%;
  border: 1.5px solid var(--bg-sidebar);
}

.avatar {
  width: 34px; height: 34px;
  background: white;
  color: var(--bg-sidebar);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.7rem;
  flex-shrink: 0;
}
</style>

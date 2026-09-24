<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, FileText, Target, FolderKanban,
  BarChart2, ClipboardList, BookOpen, Settings, Shield, LogOut, X
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const emit = defineEmits<{ (e: 'close'): void }>()

const handleLogout = () => {
  emit('close')
  router.push({ name: 'login' })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-inner">
      <!-- Logo + Close btn (mobile only) -->
      <div class="logo">
        <div class="logo-icon"></div>
        <h2>Sigra Agri</h2>
        <button class="close-sidebar hide-desktop" @click="emit('close')" aria-label="Fechar menu">
          <X :size="22" />
        </button>
      </div>

      <nav class="nav-links">
        <!-- Dashboard -->
        <router-link to="/" active-class="active" exact @click="emit('close')">
          <LayoutDashboard :size="20" class="icon" />
          Dashboard
          <div v-if="route.path === '/'" class="active-dot"></div>
        </router-link>

        <span class="nav-section-label">Documentos</span>

        <router-link to="/politicas" active-class="active" @click="emit('close')">
          <FileText :size="20" class="icon" />
          Políticas
          <div v-if="route.path === '/politicas'" class="active-dot"></div>
        </router-link>

        <router-link to="/estrategias" active-class="active" @click="emit('close')">
          <Target :size="20" class="icon" />
          Estratégias
          <div v-if="route.path === '/estrategias'" class="active-dot"></div>
        </router-link>

        <router-link to="/programas" active-class="active" @click="emit('close')">
          <FolderKanban :size="20" class="icon" />
          Programas e Projectos
          <div v-if="route.path === '/programas'" class="active-dot"></div>
        </router-link>

        <span class="nav-section-label">Dados e Informação</span>

        <router-link to="/estatisticas" active-class="active" @click="emit('close')">
          <BarChart2 :size="20" class="icon" />
          Estatísticas Agrárias
          <div v-if="route.path === '/estatisticas'" class="active-dot"></div>
        </router-link>

        <router-link to="/concursos" active-class="active" @click="emit('close')">
          <ClipboardList :size="20" class="icon" />
          Concursos Públicos
          <div v-if="route.path === '/concursos'" class="active-dot"></div>
        </router-link>

        <router-link to="/publicacoes" active-class="active" @click="emit('close')">
          <BookOpen :size="20" class="icon" />
          Publicações
          <div v-if="route.path === '/publicacoes'" class="active-dot"></div>
        </router-link>

        <span class="nav-section-label">Sistema</span>

        <a href="#">
          <Settings :size="20" class="icon" />
          Definições
        </a>
        <a href="#">
          <Shield :size="20" class="icon" />
          Privacidade
        </a>
      </nav>

      <div class="logout">
        <button class="logout-btn" @click="handleLogout">
          <LogOut :size="18" />
          Sair
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-width);
  height: 100%;
  background-color: var(--bg-sidebar);
  border-radius: 0;
  overflow-y: auto;
}

/* Desktop: rounded with padding */
@media (min-width: 1024px) {
  .sidebar {
    border-radius: var(--radius-lg);
    margin: 0;
  }
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px 16px;
}

/* ── Logo ─────────────────────────── */
.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
  margin-bottom: 28px;
  padding: 8px 0;
}

.logo-icon {
  width: 22px; height: 32px;
  background-color: white;
  clip-path: polygon(50% 0%, 0% 100%, 50% 100%, 100% 0%);
  flex-shrink: 0;
}

.logo h2 { font-size: 1.15rem; font-weight: 700; flex: 1; }

.close-sidebar {
  color: rgba(255,255,255,0.7);
  padding: 6px;
  border-radius: 8px;
  min-height: 0;
  transition: background 0.2s;
}
.close-sidebar:hover { background: rgba(255,255,255,0.1); }

/* ── Nav ──────────────────────────── */
.nav-links {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}

.nav-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgba(255,255,255,0.35);
  padding: 14px 12px 4px;
  display: block;
}

.nav-links a {
  display: flex;
  align-items: center;
  padding: 11px 12px;
  border-radius: 10px;
  color: var(--text-sidebar);
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  position: relative;
  text-decoration: none;
  min-height: 44px;
}

.nav-links a.active,
.nav-links a:hover {
  color: var(--text-sidebar-active);
  background: rgba(255,255,255,0.1);
}

.active-dot {
  width: 6px; height: 6px;
  background: white;
  border-radius: 50%;
  position: absolute; right: 12px;
}

.icon { margin-right: 12px; opacity: 0.7; flex-shrink: 0; }
.active .icon { opacity: 1; }

/* ── Logout ────────────────────────── */
.logout { margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }

.logout-btn {
  width: 100%;
  background: white;
  color: var(--bg-sidebar);
  padding: 12px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  min-height: 48px;
}
.logout-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
</style>

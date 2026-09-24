<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'

const sidebarOpen = ref(false)
const route = useRoute()
const isLoginRoute = computed(() => route.name === 'login')
</script>

<template>
  <div class="app-layout">
    <template v-if="!isLoginRoute">
      <!-- Mobile overlay -->
      <div
        v-if="sidebarOpen"
        class="sidebar-overlay"
        @click="sidebarOpen = false"
      />

      <!-- Sidebar: drawer on mobile, fixed on desktop -->
      <Sidebar
        :class="['sidebar-wrap', { 'sidebar-open': sidebarOpen }]"
        @close="sidebarOpen = false"
      />
    </template>

    <!-- Main area -->
    <main class="main-content">
      <Header v-if="!isLoginRoute" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="page-content" :style="isLoginRoute ? 'padding: 0; overflow: hidden;' : ''">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100dvh; /* dynamic viewport height — mobile safe */
  overflow: hidden;
  position: relative;
}

/* ── Sidebar wrapper ────────────────────────── */
/* Mobile: hidden off-screen drawer */
.sidebar-wrap {
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
  width: var(--sidebar-width);
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  /* No padding on mobile — sidebar fills edge-to-edge */
  padding: 0;
}

.sidebar-wrap.sidebar-open {
  transform: translateX(0);
}

/* Desktop: always visible, no overlay needed */
@media (min-width: 1024px) {
  .sidebar-wrap {
    position: relative;
    transform: translateX(0) !important;
    padding: 20px 0 20px 20px;
    flex-shrink: 0;
  }
}

/* ── Main content ────────────────────────────── */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* prevent flex overflow */
}

.page-content {
  flex: 1;
  overflow-y: auto;
  /* Mobile: tight padding */
  padding: 12px 12px 24px;
}

/* Tablet */
@media (min-width: 768px) {
  .page-content { padding: 16px 16px 24px; }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-content { padding: 0 20px 24px; }
}

/* Scrollbar */
.page-content::-webkit-scrollbar { width: 4px; }
.page-content::-webkit-scrollbar-track { background: transparent; }
.page-content::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
</style>

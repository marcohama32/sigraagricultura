import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Policies from '../views/Policies.vue'
import Estatisticas from '../views/Estatisticas.vue'
import Concursos from '../views/Concursos.vue'
import Publicacoes from '../views/Publicacoes.vue'
import Programas from '../views/Programas.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',            name: 'dashboard',    component: Dashboard    },
    { path: '/login',       name: 'login',        component: Login        },
    { path: '/politicas',   name: 'politicas',    component: Policies     },
    { path: '/estrategias', name: 'estrategias',  component: Policies     },
    { path: '/programas',   name: 'programas',    component: Programas    },
    { path: '/estatisticas',name: 'estatisticas', component: Estatisticas },
    { path: '/concursos',   name: 'concursos',    component: Concursos    },
    { path: '/publicacoes', name: 'publicacoes',  component: Publicacoes  },
  ]
})

export default router

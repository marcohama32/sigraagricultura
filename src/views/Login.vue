<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock, LogIn, Leaf } from 'lucide-vue-next'

const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)

const handleLogin = () => {
  isLoading.value = true
  // Mock login process
  setTimeout(() => {
    isLoading.value = false
    router.push({ name: 'dashboard' })
  }, 1000)
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-wrapper">
          <Leaf class="logo-icon" :size="32" />
        </div>
        <h1 class="brand-title">SIGRA</h1>
        <p class="brand-subtitle">Módulo de Agricultura</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="email">E-mail</label>
          <div class="input-wrapper">
            <User class="input-icon" :size="20" />
            <input 
              id="email" 
              type="email" 
              v-model="email" 
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>
        </div>

        <div class="input-group">
          <div class="password-label">
            <label for="password">Palavra-passe</label>
            <a href="#" class="forgot-password">Esqueceu a senha?</a>
          </div>
          <div class="input-wrapper">
            <Lock class="input-icon" :size="20" />
            <input 
              id="password" 
              type="password" 
              v-model="password" 
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="!isLoading">Entrar</span>
          <span v-else class="loading-spinner"></span>
          <LogIn v-if="!isLoading" class="btn-icon" :size="20" />
        </button>
      </form>
      
      <div class="login-footer">
        <p>&copy; 2026 GASEPEC. Todos os direitos reservados.</p>
      </div>
    </div>
    
    <div class="login-decoration">
      <!-- Decorative background elements -->
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 440px;
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 20px 40px rgba(22, 163, 74, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 10;
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-wrapper {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 20px;
  color: white;
  box-shadow: 0 10px 20px rgba(22, 163, 74, 0.2);
}

.brand-title {
  font-size: 2rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.password-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  font-size: 0.85rem;
  color: #16a34a;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #15803d;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 14px;
  font-size: 1rem;
  color: #1f2937;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #16a34a;
  background: white;
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.1);
}

.input-wrapper input::placeholder {
  color: #9ca3af;
}

.login-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
  box-shadow: 0 8px 16px rgba(22, 163, 74, 0.2);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(22, 163, 74, 0.3);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: 40px;
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
}

/* Decorative Blobs */
.login-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}

.blob-1 {
  top: -10%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: #bbf7d0;
  animation: float 10s ease-in-out infinite alternate;
}

.blob-2 {
  bottom: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: #dcfce7;
  animation: float 12s ease-in-out infinite alternate-reverse;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(30px, 50px) scale(1.1); }
}

/* Responsive */
@media (max-width: 640px) {
  .login-card {
    padding: 32px 24px;
    margin: 20px;
    border-radius: 20px;
  }
  
  .brand-title {
    font-size: 1.75rem;
  }
}
</style>

<script setup lang="ts">
</script>

<template>
  <div class="coming-soon-view">
    <div class="cs-card">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.coming-soon-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}
.cs-card {
  background: white;
  border-radius: 20px;
  padding: 60px;
  text-align: center;
  max-width: 560px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06);
}
</style>

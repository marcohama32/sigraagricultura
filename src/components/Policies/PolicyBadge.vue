<script setup lang="ts">
defineProps<{
  value: string
  type?: 'status' | 'category'
}>()

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  'Ativa':      { bg: '#d1fae5', text: '#065f46', dot: '#10b981' },
  'Inativa':    { bg: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
  'Em Revisão': { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Irrigação':        { bg: '#dbeafe', text: '#1e40af' },
  'Sementes':         { bg: '#dcfce7', text: '#166534' },
  'Pecuária':         { bg: '#ffe4e6', text: '#9f1239' },
  'Ambiente':         { bg: '#ecfccb', text: '#3f6212' },
  'Mecanização':      { bg: '#fef9c3', text: '#854d0e' },
  'Sanidade Vegetal': { bg: '#f0fdf4', text: '#15803d' },
  'Sanidade Animal':  { bg: '#fff1f2', text: '#be123c' },
  'Outro':            { bg: '#f3f4f6', text: '#374151' },
}

const getStyle = (value: string, type: string) => {
  if (type === 'status') {
    const c = statusColors[value] ?? { bg: '#f3f4f6', text: '#374151', dot: '#9ca3af' }
    return c
  }
  return categoryColors[value] ?? { bg: '#f3f4f6', text: '#374151' }
}
</script>

<template>
  <span
    class="badge"
    :style="{
      backgroundColor: getStyle(value, type ?? 'category').bg,
      color: getStyle(value, type ?? 'category').text,
    }"
  >
    <span
      v-if="type === 'status'"
      class="dot"
      :style="{ backgroundColor: (statusColors[value] ?? { dot: '#9ca3af' }).dot }"
    ></span>
    {{ value }}
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>

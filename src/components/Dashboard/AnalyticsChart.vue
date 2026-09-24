<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartData = {
  labels: ['October', 'November', 'December'],
  datasets: [
    {
      label: 'Dataset 1',
      backgroundColor: '#bce3d2',
      data: [60, 80, 50],
      borderRadius: 4,
      barThickness: 20
    },
    {
      label: 'Dataset 2',
      backgroundColor: '#337a64',
      data: [40, 70, 60],
      borderRadius: 4,
      barThickness: 20
    },
    {
      label: 'Dataset 3',
      backgroundColor: '#e6f1ec',
      data: [30, 45, 30],
      borderRadius: 4,
      barThickness: 20
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: { display: false }
    },
    y: {
      display: false,
      grid: { display: false }
    }
  }
}
</script>

<template>
  <div class="analytics-card">
    <div class="header">
      <h3>Analytics</h3>
      <div class="filter">
        <span class="icon">📅</span>
        3 Months
      </div>
    </div>
    <div class="chart-container">
      <Bar :data="chartData" :options="chartOptions" />
      <div class="target-line"></div>
    </div>
  </div>
</template>

<style scoped>
.analytics-card {
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.filter {
  background-color: var(--bg-sidebar);
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.chart-container {
  position: relative;
  height: 200px;
  width: 100%;
}

.target-line {
  position: absolute;
  top: 30%;
  left: 0;
  right: 0;
  border-top: 2px dashed #f5a623;
  z-index: 0;
}
</style>

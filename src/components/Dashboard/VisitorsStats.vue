<template>
  <div class="visitors-card">
    <div class="header">
      <h3>Visitors</h3>
    </div>
    
    <div class="stats-grid">
      <div class="stat-item">
        <div class="val">12.9K</div>
        <div class="label">Lorem Ipsum</div>
      </div>
      <div class="stat-chart">
        <svg viewBox="0 0 100 30" class="line-green">
          <polyline points="0,20 30,10 60,25 100,5" fill="none" stroke="#7acc4b" stroke-width="2"/>
        </svg>
      </div>
      <div class="stat-item">
        <div class="val">65%</div>
        <div class="label">Lorem Ipsum</div>
      </div>
      <div class="stat-badge">
        <span class="badge up">UP ▲</span>
      </div>
      
      <div class="stat-item">
        <div class="val">212.9K</div>
        <div class="label">Lorem Ipsum</div>
      </div>
      <div class="stat-chart">
        <svg viewBox="0 0 100 30" class="line-blue">
          <polyline points="0,25 30,15 60,30 100,10" fill="none" stroke="#3b82f6" stroke-width="2"/>
        </svg>
      </div>
      <div class="stat-item">
        <div class="val">1m 45s</div>
        <div class="label">Lorem Ipsum</div>
      </div>
      <div class="stat-badge">
        <span class="badge time">TIME ▲</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 20px;
  align-items: center;
}

.val {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--bg-sidebar);
}

.label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.stat-chart svg {
  width: 80px;
  height: 30px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
}

.badge.up {
  background-color: #eaf6e6;
  color: #7acc4b;
}

.badge.time {
  background-color: #eaf6e6;
  color: #7acc4b;
}
</style>

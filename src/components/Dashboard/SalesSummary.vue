<template>
  <div class="sales-card">
    <div class="header">
      <h3>Lorem Ipsum</h3>
    </div>
    
    <div class="tabs">
      <div class="tab">All-In</div>
      <div class="tab active">Dolor Sit Amet</div>
    </div>
    
    <div class="summary-box">
      <div class="date">28 May 2023</div>
      
      <div class="stats">
        <div class="stat">
          <div class="val">230</div>
          <div class="label">Sold out</div>
        </div>
        <div class="stat">
          <div class="val">2</div>
          <div class="label">Refund</div>
        </div>
        <div class="stat">
          <div class="val">1500</div>
          <div class="label">Stock</div>
        </div>
      </div>
      
      <div class="chart">
        <svg viewBox="0 0 300 100" class="line-chart">
          <polyline points="0,70 50,40 100,80 150,90 200,30 250,50 300,70" fill="none" stroke="#337a64" stroke-width="3"/>
          <polyline points="0,30 50,20 100,50 150,40 200,20 250,30 300,50" fill="none" stroke="#bce3d2" stroke-width="2"/>
        </svg>
      </div>
      
      <div class="filters">
        <div class="filter">Yearly</div>
        <div class="filter">Monthly</div>
        <div class="filter active">Day</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.tabs {
  display: flex;
  background-color: var(--bg-app);
  border-radius: 20px;
  margin-bottom: 20px;
  overflow: hidden;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 8px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-muted);
}

.tab.active {
  background-color: var(--bg-sidebar);
  color: white;
  border-radius: 20px;
}

.summary-box {
  background-color: var(--bg-app);
  border-radius: var(--radius-md);
  padding: 15px;
}

.date {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 15px;
}

.stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat {
  text-align: center;
}

.stat .val {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--bg-sidebar);
}

.stat .label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.chart {
  margin-bottom: 20px;
}

.chart svg {
  width: 100%;
  height: 80px;
}

.filters {
  display: flex;
  justify-content: space-between;
}

.filter {
  font-size: 0.7rem;
  padding: 4px 12px;
  border-radius: 10px;
  cursor: pointer;
  background-color: white;
  color: var(--text-muted);
}

.filter.active {
  background-color: #bce3d2;
  color: var(--bg-sidebar);
  font-weight: bold;
}
</style>

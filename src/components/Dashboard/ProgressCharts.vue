<template>
  <div class="progress-card">
    <div class="header">
      <h3>Lorem Ipsum</h3>
    </div>
    
    <div class="charts-wrapper">
      <div class="progress-item">
        <div class="circle orange" style="--p:85;">85%</div>
        <div class="info">
          <div class="label">Lorem ipsum</div>
          <div class="val">223</div>
        </div>
      </div>
      
      <div class="progress-item">
        <div class="circle purple" style="--p:40;">40%</div>
        <div class="info">
          <div class="label">Lorem ipsum</div>
          <div class="val">33000</div>
        </div>
      </div>
      
      <div class="progress-item">
        <div class="circle blue" style="--p:65;">65%</div>
        <div class="info">
          <div class="label">Lorem ipsum</div>
          <div class="val">700</div>
        </div>
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

.charts-wrapper {
  display: flex;
  justify-content: space-between;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  position: relative;
}

.circle::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 50%;
  padding: 6px;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.circle.orange { color: var(--accent-orange); }
.circle.orange::before { background: conic-gradient(var(--accent-orange) calc(var(--p)*1%), #f0f0f0 0); }

.circle.purple { color: var(--accent-purple); }
.circle.purple::before { background: conic-gradient(var(--accent-purple) calc(var(--p)*1%), #f0f0f0 0); }

.circle.blue { color: var(--accent-blue); }
.circle.blue::before { background: conic-gradient(var(--accent-blue) calc(var(--p)*1%), #f0f0f0 0); }

.info {
  display: flex;
  flex-direction: column;
}

.info .label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.info .val {
  font-size: 1.1rem;
  font-weight: bold;
  color: var(--bg-sidebar);
}
</style>

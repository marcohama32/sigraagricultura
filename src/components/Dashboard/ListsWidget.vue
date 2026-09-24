<template>
  <div class="lists-card">
    <div class="header">
      <h3>Lorem Ipsum</h3>
    </div>
    
    <div class="lists-wrapper">
      <div class="list-section">
        <h4>Top Products</h4>
        <ol>
          <li>Lorem Ipsum</li>
          <li>Lorem Ipsum</li>
          <li>Lorem Ipsum</li>
        </ol>
      </div>
      
      <div class="list-section">
        <h4>Top Buyer</h4>
        <ol>
          <li>Lorem Ipsum</li>
          <li>Lorem Ipsum</li>
          <li>Lorem Ipsum</li>
        </ol>
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

.lists-wrapper {
  display: flex;
  gap: 40px;
}

.list-section {
  flex: 1;
}

.list-section h4 {
  font-size: 0.9rem;
  color: var(--text-main);
  margin-bottom: 15px;
  font-weight: 600;
}

ol {
  padding-left: 20px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

li {
  margin-bottom: 10px;
}
</style>

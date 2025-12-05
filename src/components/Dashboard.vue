<script>
import Breadcrumb from '../components/Breadcrumb.vue'
import Sidebar from '../components/Sidebar.vue'
import Table from '../components/Table.vue'

export default {
  name: 'DashboardPage',
  components: {
    Breadcrumb,
    Sidebar,
    Table,
  },
}
</script>

<template>
  <div class="dashboard">
    <Breadcrumb />

    <div class="main-content">
      <div class="sidebar">
        <Sidebar />
      </div>

      <div class="table-container">
        <Table />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.breadcrumb {
  width: 100%;
  background-color: #f8f9fa;
  padding: 5px 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  color: #6c757d;
}

.main-content {
  display: flex;
  flex: 1;
  gap: 10px;
  padding: 10px;
  background-color: #e9ecef;
  box-sizing: border-box;
}

.sidebar {
  flex: 1;
  background-color: #fff;
  padding: 10px;
}

.table-container {
  flex: 2;
  background-color: #fff;
  padding: 10px;
}
</style>

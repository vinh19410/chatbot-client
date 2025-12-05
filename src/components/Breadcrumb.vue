<template>
  <div class="breadcrumb">
    <VCardText class="v-card__text">
      <h1>
        <div>Dữ liệu chất ma túy giám định</div>
      </h1>
      <div>
        <p>Home / Ma túy / <strong>Dữ liệu chất ma túy giám định</strong></p>
      </div>
    </VCardText>
  </div>
</template>

<script>
export default {
  name: "Breadcrumb",
};
</script>

<style scoped>
.breadcrumb {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #f8f9fa;
  border-block-end: 1px solid #ddd;
  color: #6c757d;
  font-size: 10px;
  padding-block: 3px;
  padding-inline: 10px;
}

.breadcrumb p {
  margin: 0;
}

.v-card__text {
  padding: 16px;
}

.v-card__text h1 {
  display: flex;
  align-items: center;
  margin-block-end: 8px;
}

.v-card__text h1 div {
  display: inline-block;
}

.v-card__text div p {
  margin: 0;
  color: #666;
}

.v-card__text div p strong {
  color: #333;
}
</style>

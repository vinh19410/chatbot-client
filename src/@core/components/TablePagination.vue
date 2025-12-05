<script setup lang="ts">
interface Props {
  page: number,
  itemsPerPage: number,
  totalItems: number,
  allOptions?: number[],
  recordNumber?: boolean
}

interface Emit {
  (e: 'update:page', value: number): void
  (e: 'update:itemsPerPage', value: number): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()
const allOptions = props.allOptions || [8, 20, 32, 58, 72, 100];
const itemsPerPageOptions = [...allOptions.slice(0, 8), "ALL"];
const updatePage = (value: number) => {
  emit('update:page', value)
}

const updateItemsPerPage = (value: number) => {
  emit("update:itemsPerPage", value);
};
</script>

<template>
  <div>
    <VDivider />

    <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 px-6 py-3">
      <p class="text-disabled mb-0">
        {{ paginationMeta({ page, itemsPerPage }, totalItems) }}
      </p>
      <div class="d-flex align-center ml-auto" v-if="recordNumber">
        <p class="text-disabled mb-0">Số bản ghi : </p>
        <VSelect :model-value="itemsPerPage" :items="itemsPerPageOptions" dense outlined
          @update:model-value="updateItemsPerPage" class="w-25 ml-5" />
      </div>
      <VPagination :model-value="page" active-color="primary" :length="Math.ceil(totalItems / itemsPerPage)"
        :total-visible="$vuetify.display.xs ? 1 : Math.min(Math.ceil(totalItems / itemsPerPage), 5)"
        @update:model-value="updatePage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
interface MenuItem {
  title?: string
  value?: string
  type?: string
  class?: string
}

interface Props {
  menuList?: MenuItem[]
  itemProps?: boolean,
  trung_cau_id: any,
  data: any,
  search: boolean,
}

const props = defineProps<Props>()

// Emit event từ component con lên component cha
const emit = defineEmits<{
  (e: 'item-click', value: string): void
}>()

const handleItemClick = (item: MenuItem) => {
  if (item.value) {
    emit('item-click', props.data)
  }
}
</script>

<template>
  <IconBtn color="disabled">
    <VIcon icon="tabler-dots-vertical" />

    <VMenu v-if="props.menuList" activator="parent">
      <VList>
        <template v-for="(item, index) in props.menuList" :key="index">
          <!-- Hiển thị divider -->
          <VDivider v-if="item.type === 'divider'" :class="item.class" />

          <!-- Hiển thị các item khác -->
          <VListItem v-else @click="handleItemClick(item)" :class="item.class">
            {{ item.title }}
          </VListItem>
        </template>
      </VList>
    </VMenu>
  </IconBtn>
</template>

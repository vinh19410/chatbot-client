<script lang="ts" setup>
defineOptions({
  name: 'AppFileInput',
  inheritAttrs: false,
})

const elementId = computed(() => {
  const attrs = useAttrs()
  const _elementIdToken = attrs.id || attrs.label

  return _elementIdToken ? `app-text-field-${_elementIdToken}-${Math.random().toString(36).slice(2, 7)}` : undefined
})

const label = computed(() => useAttrs().label as string | undefined)
const isRequired = computed(() => !!useAttrs().required)
</script>

<template>
  <div class="app-text-field flex-grow-1" :class="$attrs.class">
    <VLabel v-if="label" :for="elementId" class="mb-1 text-body-2" style="line-height: 15px;">
      {{ label }}
      <span v-if="isRequired" class="text-error pl-1">(*)</span>
    </VLabel>
    <VFileInput v-bind="{
      ...$attrs,
      class: null,
      label: undefined,
      variant: 'outlined',
      id: elementId,
    }">
    </VFileInput>
  </div>
</template>

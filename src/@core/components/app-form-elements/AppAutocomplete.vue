<script lang="ts" setup>
defineOptions({
  name: 'AppAutocomplete',
  inheritAttrs: false,
})

// const { class: _class, label, variant: _, ...restAttrs } = useAttrs()

const elementId = computed(() => {
  const attrs = useAttrs()
  const _elementIdToken = attrs.id || attrs.label

  return _elementIdToken ? `app-autocomplete-${_elementIdToken}-${Math.random().toString(36).slice(2, 7)}` : undefined
})

const label = computed(() => useAttrs().label as string | undefined)
const isRequired = computed(() => !!useAttrs().required)
</script>

<template>
  <div class="app-autocomplete flex-grow-1" :class="$attrs.class">
    <VLabel v-if="label" :for="elementId" class="mb-1 text-body-2" style="line-height: 15px;">
      {{ label }}
      <span v-if="isRequired" class="text-error pl-1">(*)</span>
    </VLabel>
    <VAutocomplete v-bind="{
        ...$attrs,
        class: null,
        label: undefined,
        id: elementId,
        variant: 'outlined',
        menuProps: {
          contentClass: [
            'app-inner-list',
            'app-autocomplete__content',
            'v-autocomplete__content',
          ],
        },
}">
    </VAutocomplete>
  </div>
</template>

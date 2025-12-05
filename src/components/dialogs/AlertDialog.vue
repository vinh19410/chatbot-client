<script setup>
import useEventsBus from '@/composables/eventBus';
import error from '@images/icons/project-icons/error.png';
import success from '@images/icons/project-icons/success.png';

const { bus } = useEventsBus();
const alertRef = ref(false);
const type = ref('success');
const message = ref('');
const callback = ref(() => { })

watch(() => bus.value.get('showAlert'), (val) => {
  const [showAlert] = val
  alertRef.value = true
  type.value = showAlert.type
  message.value = showAlert.message
  callback.value = showAlert.callback
})

const buttonAction = () => {
  alertRef.value = false;
  if (callback.value) callback.value();
}
</script>

<template>
  <!-- 👉 Notification Dialog  -->
  <VDialog v-model="alertRef" max-width="500px">
    <VCard>
      <VCardItem class="text-center">
        <VImg v-if="type === 'success'" :src="success" :height="64" />
        <VImg v-if="type === 'error'" :src="error" :height="64" />
      </VCardItem>

      <VCardTitle class="d-block font-weight-regular text-wrap text-center mb-4 py-0">
        <h4 class="text-md">{{ message }}</h4>
      </VCardTitle>

      <VBtn color="null" class="rounded-0 border-t-sm" size="x-large" variant="text" @click="() => buttonAction()">
        Ok
      </VBtn>
    </VCard>
  </VDialog>
</template>

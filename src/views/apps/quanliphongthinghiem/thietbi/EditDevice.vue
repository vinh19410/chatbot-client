<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { VForm } from 'vuetify/components/VForm';

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'userData', value: any): void
}

interface Props {
  isDrawerOpen: boolean,
  deviceId: any,
  deviceDetail: any,
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()
const name = ref('')
const code = ref('')
const manufacturer = ref('')
const model = ref('')
const seri = ref()
const datePutIntoUse = ref('')
const maintenanceHistory = ref('')
const warrantyInformation = ref('')

console.log('id', props.deviceId);
console.log('isDrawerOpen', props.isDrawerOpen);

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false)

  nextTick(() => {
    refForm.value?.reset()
    refForm.value?.resetValidation()
  })
}

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('userData', {
        name: name.value,
        code: code.value,
        model: model.value,
        seri: seri.value,
        manufacturer: manufacturer.value,
        datePutIntoUse: datePutIntoUse.value,
        maintenanceHistory: maintenanceHistory.value,
        warrantyInformation: warrantyInformation.value,
      })
      emit('update:isDrawerOpen', false)
      nextTick(() => {
        refForm.value?.reset()
        refForm.value?.resetValidation()
      })
    }
  })
}

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val)
}
</script>

<template>
  <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content" :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate">
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="Thêm mới thiết bị" @cancel="closeNavigationDrawer" />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField v-model="name" :rules="[requiredValidator]" label="Tên thiết bị"
                  placeholder="Tên thiết bị" />
              </VCol>

              <!-- 👉 code -->
              <VCol cols="12">
                <AppTextField v-model="code" :rules="[requiredValidator]" label="Mã thiết bị"
                  placeholder="Mã thiết bị" />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField v-model="manufacturer" :rules="[requiredValidator]" label="Hãng sản xuất"
                  placeholder="Hãng sản xuất" />
              </VCol>

              <!-- 👉 model -->
              <VCol cols="12">
                <AppTextField v-model="model" :rules="[requiredValidator]" label="Model" placeholder="Model" />
              </VCol>

              <!-- seri -->
              <VCol cols="12">
                <AppTextField v-model="seri" label="Số seri" placeholder="Số seri" :rules="[requiredValidator]" />
              </VCol>

              <!-- ngay dua vao su dung -->
              <VCol cols="12">
                <AppDateTimePicker v-model="datePutIntoUse" label="Ngày đưa vào sử dụng"
                  placeholder="Ngày đưa vào sử dụng" :rules="[requiredValidator]" />
              </VCol>

              <!-- lich su bao duong -->
              <VCol cols="12">
                <AppDateTimePicker v-model="maintenanceHistory" label="Lịch sử bảo dưỡng"
                  placeholder="Lịch sử bảo dưỡng" :rules="[requiredValidator]" />
              </VCol>

              <!-- thong tin bao hanh -->
              <VCol cols="12">
                <AppTextField v-model="warrantyInformation" label="Thông tin bảo hành" placeholder="Thông tin bảo hành"
                  :rules="[requiredValidator]" />
              </VCol>

              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn type="submit" class="me-3">
                  Submit
                </VBtn>
                <VBtn type="reset" variant="tonal" color="error" @click="closeNavigationDrawer">
                  Cancel
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

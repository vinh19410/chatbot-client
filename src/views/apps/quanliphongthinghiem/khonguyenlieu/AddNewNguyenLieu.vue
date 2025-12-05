<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { VForm } from 'vuetify/components/VForm';

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void
  (e: 'userData', value: any): void
}

interface Props {
  isDrawerOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<Emit>()

const isFormValid = ref(false)
const refForm = ref<VForm>()
const name = ref('')
const code = ref('')
const quantity = ref('')
const inputDay = ref('')
const expiry = ref()
const warehouseImporter = ref('')
const SupplierContactInformation = ref('')

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
        quantity: quantity.value,
        inputDay: inputDay.value,
        expiry: expiry.value,
        warehouseImporter: warehouseImporter.value,
        SupplierContactInformation: SupplierContactInformation.value,
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
                <AppTextField v-model="name" :rules="[requiredValidator]" label="Tên nguyên vật liệu"
                  placeholder="Tên nguyên vật liệu" />
              </VCol>

              <!-- 👉 code -->
              <VCol cols="12">
                <AppTextField v-model="code" :rules="[requiredValidator]" label="Mã nguyên vật liệu"
                  placeholder="Mã nguyên vật liệu" />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField v-model="quantity" :rules="[requiredValidator]" label="Số lượng" placeholder="Số lượng" />
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker v-model="inputDay" label="Ngày nhập kho" placeholder="Ngày nhập kho"
                  :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker v-model="expiry" label="Hạn sử dụng" placeholder="Hạn sử dụng"
                  :rules="[requiredValidator]" />
              </VCol>

              <!-- ngay dua vao su dung -->
              <VCol cols="12">
                <AppTextField v-model="warehouseImporter" :rules="[requiredValidator]" label="Người nhập kho"
                  placeholder="Người nhập kho" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="SupplierContactInformation" label="Thông tin liên hệ nhà cung cấp"
                  placeholder="Thông tin liên hệ nhà cung cấp" :rules="[requiredValidator]" />
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

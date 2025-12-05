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
let name = ref('')
let code = ref('')
let sex = ref('')
let age = ref('')
let other = ref()
let originOfSample = ref('')
let CollectionMethod = ref('')
let time = ref('')
let address = ref('')

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
        sex: sex.value,
        age: age.value,
        other: other.value,
        originOfSample: originOfSample.value,
        CollectionMethod: CollectionMethod.value,
        time: time.value,
        address: address.value,
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
    <AppDrawerHeaderSection title="Thêm mới mẫu" @cancel="closeNavigationDrawer" />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <!-- 👉 Full name -->
              <VCol cols="12">
                <AppTextField v-model="name" :rules="[requiredValidator]" label="Tên mẫu" placeholder="Tên mẫu" />
              </VCol>

              <!-- 👉 code -->
              <VCol cols="12">
                <AppTextField v-model="code" :rules="[requiredValidator]" label="Mã mẫu" placeholder="Mã mẫu" />
              </VCol>

              <!-- 👉 Email -->
              <VCol cols="12">
                <AppTextField v-model="sex" :rules="[requiredValidator]" label="Giới tính" placeholder="Giới tính" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="age" label="Tuổi" placeholder="Tuổi" :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="other" label="Thông tin khác" placeholder="Thông tin khác"
                  :rules="[requiredValidator]" />
              </VCol>

              <!-- ngay dua vao su dung -->
              <VCol cols="12">
                <AppTextField v-model="originOfSample" :rules="[requiredValidator]" label="Nguồn gốc của mẫu"
                  placeholder="Nguồn gốc của mẫu" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="CollectionMethod" label="Phương pháp thu thập" placeholder="Phương pháp thu thập"
                  :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker v-model="time" label="Thời gian thu thập" placeholder="Thời gian thu thập"
                  :rules="[requiredValidator]" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="address" label="Địa điểm thu thập" placeholder="Địa điểm thu thập"
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

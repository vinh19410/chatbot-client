<script setup lang="ts">
import { PerfectScrollbar } from 'vue3-perfect-scrollbar';
import type { VForm } from 'vuetify/components/VForm';

interface Emit {
  (e: 'update:isDrawerOpen', value: boolean): void;
  (e: 'domainData', value: any): void;
}

interface Props {
  isDrawerOpen: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<Emit>();

const isFormValid = ref(false);
const refForm = ref<VForm>();
const formData = ref({
  fullname: '',
  username: '',
  password: '',
});
const isPasswordVisible = ref(false);

// 👉 drawer close
const closeNavigationDrawer = () => {
  emit('update:isDrawerOpen', false);

  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
};

const onSubmit = () => {
  refForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('domainData', formData.value);
      emit('update:isDrawerOpen', false);
      nextTick(() => {
        refForm.value?.reset();
        refForm.value?.resetValidation();
      });
    }
  });
};

const handleDrawerModelValueUpdate = (val: boolean) => {
  emit('update:isDrawerOpen', val);
};

const { data: listDomain } = await useApi<any>(createUrl('/manage-group/list'));
const itemsDomain: any = computed(() => listDomain.value.data.data);

const { data: listModule } = await useApiInternal<any>(createUrl('/manage-group/list'));
const itemsModule: any = computed(() => listModule.value.data);

const { data: listGroup } = await useApiInternal<any>(createUrl('/manage-group/list'));
const itemsGroup: any = computed(() => listGroup.value.data);

const { data: listPermission } = await useApiInternal<any>(createUrl('/manage-permission/list'));
const itemsPermission: any = computed(() => listPermission.value.data.data);

</script>

<template>
  <VNavigationDrawer temporary :width="400" location="end" class="scrollable-content" :model-value="props.isDrawerOpen"
    @update:model-value="handleDrawerModelValueUpdate">
    <!-- 👉 Title -->
    <AppDrawerHeaderSection title="Thêm mới người dùng" @cancel="closeNavigationDrawer" />

    <VDivider />

    <PerfectScrollbar :options="{ wheelPropagation: false }">
      <VCard flat>
        <VCardText>
          <!-- 👉 Form -->
          <VForm ref="refForm" v-model="isFormValid" @submit.prevent="onSubmit">
            <VRow>
              <VCol cols="12">
                <AppTextField v-model="formData.fullname" :rules="[requiredValidator]" label="Fullname"
                  placeholder="Nhập fullname..." />
              </VCol>
              <VCol cols="12">
                <AppTextField v-model="formData.username" :rules="[requiredValidator]" label="Username"
                  placeholder="Nhập username..." />
              </VCol>
              <VCol cols="12">
                <AppTextField label="Password" placeholder="Nhập password" v-model="formData.password"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible" />
              </VCol>
              <VCol cols="12">
                <AppAutocomplete label="Domain" placeholder="--- Chọn domain ---" clear-icon="tabler-x" clearable
                  itemTitle="name" :rules="[requiredValidator]" :items="itemsDomain" />
              </VCol>
              <VCol cols="12">
                <AppAutocomplete label="Module" placeholder="--- Chọn module ---" clear-icon="tabler-x" clearable
                  itemTitle="name" :rules="[requiredValidator]" :items="itemsModule" multiple />
              </VCol>
              <VCol cols="12">
                <AppAutocomplete label="Nhóm" placeholder="--- Chọn nhóm ---" clear-icon="tabler-x" clearable
                  itemTitle="name" :rules="[requiredValidator]" :items="itemsGroup" multiple />
              </VCol>
              <VCol cols="12">
                <AppAutocomplete label="Quyền" placeholder="--- Chọn quyền ---" clear-icon="tabler-x" clearable
                  itemTitle="name" :rules="[requiredValidator]" :items="itemsPermission" multiple />
              </VCol>
              <!-- 👉 Submit and Cancel -->
              <VCol cols="12">
                <VBtn type="" class="me-3">
                  Thêm
                </VBtn>
                <VBtn type="reset" variant="tonal" color="error" @click="closeNavigationDrawer">
                  Hủy
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </PerfectScrollbar>
  </VNavigationDrawer>
</template>

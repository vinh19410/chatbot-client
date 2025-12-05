<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs';
import { OfficerRelativeType, PAGE_URL } from './contants';

interface Emit {
  (e: 'onSubmit', value: any): void;
  (e: 'refresh'): void;
  (e: 'onDelete'): void;
}

interface Props {
  isEdit: boolean;
  data: OfficerRelativeType
}

const genders = [
  {
    title: 'Nam',
    value: 'male',
  },
  {
    title: 'Nữ',
    value: 'female',
  },
]

const statuses = [
  {
    title: 'Đang sử dụng',
    value: 'active',
  },
  {
    title: 'Hết hạn',
    value: 'expired',
  },
]

const { isEdit = false, data } = defineProps<Props>();
const router = useRouter()
const emit = defineEmits<Emit>();
const refVForm = ref<VForm>()
const enabledEdit = ref<boolean>(!isEdit)
const formData = ref<OfficerRelativeType>({ ...data })

const onSubmit = () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) {
      emit('onSubmit', formData.value);
      nextTick(() => {
        enabledEdit.value = false;
        refVForm.value?.resetValidation();
        refVForm.value?.reset();
      });
    }
  });
};

const cancleAction = () => {
  if (isEdit) {
    enabledEdit.value = false;
    refVForm.value?.reset();
    emit('refresh');
    formData.value = data;
  }
  else { router.push(`${PAGE_URL}/list`) }
}

const officerSearch = ref(formData.value.officerName);
const { data: listOfficerData, execute: fetchData }
  = await useApiInternal<any>(
    createUrl(`${PAGE_URL}`, {
      query: {
        search: officerSearch,
        itemsPerPage: 10,
        page: 1,
      },
    }),
  )
const listOfficers = computed(() => listOfficerData.value.data)
const onOfficerSearch = ((e: any) => {
  const search: string = e.data;
  officerSearch.value = search;
  fetchData();
})
</script>

<template>
  <VForm ref="refVForm" @submit.prevent="onSubmit">
    <VCard>
      <VCardItem>
        <VCardTitle>
          <span class="text-h4">{{ isEdit ? 'Hồ sơ thân nhân cán bộ' : 'Thêm mới thân nhân cán bộ' }}</span>
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VCard>
          <VCardItem class="pb-4">
            <div class="d-flex flex-wrap gap-4">
              <VCardTitle>Thông tin</VCardTitle>

              <VSpacer />

              <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
                <VCardActions v-if="isEdit">
                  <VBtn v-if="!enabledEdit" variant="tonal" color="primary-darken-1" @click="enabledEdit = true">
                    Chỉnh sửa
                  </VBtn>

                  <VBtn v-if="enabledEdit" variant="tonal" :color="enabledEdit ? 'seconday' : 'primary'"
                    @click="cancleAction">
                    Hủy
                  </VBtn>

                  <VBtn v-if="enabledEdit" type="submit" variant="tonal" color="primary-darken-1">
                    Lưu chỉnh sửa
                  </VBtn>

                  <VBtn v-if="!enabledEdit" variant="tonal" @click="() => emit('onDelete')">
                    Xóa
                  </VBtn>
                </VCardActions>
              </div>
            </div>
          </VCardItem>

          <VCardText>
            <VRow>
              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.fullname" label="Họ tên" :readonly="!enabledEdit && isEdit"
                  required="required" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="6">
                <VLabel class="mb-1 text-body-2">
                  Giới tính<span class="text-error">(*)</span>
                </VLabel>
                <VRow>
                  <VCol v-for="gender in genders" :key="gender.value">
                    <VBtn v-if="formData.gender === gender.value" color="primary" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.gender = gender.value">
                      {{ gender.title }}
                    </VBtn>
                    <VBtn v-if="formData.gender !== gender.value" color="secondary" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.gender = gender.value">
                      {{ gender.title }}
                    </VBtn>
                    <input type="hidden" v-model="formData.gender" />
                  </VCol>
                </VRow>
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker v-model="formData.dateOfBirth" label="Ngày sinh" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.homeTown" :readonly="!enabledEdit && isEdit" label="Quên quán"
                  placeholder="Xã-Huyện-Tỉnh" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.address" :readonly="!enabledEdit && isEdit" label="Nơi ở hiện nay"
                  placeholder="Xã-Huyện-Tỉnh" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.phone" label="Số điện thoại" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.nation" label="Dân tộc" required="required" :rules="[requiredValidator]"
                  :readonly="!enabledEdit && isEdit" placeholder="Kinh,Tày,Nùng,Mường, ..." />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.address2" :readonly="!enabledEdit && isEdit" label="Nơi DK HKTT"
                  placeholder="Xã-Huyện-Tỉnh" />
              </VCol>

              <VCol cols="12">
                <AppAutocomplete v-model="formData.officerId" :items="listOfficers" item-title="fullname"
                  item-value="id" :readonly="!enabledEdit && isEdit" label="Thân nhân cán bộ"
                  placeholder="Công nhân - Nông dân - Cán bộ - Công chức" @input="onOfficerSearch">
                </AppAutocomplete>
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.workUnit" label="Đơn vị công tác" :readonly="!enabledEdit && isEdit"
                  placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="8">
                <AppTextField v-model="formData.cardId" :readonly="!enabledEdit && isEdit" label="Mã số thẻ"
                  placeholder="Mã số thẻ" />
              </VCol>

              <VCol cols="12" sm="4">
                <VLabel class="mb-1 text-body-2">
                  Trạng thái<span class="text-error">(*)</span>
                </VLabel>
                <VRow>
                  <VCol v-for="status in statuses" :key="status.value">
                    <VBtn v-if="formData.cardStatus === status.value" color="primary" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.cardStatus = status.value">
                      {{ status.title }}
                    </VBtn>
                    <VBtn v-if="formData.cardStatus !== status.value" color="secondary" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.cardStatus = status.value">
                      {{ status.title }}
                    </VBtn>
                    <input type="hidden" v-model="formData.cardStatus" />
                  </VCol>
                </VRow>
              </VCol>

              <VCol cols="12">
                <VLabel class="text-body-2 mb-1">
                  Ghi chú
                </VLabel>
                <TiptapEditor v-model="formData.note" :readonly="!enabledEdit && isEdit" class="border-sm rounded"
                  placeholder="Nhập" />
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VCardActions v-if="!isEdit" class="mt-5 justify-end px-0">
          <VBtn variant="tonal" color="'seconday'" @click="router.push(`${PAGE_URL}/list`)">
            Hủy
          </VBtn>

          <VBtn variant="tonal" type="submit" color="primary-darken-1">
            Lưu
          </VBtn>
        </VCardActions>
      </VCardText>
    </VCard>
  </VForm>
</template>

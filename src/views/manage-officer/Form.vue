<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs';
import { OfficerType, PAGE_URL } from './contants';

interface Emit {
  (e: 'onSubmit', value: any): void;
  (e: 'refresh'): void;
  (e: 'onDelete'): void;
}

interface Props {
  isEdit: boolean;
  data: OfficerType
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

const { isEdit = false, data } = defineProps<Props>();
const router = useRouter()
const emit = defineEmits<Emit>();
const refVForm = ref<VForm>()
const enabledEdit = ref<boolean>(!isEdit)
const formData = ref<OfficerType>({ ...data })

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
</script>

<template>
  <VForm ref="refVForm" @submit.prevent="onSubmit">
    <VCard>
      <VCardItem>
        <VCardTitle>
          <span class="text-h4">{{ isEdit ? 'Hồ sơ cán bộ' : 'Thêm mới cán bộ' }}</span>
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

              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.level" label="Cấp bậc" required="required"
                  :readonly="!enabledEdit && isEdit" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.partyName" label="Đảng-Đoàn thể" required="required"
                  :readonly="!enabledEdit && isEdit" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.position" label="Chức vụ" required="required"
                  :readonly="!enabledEdit && isEdit" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.partyPosition" label="Chức vụ đảng/Đoàn thể" required="required"
                  :readonly="!enabledEdit && isEdit" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.dateStartPosition" :readonly="!enabledEdit && isEdit"
                  label="Ngày bổ nhiệm" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.dateOfBirth" label="Ngày sinh" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.placeOfBirth" label="Nơi sinh" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Xã-Huyện-Tỉnh" />
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
                <AppTextField v-model="formData.familyMember" :readonly="!enabledEdit && isEdit"
                  label="Thành phần gia đình" placeholder="Công nhân - Nông dân - Cán bộ - Công chức" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.jobBefore" :readonly="!enabledEdit && isEdit"
                  label="Nghề nghiệp trước khi tuyển" placeholder="Nghề nghiệp bản thân trước khi tuyển dụng" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.recruitmentDate" label="Ngày tuyển dụng" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.officialDate" label="Ngày tuyển chính thức" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.officialDate2" label="Ngày tuyển chính thức" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.currentUnitDate" label="Ngày vào đơn vị hiện tại"
                  required="required" :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit"
                  placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12">
                <AppTextField v-model="formData.organForRecruitment" label="Cơ quan tuyển" required="required"
                  :rules="[requiredValidator]" :readonly="!enabledEdit && isEdit"
                  placeholder="Công an tỉnh A/ Công an thành phố B" />
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker v-model="formData.dateJoinParty" :readonly="!enabledEdit && isEdit"
                  label="Ngày vào đảng" placeholder="Chọn ngày" />
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

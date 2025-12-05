<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs';
import { DOCUMENT_TYPES, PAGE_URL, PIORTY, ReceivedDocument, SECURITY, STATUSES, WORK_UNIT } from './contants';

interface Emit {
  (e: 'onSubmit', value: any): void;
  (e: 'refresh'): void;
  (e: 'onDelete'): void;
}

interface Props {
  isEdit: boolean;
  showHeading?: boolean;
  viewOnly?: boolean;
  data: ReceivedDocument
}

const { isEdit = false, data, showHeading = true, viewOnly = false } = defineProps<Props>();
const router = useRouter()
const emit = defineEmits<Emit>();
const refVForm = ref<VForm>()
const enabledEdit = ref<boolean>(!isEdit)
const formData = ref<ReceivedDocument>({ ...data })

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
      <VCardItem v-if="showHeading">
        <VCardTitle>
          <span class="text-h4">{{ isEdit ? 'Văn bản đến' : 'Nhập văn bản đến' }}</span>
        </VCardTitle>
      </VCardItem>

      <VCardText>
        <VCard>
          <VCardItem class="pb-4">
            <div class="d-flex flex-wrap gap-4">
              <VCardTitle>Thông tin</VCardTitle>

              <VSpacer />

              <div v-if="!viewOnly" class="app-user-search-filter d-flex align-center flex-wrap gap-4">
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
                <AppSelect v-model="formData.documentType" label="Tài liệu" :items="DOCUMENT_TYPES"
                  :readonly="!enabledEdit && isEdit" required="required" :rules="[requiredValidator]" />
              </VCol>
              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.receivedId" label="Số đến" :readonly="!enabledEdit && isEdit"
                  required="required" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>
              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.receivedDate" label="Ngày nhận" placeholder="Chọn ngày"
                  required="required" :rules="[requiredValidator]" />
              </VCol>
              <VCol cols="12" sm="6">
                <AppAutocomplete v-model="formData.workUnit" multiple label="Đơn vị" placeholder="Chọn"
                  required="required" :items="WORK_UNIT" :rules="[requiredValidator]" />
              </VCol>
              <VCol cols="12" sm="6">
                <AppTextField v-model="formData.documentId" label="Số văn bản" :readonly="!enabledEdit && isEdit"
                  required="required" :rules="[requiredValidator]" placeholder="Nhập" />
              </VCol>
              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="formData.signedDate" label="Ngày ký" placeholder="Chọn ngày"
                  required="required" :rules="[requiredValidator]" />
              </VCol>
              <VCol cols="12">
                <VLabel class="mb-1 text-body-2">
                  Độ khẩn<span class="text-error">(*)</span>
                </VLabel>
                <VRow>
                  <VCol v-for="item in PIORTY" :key="item.value">
                    <VBtn :color="formData.piority === item.value ? 'primary' : 'secondary'" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.piority = item.value">
                      {{ item.title }}
                    </VBtn>
                    <input type="hidden" v-model="formData.piority" />
                  </VCol>
                </VRow>
              </VCol>
              <VCol cols="12">
                <VLabel class="mb-1 text-body-2">
                  Độ mật<span class="text-error">(*)</span>
                </VLabel>
                <VRow>
                  <VCol v-for="item in SECURITY" :key="item.value">
                    <VBtn :color="formData.security === item.value ? 'primary' : 'secondary'" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.security = item.value">
                      {{ item.title }}
                    </VBtn>
                    <input type="hidden" v-model="formData.security" />
                  </VCol>
                </VRow>
              </VCol>
              <VCol cols="12">
                <VLabel class="text-body-2 mb-1">
                  Trích yếu<span class="text-error">(*)</span>
                </VLabel>
                <TiptapEditor v-model="formData.note" :readonly="!enabledEdit && isEdit" class="border-sm rounded"
                  placeholder="Nhập" />
              </VCol>
              <VCol cols="12" sm="6">
                <VLabel class="mb-1 text-body-2">
                  Trạng thái<span class="text-error">(*)</span>
                </VLabel>
                <VRow>
                  <VCol v-for="item in STATUSES" :key="item.value">
                    <VBtn :color="formData.status === item.value ? 'primary' : 'secondary'" class="w-100"
                      :disabled="!enabledEdit && isEdit" @click="formData.status = item.value">
                      {{ item.title }}
                    </VBtn>
                    <input type="hidden" v-model="formData.status" />
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </VCardText>
        </VCard>
        <VCardActions v-if="!isEdit && !viewOnly" class="mt-5 justify-end px-0">
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

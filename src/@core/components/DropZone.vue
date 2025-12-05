<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core';

interface Props {
  label: string,
  accept: string,
  isSubmit: boolean
  btnSubmitText: string,
  limit: number,
}
const props = withDefaults(defineProps<Props>(), {
  label: "Upload file kết quả",
  accept: "xlsx,.csv",
  isSubmit: true,
  btnSubmitText: "Xử lý",
  limit: 10,
});

interface Emit {
  (e: 'onChange', value: any[]): void;
  (e: 'onSubmit', fileList: any[]): void;
}
const emit = defineEmits<Emit>();

const dropZoneRef = ref<HTMLDivElement>();
interface FileData {
  file: File;
  url: string;
}

const fileData = ref<FileData[]>([]);
const { open, onChange } = useFileDialog({ accept: props.accept });
const acceptType = ['text/c', 'applic'];
function onDrop(DroppedFiles: File[] | null) {

  if (((DroppedFiles?.length ?? 0) + fileData.value.length) > props.limit) {
    toast.error(`Số lượng tối đa được phép tải lên là ${props.limit} !`);
    return;
  }

  DroppedFiles?.forEach(file => {
    if (!acceptType.includes(file.type.slice(0, 6))) {
      toast.error(`Chỉ chấp nhận file ${props.accept} !`);
      return;
    }
    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    });
  },
  );

  emit('onChange', fileData.value);
}

onChange((selectedFiles: any) => {
  if (!selectedFiles)
    return;

  if ((selectedFiles.length + fileData.value.length) > props.limit) {
    toast.error(`Số lượng tối đa được phép tải lên là ${props.limit} !`);
    return;
  }

  for (const file of selectedFiles) {
    fileData.value.push({
      file,
      url: useObjectUrl(file).value ?? '',
    });
  }
  emit('onChange', fileData.value);
});

useDropZone(dropZoneRef, onDrop);

const onDelete = (index: number) => {
  fileData.value.splice(index, 1)
  emit('onChange', fileData.value);
}

const onSubmit = () => {
  if (!props.isSubmit) return;
  emit('onSubmit', fileData.value);
}
</script>

<template>
  <div class="flex">
    <div class="w-full h-auto relative">
      <div ref="dropZoneRef" class="cursor-pointer" @click="() => open()">

        <div v-if="fileData.length === 0"
          class="d-flex flex-column justify-center align-center gap-y-2 pa-12 drop-zone rounded">
          <IconBtn variant="tonal" class="rounded-sm">
            <VIcon icon="tabler-upload" />
          </IconBtn>
          <h4 class="text-h4">
            {{ props.label }}
          </h4>
          <VBtn variant="tonal" size="small">
            Không được để trống
          </VBtn>
        </div>

        <div v-else class="d-flex justify-center align-center gap-3 pa-8 drop-zone flex-wrap">
          <VRow class="match-height w-100">
            <template v-for="(item, index) in fileData" :key="index">
              <VCol cols="12" sm="4">
                <VCard :ripple="false" border>
                  <VCardText class="d-flex flex-column" @click.stop>
                    <div class="mt-2">
                      <span class="clamp-text text-wrap">
                        {{ item.file.name }}
                      </span>
                      <span>
                        {{ item.file.size / 1000 }} KB
                      </span>
                    </div>
                  </VCardText>
                  <VCardActions>
                    <VBtn variant="text" block @click.stop="onDelete(index)">
                      Xóa file
                    </VBtn>
                  </VCardActions>
                </VCard>
              </VCol>
            </template>
            <VCol v-if="props.isSubmit" cols="12" class="text-end">
              <VBtn @click.stop="onSubmit">
                {{ props.btnSubmitText }}
              </VBtn>
            </VCol>
          </VRow>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.drop-zone {
  border: 1px dashed rgba(var(--v-theme-on-surface), var(--v-border-opacity));
}
</style>

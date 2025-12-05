<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core';

interface Props {
  label?: string,
  height?: number
}
const props = withDefaults(defineProps<Props>(), {
  label: "Upload ảnh",
  height: 200
});

interface Emit {
  (e: 'onChange', value: any[]): void;
}
const emit = defineEmits<Emit>();

const dropZoneRef = ref<HTMLDivElement>();
interface FileData {
  file: File;
  url: string;
}

const fileData = ref<FileData[]>([]);
const { open, onChange, reset } = useFileDialog({ accept: "image/*" });
const acceptType = ['image/'];
function onDrop(DroppedFiles: File[] | null) {
  DroppedFiles?.forEach(file => {
    if (!acceptType.includes(file.type.slice(0, 6))) {
      toast.error(`Chỉ chấp nhận file ảnh`);
      return;
    }
    if (fileData.value.length > 0) return;
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

  if (fileData.value.length > 0) return;
  if (selectedFiles.length > 1) return;

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
  fileData.value.splice(index, 1);
  reset();
  emit('onChange', fileData.value);
}
</script>

<template>
  <div ref="dropZoneRef" class="cursor-pointer border d-flex justify-center align-center" @click="() => open()">
    <div v-if="fileData.length === 0" class="d-flex flex-column justify-center align-center gap-y-2 rounded"
      style="block-size: 250px;">
      <IconBtn variant="tonal" class="rounded-sm">
        <VIcon icon="tabler-upload" />
      </IconBtn>
      <div class="text-h6">
        {{ props.label }}
      </div>
    </div>

    <template v-else>
      <template v-for="(item, index) in fileData" :key="index">
        <div class="image-container text-center bg-dark overflow-hidden position-relative" style="block-size: 250px;">
          <img :src="item.url" alt="image" class="h-100 w-100" style="object-fit: contain;">
          <VBtn @click.stop="onDelete(index)" class="position-absolute px-1 py-1" size="sm"
            style="inset-block-start: 3px; inset-inline-end: 3px;">
            <VIcon icon="tabler-trash" size="sm" />
          </VBtn>
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.image-container {
  block-size: 250px;
}
</style>

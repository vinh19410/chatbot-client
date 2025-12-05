<template>
  <div ref="dropZoneRef" class="cursor-pointer border d-flex justify-center align-center" @click="() => open()">
    <div v-if="!currentImage" class="d-flex flex-column justify-center align-center gap-y-2 rounded"
      style="block-size: 250px;">
      <IconBtn variant="tonal" class="rounded-sm">
        <VIcon icon="tabler-upload" />
      </IconBtn>
      <div class="text-h6">
        {{ props.label }}
      </div>
    </div>

    <template v-else>
      <div class="image-container text-center bg-dark overflow-hidden position-relative" style="block-size: 250px;">
        <img :src="currentImage.url" alt="image" class="h-100 w-100" style="object-fit: contain;" />
        <VBtn @click.stop="onDelete()" class="position-absolute px-1 py-1" size="sm"
          style="inset-block-start: 3px; inset-inline-end: 3px;">
          <VIcon icon="tabler-trash" size="sm" />
        </VBtn>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core';
import { computed, ref, watch } from 'vue';

interface Props {
  label?: string;
  height?: number;
  base64Image?: string;
}
const props = withDefaults(defineProps<Props>(), {
  label: 'Upload ảnh',
  height: 200
});

interface Emit {
  (e: 'onChange', value: FileData[]): void;
}
const emit = defineEmits<Emit>();

interface FileData {
  file: File;
  url: string;
}

const fileData = ref<FileData[]>([]);
const { open, onChange, reset } = useFileDialog({ accept: 'image/*' });
const dropZoneRef = ref<HTMLDivElement>();

// Giữ chỉ số của hình ảnh hiện tại
const currentImageIndex = ref<number | null>(null);

// Tính toán hình ảnh hiện tại
const currentImage = computed(() => {
  return currentImageIndex.value !== null ? fileData.value[currentImageIndex.value] : null;
});

function onDrop(DroppedFiles: File[] | null) {
  if (DroppedFiles) {
    // Nếu có tệp, thêm tệp đầu tiên vào danh sách fileData
    if (DroppedFiles.length > 0) {
      const file = DroppedFiles[0];
      fileData.value = [{
        file,
        url: useObjectUrl(file).value ?? '',
      }];
      currentImageIndex.value = 0;
      emit('onChange', fileData.value);
    }
  }
}

const handlePaste = (event: ClipboardEvent) => {
  const items = event.clipboardData?.items;
  if (items) {
    const item = items[0];
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        fileData.value = [{
          file,
          url: useObjectUrl(file).value ?? '',
        }];
        currentImageIndex.value = 0;
        emit('onChange', fileData.value);
      }
    }
  }
};

onChange((selectedFiles: FileList | null) => {
  if (selectedFiles) {
    const files = Array.from(selectedFiles);
    if (files.length > 0) {
      // Nếu có tệp mới, thay thế tệp cũ và cập nhật hình ảnh hiện tại
      fileData.value = [{
        file: files[0],
        url: useObjectUrl(files[0]).value ?? '',
      }];
      currentImageIndex.value = 0;
      emit('onChange', fileData.value);
    }
  }
});

onMounted(() => {
  window.addEventListener('paste', handlePaste);
});

onBeforeUnmount(() => {
  window.removeEventListener('paste', handlePaste);
});

useDropZone(dropZoneRef, onDrop);

const onDelete = () => {
  fileData.value = [];
  currentImageIndex.value = null;
  reset();
  emit('onChange', fileData.value); // Thông báo về thay đổi
}

watch(() => props.base64Image, (newBase64Image) => {
  if (newBase64Image) {
    fileData.value = [{
      file: new File([new Uint8Array(atob(newBase64Image.split(',')[1]).split('').map(char => char.charCodeAt(0)))], 'image.png', { type: 'image/png' }),
      url: newBase64Image,
    }];
    currentImageIndex.value = 0;
    emit('onChange', fileData.value); // Thông báo về thay đổi
  } else {
    onDelete();
  }
}, { immediate: true });
</script>

<style lang="scss" scoped>
.image-container {
  block-size: 250px;
}
</style>

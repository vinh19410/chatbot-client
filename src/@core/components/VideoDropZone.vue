<script setup lang="ts">
import { useDropZone, useFileDialog, useObjectUrl } from '@vueuse/core';

interface Props {
  label?: string,
}
const props = withDefaults(defineProps<Props>(), {
  label: "Upload video",
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
const { open, onChange, reset } = useFileDialog({ accept: "video/*" });
const acceptType = ['video/'];
function onDrop(DroppedFiles: File[] | null) {

  DroppedFiles?.forEach(file => {
    if (!acceptType.includes(file.type.slice(0, 6))) {
      toast.error(`Chỉ chấp nhận file video`);
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
  fileData.value.splice(index, 1)
  reset();
  emit('onChange', fileData.value);
}

</script>

<template>
  <div ref="dropZoneRef" class="cursor-pointer border" @click="() => open()">
    <div v-if="fileData.length === 0"
      class="d-flex flex-column justify-center align-center gap-y-2 pa-12 drop-zone rounded">
      <IconBtn variant="tonal" class="rounded-sm">
        <VIcon icon="tabler-upload" />
      </IconBtn>
      <div class="text-h6">
        {{ props.label }}
      </div>
      <VBtn variant="tonal" size="small">
        Click để chọn video
      </VBtn>
    </div>

    <template v-else>
      <template v-for="(item, index) in fileData" :key="index">
        <div class="image-container text-center bg-dark overflow-hidden position-relative" style="block-size: 250px;">
          <video controls class="h-100 w-100" style="object-fit: contain;">
            <source :src="item.url">
          </video>
          <VBtn @click.stop="onDelete(index)" class="position-absolute px-1 py-1" size="sm"
            style="inset-block-start: 3px; inset-inline-end: 3px;">
            <VIcon icon="tabler-trash" size="sm" />
          </VBtn>
        </div>
      </template>
    </template>
  </div>
</template>

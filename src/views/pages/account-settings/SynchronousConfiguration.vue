<script lang="ts" setup>
import axios from 'axios';
import { io } from "socket.io-client";
import { ActiveLoader, useLoading } from 'vue-loading-overlay';
import type { VForm } from 'vuetify/components/VForm';
import { VBtn, VDataTableServer } from 'vuetify/lib/components/index.mjs';

const SERVER_TYPE = {
  GLOBAL: "GLOBAL",
  INDIVIDUAL: "INDIVIDUAL"
}

const serverModal = ref<any>({
  serverSource: '',
  syncType: SERVER_TYPE.GLOBAL,
});

const searchQuery = ref('');
const itemsPerPage = ref<number>(5);
const refForm = ref<VForm>();
const page = ref<number>(1);
const deleteItem: any = ref();
const deleteDialog = ref<boolean>(false);
const $loading = useLoading();
const connectedGlobal = ref(false);
let loaderInstance: ActiveLoader | null = null;
// Headers
const headers: any[] = [
  { title: 'Tên máy chủ', key: 'serverName', sortable: false, width: '40%' },
  { title: 'Địa chỉ', key: 'serverSource', sortable: false, width: '40%' },
  { title: 'Trạng thái', key: 'isConnected', sortable: false, width: '30%' },
  { title: '', key: 'actions', sortable: false, align: 'center', width: '10%' },
];

const baseUrlApi = import.meta.env.VITE_API_BASE_URL_AI;
const baseUrl = baseUrlApi.replace(
  /\/api/g,
  ""
);
const allOptions = [5, 10, 20, 30, 50, 100];
const socket = io(baseUrl);
socket.on("connect", () => {
  console.log("✅ WebSocket connected:", socket.id);
});

socket.on("server-status-updated", (payload: any) => {
  console.log("📡 Server status cập nhật:", payload);
  updateLocalServerStatus(payload.serverId, payload.isConnected);
});

const updateLocalServerStatus = (serverId: string, isConnected: boolean) => {
  const server = allServer.value.find((item: any) => item._id === serverId);
  if (server) {
    if (server.syncType === SERVER_TYPE.GLOBAL && !isConnected) {
      serverModal.value.isConnected = isConnected;
    }
    server.isConnected = isConnected;
  }
};

onMounted(() => {
  getDataServer(true);
})

interface Params {
  itemsPerPage: number;
  page: number;
  search?: {
    syncType: string;
  };
}

const listData = ref<any[]>([]);
const allServer = ref<any[]>([]);
const getDataServer = async (isStart: boolean) => {
  try {
    if (!loaderInstance) {
      loaderInstance = $loading.show();
    }

    const params: Params = {
      itemsPerPage: itemsPerPage.value,
      page: page.value,
      ...(isStart ? {} : {
        search: {
          syncType: SERVER_TYPE.INDIVIDUAL
        }
      })
    };

    const response = await axios.get(`${baseUrlApi}/sync-function/list`, { params });
    const listServer: any[] = response?.data?.data?.items ?? [];

    const dataServers = listServer.filter(item => {
      if (item.syncType === "GLOBAL") {
        serverModal.value = item;
        return false;
      }
      return true;
    });

    allServer.value = [...listServer];
    listData.value = dataServers;
  } catch (error: any) {
    toast.error(`Lỗi: ${error?.response?.data?.message || error?.message || "Không xác định"}`);
  } finally {
    loaderInstance?.hide();
    loaderInstance = null;
    await nextTick();
    await axios.post(`${baseUrlApi}/sync-function/start-check-status`, {
      serverIds: allServer.value.map(item => item._id),
    });
  }
};

const list = computed(() => listData.value);
const total = computed(() => listData.value.length);

const isModuleDrawerVisible = ref(false);
const getInfoServer = async () => {
  try {
    const res = await $fetchApiAiService(`/sync-function/get-one`, {
      method: 'GET',
      query: { syncType: SERVER_TYPE.GLOBAL },
    });

    if (res?.data && Object.keys(res.data).length > 0) {
      serverModal.value = res.data;
      if (!serverModal.value?.isConnected) {
        //toast.error(`Không thể kết nối đến TT dữ liệu !`);
      }
    }
  } catch (error: any) {
    console.error("Lỗi khi lấy thông tin máy chủ:", error);
    toast.error(error?.message || "Không thể tải thông tin máy chủ!");
  }
};

const serverInvModal = ref<any>({
  serverName: '',
  serverSource: '',
  syncType: SERVER_TYPE.INDIVIDUAL,
});

const onSubmit = async () => {
  await handleServerSync(serverModal.value);
  await getInfoServer();
};

const handleServerSyncInd = async () => {
  if (!serverInvModal.value.serverSource || !serverInvModal.value.serverName) {
    return toast.error('Vui lòng nhập thông tin máy chủ!');
  }
  await handleServerSync(serverInvModal.value);
  await getDataServer(false);
};

const handleServerSync = async (modal: any) => {
  try {
    if (!modal.serverSource) {
      return toast.error('Vui lòng nhập thông tin máy chủ!');
    }
    const isEdit = Boolean(modal?._id);
    const path = isEdit ? 'edit' : 'create';

    const response = await $fetchApiAiService(`/sync-function/${path}`, {
      method: 'POST',
      body: modal,
    });

    if (!response.error) {
      toast.success(isEdit ? 'Chỉnh sửa thành công!' : 'Thêm mới thành công!');
      if (modal.syncType === SERVER_TYPE.INDIVIDUAL) {
        isModuleDrawerVisible.value = false;
        resetServerInvModal();
      }
    } else {
      toast.error(isEdit ? 'Chỉnh sửa thất bại!' : 'Thêm mới thất bại!');
    }
  } catch (error: any) {
    const errorMsg = error?.message || error?.response?.data?.message || 'Lỗi không xác định';
    toast.error(`Lỗi! ${errorMsg}`);
  }
};

const resetServerInvModal = () => {
  serverInvModal.value = {
    syncType: SERVER_TYPE.INDIVIDUAL
  };
};

const resetForm = () => {
  nextTick(() => {
    refForm.value?.reset();
    refForm.value?.resetValidation();
  });
}

const deleteItemConfirm = async (_id: string) => {
  try {
    const response = await $fetchApiAiService(`/sync-function/delete-one/${_id}`, {
      method: 'PUT'
    });
    if (response.error == false) {
      toast.success(response.message);
      closeDelete();
      await getDataServer(false);
    } else {
      toast.error('Xóa thất bại !');
    }
  } catch (error: any) {
    toast.error(error.message);
  }
};

const editItem = (item: any) => {
  isModuleDrawerVisible.value = true;
  serverInvModal.value = item;
}

const closeDelete = () => {
  deleteDialog.value = false;
};

const getStatusClass = (item: any) => {
  const status = item?.isConnected;
  if (status === true) return "chip-green";  // Online
  return "chip-default";
};

const changeItemPer = (val: any) => {
  if (!!val) {
    itemsPerPage.value = val;
    page.value = 1;
    onSearch();
  }
}

watch(searchQuery, (newValue) => {
  onSearch();
});

const onSearch = async () => {
  try {
    const response = await $fetchApiAiService(`/sync-function/list`, {
      method: 'GET',
      query: {
        itemsPerPage: itemsPerPage.value,
        page: page.value,
        search: {
          param: searchQuery?.value || '',
          syncType: SERVER_TYPE.INDIVIDUAL
        }
      },
    });
    listData.value = response;
  } catch (error: any) {
    toast.error(error.message);
  }
}

const getStatusText = (item: any) => {
  const status = item?.isConnected;
  if (status === true) return "Online";
  if (status === false) return "Offline";
  return "Unknown";
};

watch(() => isModuleDrawerVisible.value, (newVal) => {
  if (!newVal) {
    resetServerInvModal();
  }
});

</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Trung tâm dữ liệu">
        <VCardText class="pt-2">
          <VForm ref="refForm" @submit.prevent="onSubmit">
            <VRow>
              <VCol md="3" cols="12">
                <div class="d-flex justify-space-between align-stretch">
                  <AppTextField v-model.trim="serverModal.serverSource" placeholder="Nhập máy chủ"
                    label="Thông tin trung tâm dữ liệu" :rules="[requiredValidator]" />
                  <div class="d-flex align-center" style="margin-block: 28px 10px; margin-inline: 10px;">
                    <div :class="serverModal.isConnected ? 'pulse-wrapper' : ''">
                      <VIcon icon="tabler-circle-filled"
                        :color="serverModal.isConnected ? 'rgb(56, 142, 60)' : 'rgb(197 193 193)'" size="22"
                        :title="serverModal.isConnected ? 'Online' : 'Offline'" />
                    </div>
                  </div>
                </div>
              </VCol>
              <VCol cols="12" class="d-flex align-center gap-2">
                <VBtn type="submit">Lưu</VBtn>
                <VBtn color="secondary" variant="tonal" type="reset" @click.prevent="resetForm">
                  Hủy
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <VRow>
    <VCol cols="12">
      <VCard title="Máy chủ khác">
        <VCardText>
          <div class="d-flex align-center pe-2 justify-space-between">
            <div class="w-25">
              <AppTextField v-model="searchQuery" prepend-inner-icon="tabler-search" variant="solo-filled" flat
                hide-details />
            </div>
            <div class="d-flex w-auto align-center ml-auto">
              <VBtn @click="isModuleDrawerVisible = true">
                <VIcon start icon="tabler-plus" />Thêm máy chủ
              </VBtn>
            </div>
          </div>
        </VCardText>
        <VCardText class="pt-2">
          <VDataTableServer :items="list" :items-length="total" :headers="headers" class="text-no-wrap" :hover="true">
            <!-- Actions -->
            <template #item.isConnected="{ item }">
              <VChip :class="getStatusClass(item)" prepend-icon="tabler-circle-filled">
                {{ getStatusText(item) }}
              </VChip>
            </template>

            <template #header.actions>
              <VIcon icon="tabler-filter-filled"></VIcon>
            </template>
            <template #item.actions="{ item }">
              <IconBtn @click="editItem(item)">
                <VIcon icon="tabler-pencil" />
              </IconBtn>

              <IconBtn @click="() => {
                deleteDialog = true;
                deleteItem = item;
              }">
                <VIcon icon="tabler-trash" />
              </IconBtn>

            </template>

            <!-- pagination -->
            <template #bottom>
              <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="total"
                :allOptions="allOptions" @update:itemsPerPage="changeItemPer" :recordNumber="true" />
            </template>
          </VDataTableServer>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
  <VDialog v-model="deleteDialog" max-width="500px">
    <VCard>
      <VCardTitle class="d-block font-weight-regular text-wrap">
        <span class="text-h5">Xóa máy chủ</span>
      </VCardTitle>
      <VCardText>
        Máy chủ <strong>{{ deleteItem.serverName }}</strong> sẽ được xóa ?
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="error" variant="outlined" @click="closeDelete">
          Hủy
        </VBtn>
        <VBtn color="success" variant="elevated" @click="deleteItemConfirm(deleteItem._id)">
          Xác nhận
        </VBtn>
        <VSpacer />
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog v-model="isModuleDrawerVisible" max-width="800px">
    <VCard>
      <VCardTitle>
        <span class="text-h5">{{ serverInvModal._id ? 'Chỉnh sửa' : 'Thêm mới' }} máy chủ</span>
      </VCardTitle>
      <VCardText>
        <VForm ref="form" @submit.prevent="handleServerSyncInd">
          <VCol cols="auto">
            <AppTextField v-model="serverInvModal.serverName" label="Tên máy chủ" required
              :rules="[requiredValidator]" />
          </VCol>
          <VCol cols="auto">
            <AppTextField v-model="serverInvModal.serverSource" label="Địa chỉ" :rules="[requiredValidator]" />
          </VCol>
          <VCardActions>
            <VSpacer />
            <VBtn color="error" variant="outlined" @click="isModuleDrawerVisible = false">Hủy</VBtn>
            <VBtn color="success" variant="elevated" type="submit">Lưu</VBtn>
          </VCardActions>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.chip-green {
  background-color: #edf7ed;
  color: #388e3c;
}

.chip-default {
  background-color: #e0e0e0;
  color: black;
}

.pulse-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  animation: pulse-green-soft 1.5s ease-in-out infinite;
}

@keyframes pulse-green-soft {
  0% {
    box-shadow: 0 0 0 rgba(56, 142, 60, 30%);
  }

  50% {
    box-shadow: 0 0 6px 3px rgba(56, 142, 60, 40%);
  }

  100% {
    box-shadow: 0 0 0 rgba(56, 142, 60, 30%);
  }
}

</style>

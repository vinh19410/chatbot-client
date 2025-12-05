<script setup lang="ts">
import { ref } from "vue";
import {
  VCard,
  VCardText,
  VCardTitle,
  VCol,
  VDialog,
  VForm,
  VLabel,
} from "vuetify/components";

import { useAuthStore } from "@/store/auth";
definePage({
  meta: {
    hideNav: true,
    unauthenticatedOnly: false,
  },
});
const userStore = useAuthStore();
const loaderInstance: ActiveLoader | null = null;
const router = useRouter();

// Headers
const headers: any[] = [
  { title: "STT", key: "stt", sortable: false, width: "10%" },
  { title: "Tên BOT", key: "name", sortable: true, width: "40%" },
  { title: "Mô tả", key: "description", sortable: true, width: "20%" },
  { title: "Ngày tạo", key: "createdAt", sortable: true, width: "30%" },
  { title: "Số nguồn", key: "sourceNumber", sortable: true, width: "20%" },
  { title: "Ngôn ngữ", key: "language", sortable: true, width: "20%" },
  { title: "Trạng thái", key: "status", sortable: true, width: "20%" },
  {
    title: "Thao tác",
    key: "actions",
    sortable: false,
    align: "center",
    width: "10%",
  },
];

const baseUrlApi = import.meta.env.VITE_API_BASE_URL_AI;

const baseUrl = baseUrlApi.replace(/\/api/g, "");

const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const allOptions = ref([10, 20, 50, 100]);

const getStatusClass = (item: any) => {
  const status = item?.sources?.length > 0;
  if (status === true) return "chip-green";

  return "chip-default";
};

const getStatusText = (item: any) => {
  const status = item?.sources?.length > 0;
  if (status === true) return "Đang hoạt động";

  return "Chưa có nguồn";
};

const changeItemPer = async (value: number) => {
  itemsPerPage.value = value;
  page.value = 1;
  await getBots();
};

const getBots = async () => {
  try {
    const res = await $fetchApiAiService("/bots/list", {
      method: "POST",
      body: {
        page: page.value,
        limit: itemsPerPage.value,
        userId: userStore.userInfo?.id,
      },
    });

    if (res?.data) {
      list.value = res.data.bots || [];
      total.value = res.data.total || 0;
    } else {
      toast.error(`Error fetching bots: ${res.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error :", error);
    toast.error(`Error : ${error.message || "Unknown error"}`);
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const showDialogDeleteBot = ref(false);
const idSeletedBot = ref("");

const confirmDeleteBot = (id: string) => {
  showDialogDeleteBot.value = true;
  idSeletedBot.value = id;
};

const handleDeleteBot = async () => {
  try {
    const res = await $fetchApiAiService("/bots/delete", {
      method: "POST",
      body: {
        id: idSeletedBot.value,
      },
    });

    if (res?.data) {
      toast.success("Xóa BOT thành công");
      await getBots();
    } else {
      toast.error(`Error deleting bot: ${res.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
    toast.error(`Error : ${error.message || "Unknown error"}`);
  } finally {
    showDialogDeleteBot.value = false;
  }
};

watch(
  () => showDialogDeleteBot.value,
  (newId) => {
    if (!newId) idSeletedBot.value = "";
  }
);

const onRowClick = (event, data) => {
  router.push(`/bot-view/${data?.item._id}`);
};
const authStore = useAuthStore()

onBeforeMount(async () => {
  const user = {_id:'689da208873c455bbc070708'}
  authStore.setCookieUser(user)
  socket.emit('register', user._id)
  await getBots();
});
</script>

<template>
  <VCard class="overflow-visible">
    <VCardTitle>
      <div class="d-flex justify-space-between align-center">
        <h2 class="text-h6">Danh sách BOT</h2>
        <VBtn
          color="primary"
          variant="tonal"
          to="/bot-create"
          prepend-icon="tabler-plus"
        >
          Tạo BOT
        </VBtn>
      </div>
    </VCardTitle>
    <VCardText>
      <VDataTableServer
        :items="list"
        :items-length="total"
        :headers="headers"
        class="text-no-wrap"
        :hover="true"
        no-data-text="Không có dữ liệu"
        :expand-on-click="true"
        @click:row="onRowClick"
      >
        <!-- Actions -->
        <template #item.stt="{ index }">
          <span>{{ (page - 1) * itemsPerPage + index + 1 }}</span>
        </template>
        <template #item.status="{ item }">
          <VChip
            :class="getStatusClass(item)"
            prepend-icon="tabler-circle-filled"
          >
            {{ getStatusText(item) }}
          </VChip>
        </template>

        <template #item.language="{ item }">
          <span class="text-capitalize">
            {{
              LANGS.find((x) => x.value === item.language)?.title ||
              "Không xác định"
            }}
          </span>
        </template>

        <template #item.sourceNumber="{ item }">
          <span class="text-capitalize">
            {{
              item?.sources?.length || 0
            }}
          </span>
        </template>

        <template #item.description="{ item }">
          <p
            class="text-body-1 text-truncate"
            style="width: 350px; margin: 0px"
            :title="item?.description"
          >
            {{ item?.description }}
          </p>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex flex-column align-end">
            <div class="d-flex align-center delete-cons">
              <VMenu>
                <template #activator="{ props }">
                  <VBtn
                    v-bind="props"
                    size="20"
                    icon
                    variant="text"
                    title="Tùy chọn"
                    class="me-1"
                  >
                    <VIcon icon="tabler-dots-vertical" size="20" />
                  </VBtn>
                </template>

                <VList density="compact">
                  <VListItem @click="() => $router.push(`/chat-web/${item._id}`)">
                    <VListItemTitle>
                      <div class="d-flex justify-start align-center gap-2">
                        <VIcon size="20" icon="tabler-message" /> Chat
                      </div>
                    </VListItemTitle>
                  </VListItem>
                  <VListItem
                    @click="() => $router.push(`/bot-view/${item._id}`)"
                  >
                    <VListItemTitle>
                      <div class="d-flex justify-start align-center gap-2">
                        <VIcon size="20" icon="tabler-eye" /> Xem chi tiết
                      </div>
                    </VListItemTitle>
                  </VListItem>

                  <VListItem
                    @click="() => $router.push(`/bot-edit/${item._id}`)"
                  >
                    <VListItemTitle>
                      <div class="d-flex justify-start align-center gap-2">
                        <VIcon size="20" icon="tabler-pencil" /> Chỉnh sửa
                      </div>
                    </VListItemTitle>
                  </VListItem>

                  <VDivider />

                  <VListItem @click="() => {}">
                    <VListItemTitle>
                      <div
                        class="d-flex justify-start align-center gap-2"
                        style="color: red"
                        @click="confirmDeleteBot(item._id)"
                      >
                        <VIcon size="20" icon="tabler-trash" color="error" />
                        Xóa BOT
                      </div>
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VMenu>
            </div>
          </div>
        </template>

        <template #item.createdAt="{ item }">
          <span>{{ formatDate(item.createdAt) }}</span>
        </template>
        <!-- pagination -->
        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="total"
            :all-options="allOptions"
            :record-number="true"
            @update:items-per-page="changeItemPer"
          />
        </template>
      </VDataTableServer>
    </VCardText>
  </VCard>
  <VDialog v-model="showDialogDeleteBot" max-width="400" persistent>
    <VCard>
      <VCardTitle class="text-h6"> Xác nhận xóa BOT </VCardTitle>
      <VCardText>
        <p>
          Bạn có chắc chắn muốn xóa BOT này không? Hành động này sẽ không thể
          hoàn tác và tất cả dữ liệu liên quan sẽ bị xóa.
        </p>
      </VCardText>
      <template #actions>
        <VSpacer />

        <VBtn @click="showDialogDeleteBot = false"> Hủy </VBtn>

        <VBtn color="error" @click="handleDeleteBot"> Xác nhận </VBtn>
      </template>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.chip-green {
  background-color: #edf7ed;
  color: #388e3c;
}

.chip-default {
  background-color: #ffffff;
  color: red;
}
</style>

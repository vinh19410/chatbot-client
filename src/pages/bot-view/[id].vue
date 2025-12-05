<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import axios from "axios";
import { useAuthStore } from "@/store/auth";
import Chat from "@/pages/apps/chat/chat.vue";
import ClipboardJS from "clipboard";

const router = useRouter();
const route = useRoute();
definePage({
  meta: {
    hideNav: true,
    unauthenticatedOnly: false,
  },
});
const model = ref<any>({
  _id: null,
  name: "",
  description: "",
  model: "",
  lang: "",
  prompt: "",
  isPublic: false,
  temperature: 2,
});

const store = useAuthStore();
const prompt = ref("");
const temperature = ref(2);
const modeEdit = ref(false);
const baseUrlApi = import.meta.env.VITE_API_BASE_URL_AI;
const idBot = ref<string | null>(null);
const dialogChatBot = ref<boolean>(false);
const copyBtn = ref<HTMLElement | null>(null);
let clipboard: ClipboardJS | null = null;
const getOne = async (id: string) => {
  try {
    const res = await $fetchApiAiService(`/bots/get-one/${id}`, {
      method: "GET",
    });

    if (res?.data) {
      model.value = res.data;
      prompt.value = res.data.prompt || "";
      temperature.value = res.data.temperature || 2;
      model.value.model = res.data.model;
      model.value.lang = res.data.language;
      items.value = res?.data?.sources?.slice()
        .reverse().map((item: any, index: number) => ({
          ...item,
          stt: (page.value - 1) * itemsPerPage.value + index + 1,
          updatedAt: new Date(item.updatedAt).toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
        })) || [];
      totalItems.value = res?.data?.source?.length || 0;
    }
  } catch (error) {
    console.error("Error fetching bot:", error);
    toast.error("Không có BOTS được tìm thấy");
    setTimeout(() => {
      router.push("/bots");
    }, 2000);
  }
};

const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const items = ref<any[]>([]);
const loading = ref(false);

const headers = [
  { title: "STT", value: "stt", sortable: false, width: "5%" },
  { title: "Nguồn", value: "type", sortable: false, width: "15%" },
  { title: "Tiêu đề", value: "title", width: "20%" },
  { title: "Số trang", value: "pageCount", width: "5%" },
  { title: "URL/File", value: "url", width: "20%" },
  { title: "Trạng thái", value: "status", width: "15%" },
  { title: "Ngày cập nhật", value: "updatedAt", width: "10%" },

  { title: '', value: 'actions', sortable: false, width: '10%' },
];

const fetchSources = async () => {
  loading.value = true;
  try {
    items.value = [];
    totalItems.value = 0;

    const res = await $fetchApiAiService("/source/list", {
      method: "GET",
      query: {
        botId: model.value._id,
        page: page.value,
        limit: itemsPerPage.value,
      },
    });

    console.log("Response:", res);

    if (res?.data) {
      items.value = res.data.sources.map((item: any, index: number) => ({
        ...item,
        stt: (page.value - 1) * itemsPerPage.value + index + 1,
        updatedAt: new Date(item.updatedAt).toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
      }));
      totalItems.value = res.data.total;
    } else {
      toast.error(`Error fetching sources: ${res.message || "Unknown error"}`);
    }
  } finally {
    loading.value = false;
  }
};

const getStatusClass = (item: any) =>
  item?.sources?.length > 0 ? "chip-green" : "chip-default";
const getStatusText = (item: any) =>
  item?.sources?.length > 0 ? "Đang hoạt động" : "Chưa có nguồn";

const handleDeleteBot = async (id: string) => {
  try {
    const res = await $fetchApiAiService("/bots/delete", {
      method: "POST",
      body: {
        id,
      },
    });

    if (res?.data) {
      toast.success("Xóa BOT thành công");
      setTimeout(() => {
        router.push("/bots");
      });
    } else {
      toast.error(`Error deleting bot: ${res.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error deleting bot:", error);
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

const editSource = (item: any) => {
  console.log("Edit", item);
};

const deleteSource = async (item: any) => {
  console.log("Delete", item);
  try {
    const response = await $fetchApiAiServiceNoLoading('/source/delete', {
      method: 'POST',
      body: {
        id: item._id
      },
    });

    if (response?.data) {
      toast.success(response?.message)
      await fetchSources()
    }
  } catch (error) {
    toast.error(error?.message)
  }
};

const addSource = ref(false);

const dialog = ref(false);

const urls = ref([{ link: "", title: "" }]);

const refreshFrequency = ref(0);

const addUrlField = () => {
  urls.value.push({ link: "", title: "" });
};

const removeUrlField = (index: any) => {
  urls.value.splice(index, 1);
};

const getUrlError = (link: any) => {
  if (!link) return "";
  if (!/^https?:\/\/.+/i.test(link)) return "URL không hợp lệ";
  if (link.includes("tonten.vn")) return "Nguồn URL đã tồn tại!";

  return "";
};

const autoGenerateTitle = async (index: any) => {
  const link = urls.value[index].link;
  if (link && !urls.value[index].title) {
    try {
      const res = await $fetchApiAiServiceNoLoading('/source/get-title',
        { method: 'POST', body: { link } },
      );
      if (res.data && res.data?.title)
        urls.value[index].title = res.data?.title;
      else toast.error("Không thể tự động lấy tiêu đề từ URL này");
    } catch (error) {
      console.error("Error generating title:", error);
    }
  }
};

const dialogDocument = ref(false);
const dialogText = ref(false)
const docData = ref({
  title: "",
  file: null,
  private: false,
});

const handleFileChange = (event: any) => {
  const file = event.target.files[0];
  if (file) docData.value.file = file;
};

const toBase64 = (
  file: File
): Promise<{ base64: string; name: string; type: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve({
        base64: (reader.result as string).split(",")[1],
        name: file.name,
        type: file.type,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const submitSource = async (payload: any, onSuccess: any) => {
  try {
    const res = await $fetchApiAiService("/source/create", {
      method: "POST",
      body: payload,
    });

    if (res?.data) {
      toast.success("Thêm nguồn thành công");
      if (onSuccess) await onSuccess(res.data);
    } else {
      toast.error(`Error: ${res.message || "Unknown error"}`);
    }
  } catch (error: any) {
    console.error("Error submitting source:", error);
    toast.error(`Error: ${error.message || "Unknown error"}`);
  }
};

const submitUrls = async () => {
  if (urls.value.length === 0) {
    toast.error("Vui lòng thêm ít nhất một nguồn URL.");
    return;
  }

  const validUrls = urls.value.filter((url) => url.link && url.title);
  if (validUrls.length === 0) {
    toast.error("Vui lòng nhập ít nhất một URL hợp lệ với tiêu đề.");
    return;
  }

  const payload = {
    urls: validUrls,
    refreshInterval: refreshFrequency.value,
    botId: model.value._id,
    type: "url",
    userId: store.userInfo.id,
  };

  await submitSource(payload, async () => {
    dialog.value = false;
    await fetchSources();
    urls.value = [{ link: "", title: "" }];
    refreshFrequency.value = 0;
  });
};

const allowedTypes = [
  "application/pdf", // PDF
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/vnd.ms-powerpoint", // PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "text/plain", // TXT
  "text/html", // HTML
];
// submit Document
const submitDocument = async () => {
  if (!docData.value.file || docData.value.file.length === 0) {
    toast.error("Vui lòng nhập chọn tệp tài liệu.");
    return;
  }

  const file = docData.value.file?.[0];
  if (file.size > 5 * 1024 * 1024) {
    toast.error("Tệp quá lớn, dung lượng tối đa cho phép là 5MB.");
    return;
  }

  if (!allowedTypes.includes(file.type)) {
    toast.error("Định dạng tệp không được hỗ trợ. Vui lòng chọn PDF, Word, Excel, PowerPoint, TXT hoặc HTML.");
    return;
  }
  const fileData = await toBase64(file);

  const payload = {
    title: fileData.name,
    file: {
      name: fileData.name,
      mimeType: fileData.type,
      type: fileData.type,
      base64Str: fileData.base64,
    },
    isPrivate: docData.value.private,
    botId: model.value._id,
    userId: store.userInfo.id,
    type: "document",
  };

  await submitSource(payload, async () => {
    dialogDocument.value = false;
    await fetchSources();
    docData.value = { title: "", file: null, private: false };
  });
};

// submit Text
const sourceText = ref(null)
const submitText = async () => {
  if (!sourceText.value) {
    toast.error("Vui lòng nhập tiêu đề và chọn tệp tài liệu.");
    return;
  }

  const payload = {
    sourceText: sourceText.value,
    botId: model.value._id,
    userId: store.userInfo.id,
    type: "text",
  };

  await submitSource(payload, async () => {
    dialogText.value = false;
    await fetchSources();
    sourceText.value = null
  });
};

const getStatusClassProccess = (item: any) => {
  if (item.status === "pending") return "chip-gray";
  if (item.status === "success") return "chip-green";

  return "chip-red";
};

const getStatusTextsProccess = (item: any) => {
  if (item.status === "pending") return "Đang xử lý";
  if (item.status === "success") return "Hoàn thành";

  return "Lỗi";
};

const dialogScript = ref(false)
const scriptCode = ref('')

const copyScript = async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(scriptCode.value);
      toast.success("Đã copy mã nhúng!");
    }
  } catch (err) {
    console.error(err);
    toast.error("Copy thất bại: " + err);
  }
};

const genScriptCode = (id: string) => {
  const baseUrl = window.location.origin;
  scriptCode.value = `<script src="${baseUrl}/widget.js?botId=${id}"><\/script>`;
};

const reloadData = async () => {
  const id = route.params?.id as string;
  if (id) {
    await getOne(id);
    //await fetchSources();
    idBot.value = !idBot.value ? id : idBot.value;
    modeEdit.value = true;
    genScriptCode(id)
  }
};

const handleChatBot = () => {
  router.push(`/chat-web/${idBot.value}`)
};

const input = ref("");
const typing = ref(false);

const optionBots = ref(["ChatBot", "ChatDocs"]);

onBeforeMount(() => {
  reloadData();
});
const clipboardText = computed(() => scriptCode.value)

onMounted(() => {
  socket.on("createSource", async (status) => {
    console.log("create Source", status);
    await fetchSources();
  });

  clipboard = new ClipboardJS(".copy-btn", {
    text: () => {
      console.log("copy value:", scriptCode.value)
      return `Mã nhúng: ${scriptCode.value}`
    }
  })

  clipboard.on("success", () => toast.success("Đã copy mã nhúng!"))
  clipboard.on("error", () => toast.error("Copy thất bại!"))
});

const reloadPage = () => {
  window.location.href = `/bots`;
};

onBeforeUnmount(() => {
  if (clipboard) clipboard.destroy();
});

const baseUrl = baseUrlApi.replace(/\/api$/, '')
const attachmentSelected = ref(null)
const downloadAttachment = async (attachment: any) => {
  try {
    attachmentSelected.value = attachment._id
    const response = await fetch(`${baseUrl}/${attachment.filePath}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok)
      throw new Error(`Lỗi HTTP: ${response.status}`)

    const blob = await response.blob()

    const fileName = attachment.fileName

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  catch (error) {
    toast.error(`Lỗi khi tải hình ảnh: ${error}`)
  } finally {
    attachmentSelected.value = null
  }
}
</script>

<template>
  <VRow align="stretch">
    <VCol cols="12" md="6" class="h-100">
      <VCard class="pa-4 h-100 d-flex flex-column">
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="d-flex gap-2">
            <IconBtn @click="reloadPage">
              <VIcon icon="tabler-arrow-back" />
            </IconBtn>
            <VChip :class="getStatusClass(model)" class="mb-3">
              {{ getStatusText(model) }}
            </VChip>
          </div>
          <div class="d-flex gap-2">
            <!-- <VBtn @click="() => $router.push(`/chat-web/${idBot}`)" prepend-icon="tabler-message" v-if="items?.length > 0">
              Chat
            </VBtn> -->
            <IconBtn variant="tonal" @click="$router.push(`/bot-edit/${model._id}`)">
              <VIcon icon="tabler-pencil" />
            </IconBtn>
            <IconBtn variant="tonal" @click="handleDeleteBot(model._id)">
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
        </div>
        <div class="d-flex flex-column align-center">
          <VAvatar color="primary" size="40">
            <VIcon icon="tabler-lego" />
          </VAvatar>
          <h4 class="ml-3 text-h5 font-weight-bold">
            {{ model.name || "Unknown Bot" }}
          </h4>
        </div>
        <p class="text-caption text-center mt-2">
          {{ model.description || "No description provided." }}
        </p>

        <VRow class="mt-3 pa-5" justify="space-between" align="center" dense>
          <VCol cols="6">
            <VIcon start :icon="model.isPublic ? 'tabler-eye' : 'tabler-eye-off'" />
            {{ model.isPublic ? "Công khai" : "Riêng tư" }}
          </VCol>
          <VCol cols="6">
            <VIcon start icon="tabler-calendar" />
            {{ formatDate(model.createdAt) }}
          </VCol>
          <VCol cols="6">
            <VIcon start icon="tabler-robot" />
            {{ model.model || "Unknown Model" }}
          </VCol>
          <VCol cols="6">
            <VIcon start icon="tabler-world" />
            {{
              LANGS.filter((x) => x.value === model.lang)[0]?.title ||
              "Unknown Language"
            }}
          </VCol>
        </VRow>
      </VCard>
    </VCol>
    <VCol cols="12" md="6" class="h-100">
      <VCard class="pa-4 h-100" title="Tính năng">
        <VRow dense no-gutters class="d-flex flex-wrap" style="gap: 16px">
          <VCard class="pa-3" style="width: 230px; cursor: pointer;" @click="handleChatBot">
            <div class="d-flex flex-grow-1 mb-5">
              <VIcon size="28" icon="tabler-message" color="primary" />
            </div>
            <div class="d-flex justify-space-between align-center flex-grow-1">
              <span class="font-weight-medium text-body-1">Chat</span>
              <VIcon icon="tabler-chevron-right" size="24" class="ml-2" color="primary" />
            </div>
          </VCard>

          <!-- <VCard class="pa-3" style="width: 230px; cursor: pointer;" @click="handleChatBot">
            <div class="d-flex flex-grow-1 mb-5">
              <VIcon size="28" icon="tabler-folder" color="primary" />
            </div>
            <div class="d-flex justify-space-between align-center flex-grow-1">
              <span class="font-weight-medium text-body-1">Lịch sử Chat</span>
              <VIcon icon="tabler-chevron-right" size="24" class="ml-2" color="primary" />
            </div>
          </VCard> -->
          <VCard class="pa-3" style="width: 230px; cursor: pointer;" @click="dialogScript = true">
            <div class="d-flex flex-grow-1 mb-5">
              <VIcon size="28" icon="tabler-device-desktop-code" color="primary" />
            </div>
            <div class="d-flex justify-space-between align-center flex-grow-1">
              <span class="font-weight-medium text-body-1">Nhúng tích hợp</span>
              <VIcon icon="tabler-chevron-right" size="24" class="ml-2" color="primary" />
            </div>
          </VCard>
        </VRow>
      </VCard>
    </VCol>
  </VRow>

  <!-- DANH SÁCH NGUỒN -->
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardTitle class="d-flex justify-space-between align-center">
          <span class="text-h6">Nguồn</span>
          <VBtn v-if="!addSource" color="#8e44ad" class="text-white" prepend-icon="tabler-plus"
            @click="addSource = true">
            Thêm nguồn
          </VBtn>
          <VBtn v-else color="#8e44ad" class="text-white" prepend-icon="tabler-x" @click="addSource = false">
            Hủy
          </VBtn>
        </VCardTitle>
        <VExpandTransition>
          <div v-if="addSource" class="mx-3 mt-2">
            <span class="text-h6 mb-2" style="color: rgb(var(--v-theme-primary))">
              Chọn loại nguồn cần thêm
            </span>
            <VRow>
              <VCol cols="auto">
                <VCard variant="elevated" color="primary" max-width="250" style="height: 15vh; cursor: pointer"
                  @click="dialog = true">
                  <VCardTitle style="color: white; font-size: 15px" class="d-flex justify-space-between">
                    <span>URL</span>
                    <VIcon icon="tabler-link" />
                  </VCardTitle>
                  <VCardText>Trả lời nội dung từ 1 webpage</VCardText>
                </VCard>
              </VCol>
              <VCol cols="auto">
                <VCard variant="elevated" color="primary" max-width="250" style="height: 15vh; cursor: pointer"
                  @click="dialogDocument = true">
                  <VCardTitle style="color: white; font-size: 15px" class="d-flex justify-space-between">
                    <span>Document</span>
                    <VIcon icon="tabler-file" />
                  </VCardTitle>
                  <VCardText>Tải lên tệp tài liệu có chứa văn bản (DOCX, XLSX, PDF, TXT,
                    PPTX, HTML)</VCardText>
                </VCard>
              </VCol>
              <VCol cols="auto">
                <VCard variant="elevated" color="primary" max-width="250" style="height: 15vh; cursor: pointer"
                  @click="dialogText = true">
                  <VCardTitle style="color: white; font-size: 15px" class="d-flex justify-space-between">
                    <span>Văn bản</span>
                    <VIcon icon="tabler-clipboard" />
                  </VCardTitle>
                  <VCardText>Văn bản đã sao chép</VCardText>
                </VCard>
              </VCol>
            </VRow>
          </div>
        </VExpandTransition>
        <VCardText>
          <VDataTableServer v-model:page="page" v-model:items-per-page="itemsPerPage" :headers="headers" :items="items"
            :loading="loading" loading-text="Đang tải dữ liệu..." :items-length="totalItems" class="mt-2"
            no-data-text="Không có dữ liệu">
            <template #no-data>
              <div class="text-center py-6">
                <VIcon size="48" color="grey"> tabler-file-x </VIcon>
                <div class="text-caption mt-2">Danh sách nguồn trống!</div>
                <div class="text-caption">
                  Hãy ấn vào Thêm nguồn để thêm mới nội dung mà bạn muốn BOT có
                  thể đọc và trả lời các câu hỏi.
                </div>
              </div>
            </template>

            <template #item.type="{ item }">
              <span>{{ item.type.toUpperCase() }}</span>
            </template>

            <template #item.title="{ item }">
              <div style="width: 200px">
                <p v-if="item.type === 'url'" class="mb-0 text-truncate text-body-2"
                  :title="item.urls[0].title || 'Không có tiêu đề'">
                  {{ item.urls[0].title || "Không có tiêu đề" }}
                </p>
                <p v-else-if="item.type === 'document' || item.type === 'text'" class="mb-0 text-truncate text-body-2"
                  :title="item.title || 'Tài liệu không có tên'">
                  {{ item.title || "Tài liệu không có tên" }}
                </p>
              </div>
            </template>

            <template #item.url="{ item }">
              <div v-if="item.type === 'url'" style="width: 300px">
                <p v-for="x in item.urls" :key="x.link" class="mb-0 text-truncate text-body-2"
                  :title="x.link || 'Không có URL'">
                  <a :href="x.link" target="_blank" class="text-primary" rel="noopener noreferrer"
                    style="text-decoration: none">
                    {{ x.link || "Không có URL" }}
                  </a>
                </p>
              </div>
              <p v-else-if="item.type === 'document'" class="mb-0 text-truncate text-body-2"
                :title="item.fileName || 'Tài liệu không có tên'">
                {{ item.fileName || "Tài liệu không có tên" }}
              </p>
            </template>

            <template #item.status="{ item }">
              <VChip :class="getStatusClassProccess(item)" class="text-capitalize">
                {{ getStatusTextsProccess(item) }}
              </VChip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex gap-2">
                <VBtn icon size="small" color="primary" @click="downloadAttachment(item)">
                  <VProgressCircular color="primary" indeterminate
                    v-if="attachmentSelected && attachmentSelected === item._id"></VProgressCircular>
                  <VIcon icon="tabler-download" v-else />
                </VBtn>
                <VBtn icon size="small" color="error" @click="deleteSource(item)">
                  <VIcon icon="tabler-trash" />
                </VBtn>

              </div>
            </template>
          </VDataTableServer>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>

  <VDialog v-model="dialog" max-width="700">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Thêm nguồn URL</span>
        <VBtn icon variant="tonal" color="secondary" @click="dialog = false">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow class="mb-1">
          <VCol cols="12" md="5
          ">
            <strong>Link liên kết</strong>
          </VCol>
          <VCol cols="12" md="5
          ">
            <strong>Tiêu đề nguồn</strong>
          </VCol>
          <VCol cols="12" md="2" />
        </VRow>

        <PerfectScrollbar tag="ul" class="d-flex flex-column gap-y-1 list-none"
          :options="{ wheelPropagation: false, suppressScrollX: true }" :style="{ maxHeight: '200px' }">
          <li v-for="(url, index) in urls" :key="index"
            class="chat-contact cursor-pointer d-flex align-center justify-content-between gap-2 mb-1">
            <VRow>
              <VCol cols="12" md="5">
                <AppTextField v-model="url.link" density="compact" placeholder="Nhập link liên kết"
                  :error-messages="getUrlError(url.link)" @blur="autoGenerateTitle(index)" />
              </VCol>
              <VCol cols="12" md="5">
                <AppTextField v-model="url.title" density="compact" placeholder="Nhập tiêu đề" />
              </VCol>
              <VCol cols="12" md="2" class="d-flex justify-center gap-2">
                <VBtn icon="tabler-plus" variant="tonal" color="primary" size="x-small" @click="addUrlField" />
                <VBtn v-if="urls.length > 1" icon="tabler-trash" color="error" variant="tonal" size="x-small"
                  @click="removeUrlField(index)" />
              </VCol>
            </VRow>
          </li>
        </PerfectScrollbar>

        <!-- Refresh Frequency -->
        <!--
          <div class="mt-5 mb-2 text-subtitle-2 font-weight-bold">
          Lịch refresh URL
          </div>
        -->
        <!--
          <VSelect
          v-model="refreshFrequency"
          :items="[
          { text: 'Không tự động cập nhật', value: -1 },
          { text: 'Hàng ngày', value: 0 },
          { text: 'Hàng tuần', value: 1 },
          { text: 'Hàng tháng', value: 2 },
          ]"
          item-title="text"
          item-value="value"
          label="Chọn lịch"
          density="compact"
          />
        -->
      </VCardText>

      <!-- Footer buttons -->
      <VCardActions class="justify-end">
        <VBtn variant="outlined" color="grey" @click="dialog = false">
          Huỷ
        </VBtn>
        <VBtn prepend-icon="tabler-plus" variant="flat" @click="submitUrls">
          Thêm nguồn
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog v-model="dialogDocument" max-width="650">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Thêm Document</span>
        <VBtn icon variant="tonal" color="secondary" @click="dialogDocument = false">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow>
          <!-- <VCol cols="12">
            <AppTextField v-model="docData.title" label="Tiêu đề nguồn" placeholder="Nhập tiêu đề tài liệu"
              density="compact" :rules="[(v) => !!v || 'Bắt buộc nhập tiêu đề']" required />
          </VCol> -->

          <VCol cols="12" class="upload-file-panel">
            <VFileInput v-model="docData.file" label="Kéo thả hoặc tải lên tài liệu"
              accept=".pdf,.docx,.pptx,.txt,.xlsx,.csv,.json,.html, .doc, .xls" show-size
              placeholder="Chọn file tài liệu" density="compact" :rules="[(v) => !!v || 'Vui lòng chọn file']" />
          </VCol>
        </VRow>
      </VCardText>

      <!-- Footer -->
      <VCardActions class="justify-end">
        <VBtn variant="outlined" color="grey" @click="dialogDocument = false">
          Huỷ
        </VBtn>
        <VBtn color="primary" variant="flat" prepend-icon="tabler-plus" @click="submitDocument">
          Thêm nguồn
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog v-model="dialogText" max-width="850">
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Dán văn bản đã sao chép</span>
        <VBtn icon variant="tonal" color="secondary" @click="dialogText = false">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VRow>
          <AppTextarea v-model="sourceText" label="Dán văn bản đã sao chép vào bên dưới để tải lên dưới dạng một nguồn"
            placeholder="Dán văn bản vào đây" rows="10" :rules="[requiredValidator]" />
        </VRow>
      </VCardText>

      <!-- Footer -->
      <VCardActions class="justify-end">
        <VBtn variant="outlined" color="grey" @click="dialogText = false">
          Huỷ
        </VBtn>
        <VBtn color="primary" variant="flat" prepend-icon="tabler-plus" @click="submitText">
          Thêm nguồn
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <VDialog v-model="dialogScript" max-width="800">
    <VCard>
      <!-- Header -->
      <VCardTitle class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">Sao chép mã nhúng</span>
        <VBtn icon variant="tonal" color="secondary" @click="dialogScript = false">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VCardTitle>

      <!-- Content -->
      <VCardText>
        <div class="d-flex justify-space-between align-center gap-2" no-gutters>
          <AppTextField v-model="scriptCode" variant="outlined" density="comfortable" class="w-100" />
          <!-- <VBtn color="primary" variant="flat" class="copy-btn">
            Copy
          </VBtn> -->
        </div>
      </VCardText>

      <!-- Footer -->
      <VCardActions class="justify-end">
        <VBtn variant="outlined" color="grey" @click="dialogScript = false">
          Huỷ
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

</template>

<style scoped lang="scss">
.chip-green {
  background-color: #edf7ed;
  color: #388e3c;
}

.chip-default {
  background-color: #ffffff;
  color: red;
}

.chip-red {
  background-color: #ffebee;
  color: #d32f2f;
}

.chip-gray {
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.v-row {
  align-items: stretch !important;
}

.v-col {
  display: flex;
  flex-direction: column;
}
</style>
<style lang="scss">
.upload-file-panel .v-input__control {
  height: 80px !important;
}
</style>

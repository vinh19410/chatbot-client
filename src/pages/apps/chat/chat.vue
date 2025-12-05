<script lang="ts" setup>
import "emoji-mart-vue-fast/css/emoji-mart.css";
import moment from "moment";
import axios from "axios";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";
import { VDivider, VForm } from "vuetify/lib/components/index.mjs";
import { useDisplay } from "vuetify";
import ChatLog from "@/views/apps/chat/ChatLog.vue";
import { useAuthStore } from "@/store/auth";
import { socket } from "@/utils/socket";

const props = defineProps<{
  botId: any;
  name?: string;
  description?: string;
  sources?: any;
  // isNew?: boolean;
}>();

const isLeftSidebarOpen = ref(false)

const { name: currentBreakpoint, mdAndDown, lgAndUp } = useDisplay();

const _mobileBreakpoint = ref<boolean>(mdAndDown.value);

watch(currentBreakpoint, (newVal, oldVal) => {
  console.log("Breakpoint thay đổi từ", oldVal, "→", newVal);
  _mobileBreakpoint.value = mdAndDown.value;

  console.log("Đang là mobile :", _mobileBreakpoint.value);
});

// ----- Refs & Reactive -----
const baseUrlApi = import.meta.env.VITE_API_BASE_URL_AI;

const isLoaded = ref(false);

const isLoadingMoreMsg = ref(false);

const form = ref<any>({
  userId: null,
  avatar: "",
  message: "",
  username: "",
  fileDatas: [],
  idCons: null,
});

const conversationData = ref<any>([]);

const chatMessagesData = ref<any>({
  messages: [],
  hasNextPage: false,
  isLoading: false,
});

const formSend = ref<VForm | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const contactActive = ref<string | null>(null);
const page = ref<number>(1);
const store = useAuthStore();

const scrollToBottom = async () => {
  if (!scrollContainer.value) return;
  await nextTick();

  const el = scrollContainer.value.$el;
  if (el) el.scrollTop = el.scrollHeight + 160;
};

const callApiCreateMessage = async (body: any) => {
  try {
    const response = await $fetchApiAiServiceNoLoading('/messages/create', { method: 'POST', body });

    if (!response.data)
      toast.error("Gửi tin nhắn thất bại, vui lòng thử lại sau!");

    return response;
  } catch (error: any) {
    toast.error(error);

    return null;
  }
};

const resetFormSend = () => {
  form.value.message = "";
};

const sendMsg = async () => {
  if (!chatBotRep.value) {
    return
  }
  const currentTime = moment().unix();
  const promiseArr: Promise<any>[] = [];
  if (form.value.message) {
    const sendText = new Promise(async (resolve) => {
      const idRandom = `KS${Math.floor(Math.random() * 1_000_000_000)}`;
      if (!form.value.message.trim()) return;

      const requestBody = {
        idTemp: idRandom,
        senderId: store.userInfo?.id,
        recipients: [props.botId],
        content: {
          msg: form.value?.message,
          id: idRandom,
        },
      };

      chatMessagesData.value.messages.unshift({
        _id: idRandom,
        conversationId: form.value.idCons,
        content: form.value.message,
        time: currentTime,
        status: 0,
        temp: true,
        senderId: {
          _id: store?.userInfo?.id || null,
          fullname: store?.userInfo?.fullName || "",
        },
      });

      await nextTick();

      const res = await callApiCreateMessage(requestBody);
      if (res && res.data) {
        const { id } = res.data.id;

        chatMessagesData.value.messages.forEach((msg: any) => {
          if (msg.id === id) msg.status = 1;
        });
      } else {
        chatMessagesData.value.messages.forEach((msg: any) => {
          if (msg.id === idRandom) msg.status = 0;
        });
      }
      resolve(true);
    });

    promiseArr.push(sendText);
  }

  resetFormSend();

  await Promise.all(promiseArr);
};

const pageMsg = ref<number>(1);
const limitMsg = ref<number>(20);

const resetMsgData = () => {
  chatMessagesData.value = {
    messages: [],
    hasNextPage: false,
    isLoading: false,
  };
  pageMsg.value = 1;
};

const hasNextPageMsg = ref<boolean>(false);

const getMsgConversation = async () => {
  try {
    if (form.value.temp) return;
    const limit = limitMsg.value;
    const pageVal = pageMsg.value;
    const idCons = form.value.idCons;
    const response = await $fetchApiAiServiceNoLoading('/messages/list', {
      method: "GET",
      params: {
        conversationId: idCons,
        page: pageVal,
        limit,
      },
    });

    const result = response?.data;
    if (result) {
      if (
        !chatMessagesData.value.messages ||
        !chatMessagesData.value.messages.length
      ) {
        chatMessagesData.value.messages = JSON.parse(
          JSON.stringify(result.messages)
        );
        for (const msg of chatMessagesData.value.messages) {
          chatMessagesData.value.messages.status = null;
          msg.status = 2;
        }
      } else {
        const oldArray = chatMessagesData.value.messages;
        const newArray = JSON.parse(JSON.stringify(result.messages));
        for (const msg of newArray) msg.status = 2;

        chatMessagesData.value.messages = oldArray.concat(newArray);
      }
      hasNextPageMsg.value = result.pagination?.hasNextPage || false;
    } else {
      pageMsg.value--;
    }
  } catch (error) {
    chatMessagesData.value.messages = [];
  }
};

const getMoreMessages = async (scrollMsg = false, idMsgPinned = null) => {
  isLoadingMoreMsg.value = true;
  pageMsg.value++;
  await getMsgConversation(scrollMsg, idMsgPinned);
  isLoadingMoreMsg.value = false;
};

const handleScrollMsg = async (e: Event) => {
  if (!hasNextPageMsg.value) return;

  const container = scrollContainer?.value?.$el;
  const oldScrollHeight = container.scrollHeight;
  const oldScrollTop = container.scrollTop;

  if (e?.target?.scrollTop === 0 && chatMessagesData.value.messages.length) {
    await getMoreMessages();

    await nextTick(() => {
      const newScrollHeight = container.scrollHeight;
      const heightDiff = newScrollHeight - oldScrollHeight;

      container.scrollTop = oldScrollTop + heightDiff;
    });
  }
};

const sentMsgServer = async (item: any) => {
  const { msg, idTemp = "" } = item;
  if (!msg?._id) return;

  chatBotRep.value = false;
  console.log("msg da duoc gui", msg);

  chatMessagesData.value.messages = chatMessagesData.value.messages.filter(
    (m: any) => !(m.temp && m._id === idTemp)
  );

  const currentTime = moment().unix();
  const thinkingMsg = {
    _id: `KS${Math.floor(Math.random() * 1_000_000_000)}`,
    conversationId: form.value.idCons,
    content: "Đang suy nghĩ...",
    time: currentTime,
    status: 0,
    temp: true,
    senderId: { _id: props.botId || null },
  };

  chatMessagesData.value.messages.unshift(thinkingMsg, msg);

  form.value.idCons = chatMessagesData.value.messages[0].conversationId;

  await nextTick(() => {
    page.value = 1;
    scrollToBottom();
    delete form.value.temp;
  });
};

const chatBotRep = ref<boolean>(true);

const receivedMsgServer = async (data: any) => {
  const msg = data.msg;
  if (!msg._id) return;

  chatMessagesData.value.messages = chatMessagesData.value.messages.filter(
    (m: any) => !m.temp
  );
  chatMessagesData.value.messages.unshift(msg);
  form.value.idCons = msg.conversationId;

  chatBotRep.value = true;
  await nextTick(async () => {
    scrollToBottom();
  });
};

const getConversation = async () => {
  try {
    const response = await $fetchApiAiServiceNoLoading('/conversations/get-one', {
      method: 'POST',
      body: {
        senderId: store.userInfo?.id,
        recipients: [props.botId],
      },
    });

    if (response?.data) form.value.idCons = response?.data._id;
  } catch (error) {
    form.value.idCons = null;
  }
};
const nameBot = computed(() => props.name);
const descriptionBot = computed(() => props.description);
const numberSource = computed(() => props?.sources?.length);
const sources = computed(() => props?.sources || []);
const questions = ref([])
const getQuestions = async () => {
  try {
    const response = await $fetchApiAiServiceNoLoading('/questions/', {
      method: 'GET',
      query: {
        botId: props.botId
      },
    });

    if (response?.data) {
      questions.value = response.data.map((question: any) => ({
        ...question,
        content: question.content.replace(/^\d+\.\s*/, ''),
      }));
    }
  } catch (error) {
  }
}
// const isNew = computed(() => props?.isNew || true)
onBeforeMount(async () => {
  contactActive.value = props.botId;
  // if (!isNew) {
  await getConversation();
  await getQuestions();
  await getMsgConversation();
  // }
});

const selectQuestion = (question: string) => {
  form.value.message = question
  sendMsg()
};

const formatChunkText = (text: string) => {
  if (!text) return
  let clean = text;

  clean = clean.replace(/\r\n/g, "\n");
  clean = clean.replace(/[ \t]+/g, " ");

  clean = clean.replace(/(\d+\.\s)/g, "\n$1");

  clean = clean.replace(/•/g, "\n• ");

  clean = clean.replace(/\n{2,}/g, "<br/><br/>");

  clean = clean
    .split("\n")
    .map(line => {
      if (line.trim().startsWith("•")) {
        return "<li>" + line.replace(/^•\s*/, "") + "</li>";
      }
      return line;
    })
    .join("\n");

  if (clean.includes("<li>")) {
    clean =
      "<ul>" +
      clean.replace(/\n?(<li>.*?<\/li>)(?=\n|$)/g, "$1") +
      "</ul>";
  }

  clean = clean.replace(/\n/g, "<br/>");

  return clean.trim();
};

const chunksData = ref<any>({});
const loadInfoSource = ref<boolean>(false);
const activeChunkId = ref<string | null>(null);
const sourceSelected = ref(null)
const chunkRefs = ref<HTMLElement[]>([]);
const linkToSource = async (item: any) => {
  sourceSelected.value = { ...item, isMenu: true };
  const docView = document.getElementById("doc-view");
  if (docView) {
    docView.innerHTML = renderHighlightedChunk(
      sourceSelected.value?.content || "",
      null,
      null
    );

    await nextTick(() => {
      loadInfoSource.value = false;
      const el = docView.querySelector(".highlight-chunk");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

}
// const linkToSource = async (item: any) => {
//   try {
//     loadInfoSource.value = true;
//     const response = await $fetchApiAiServiceNoLoading(`/source/get-one/${item._id}`, {
//       method: "GET",
//     });

//     if (response?.data) {

//       chunksData.value = { source: item, chunks: response.data?.chunks || [] }
//     }
//   } catch (error) {
//     toast.error(error);
//   } finally {
//     loadInfoSource.value = false;
//   }
// }

const renderHighlightedChunk = (text: string, start: number, end: number) => {
  if (!text || start == null || end == null) return formatChunkText(text);

  const before = text.slice(0, start);
  const middle = text.slice(start, end);
  const after = text.slice(end);

  const highlighted = before + `<span class="highlight-chunk">${middle}</span>` + after;

  return formatChunkText(highlighted);
};

const getChunks = async (chunkId: string | undefined | null) => {
  try {
    const docView = document.getElementById("doc-view");
    if(!chunkId) {
      docView.innerHTML = ''
      return
    }
    loadInfoSource.value = true;
    const response = await $fetchApiAiServiceNoLoading(`/chunks/get-one/${chunkId}`, {
      method: "GET",
    });
    if (response?.data) {
      if (!sourceSelected.value?._id || sourceSelected.value._id !== response.data.sourceId._id) {
        sourceSelected.value = response.data.sourceId;
      }
      chunksData.value = response.data;

      const chunk = chunksData.value;
      const { offsetStart, offsetEnd } = chunk.meta;
      if (docView) {
        docView.innerHTML = renderHighlightedChunk(
          sourceSelected.value?.content || "",
          offsetStart,
          offsetEnd
        );

        await nextTick(() => {
          const el = docView.querySelector(".highlight-chunk");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        });
      }
    }
  } catch (error) {
    toast.error(error?.data?.message || "Lỗi khi gọi API");
  } finally {
    loadInfoSource.value = false;
    activeChunkId.value = chunkId || null;
  }
};

const openInfoSource = async (chunkId: string | undefined) => {
  loadInfoSource.value = true;
  isLeftSidebarOpen.value = true;
  await getChunks(chunkId);
};

const getIcon = (type: string) => {
  switch (type.toLowerCase().trim()) {
    case "document":
      return "tabler-file"; // PDF
    case "text":
      return "tabler-file-type-txt"; // Text
    case "url":
      return "tabler-link"; // URL
    default:
      return "mdi-file-outline"; // fallback
  }
};


onMounted(() => {
  chunkRefs.value = [];
  socket.on("connect", () => {
    console.log("✅ WebSocket connected:", socket.id);
  });

  const userId = store?.userInfo?.id || null;

  socket.emit("register", userId);

  socket.on("sentMsgServer", (msg) => {
    console.log("Sent confirmation:", msg);
    sentMsgServer(msg);
  });

  socket.on("receivedMsgServer", (msg) => {
    console.log("Message received:", msg);
    receivedMsgServer(msg);
  });
});

onBeforeUnmount(() => {
  socket.off("sentMsgServer");
  socket.off("receivedMsgServer");
  socket.off("connect");
});

const setValueSource = () => {
  sourceSelected.value = null
  getChunks(null)
}
</script>

<template>
  <div v-if="!isLoaded" class="spinner-overlay">
    <div class="spinner" />
  </div>
  <VLayout class="chat-app-layout">
    <VNavigationDrawer v-model="isLeftSidebarOpen" absolute touchless location="start" width="800"
      class="chat-list-sidebar">
      <div v-if="loadInfoSource" class="d-flex justify-center align-center mt-10">
        <VProgressCircular color="grey-lighten-4" indeterminate />
      </div>

      <div>
        <VCardTitle v-if="sourceSelected">
          <div class="d-flex align-center justify-start gap-2">
            <IconBtn icon="tabler-arrow-left" @click="setValueSource"></IconBtn>
            <span><strong>Nguồn:&nbsp;{{ chunksData?.source?.title }}</strong></span>
          </div>
        </VCardTitle>
        <!-- <div v-for="chunk in chunksData.chunks" :key="chunk._id" class="chunk-text"
          :class="{ 'active-chunk': activeChunkId === chunk._id }" v-html="formatChunkText(chunk.rawText)"
          :data-chunk-id="chunk._id" ref="chunkRefs"></div> -->
        <div id="doc-view" class="chunk-text">
        </div>
      </div>

      <div class="text-center w-100 text-disabled" v-if="!sourceSelected && !loadInfoSource">
        <VCardTitle class="d-flex justify-space-between w-100">
          <span class="d-flex align-center justify-start gap-2">
            <strong>{{ sources.length }} nguồn</strong>
          </span>
          <span>
            <IconBtn icon="tabler-x" @click="isLeftSidebarOpen = false"></IconBtn>
          </span>
        </VCardTitle>
        <div v-for="source in sources" :key="source._id"
          class="d-flex align-center justify-start gap-2 mb-3 source-list" @click="linkToSource(source)">
          <!-- Icon theo type -->
          <VIcon :icon="getIcon(source?.type)" size="24" />
          <!-- Tên file có tooltip -->
          <VTooltip activator="parent" location="top">
            {{ source.title }}
          </VTooltip>
          <span class="text-body-1 text-truncate" style="max-width: 400px; cursor: pointer;">
            {{ source?.type === 'document' ? source.fileName : source.title }}
          </span>
        </div>
      </div>
    </VNavigationDrawer>
    <!-- 👉 Chat content -->
    <VMain class="chat-content-container">
      <div v-if="contactActive" class="d-flex flex-column h-100">
        <div class="active-chat-header d-flex align-center text-medium-emphasis bg-surface"
          style="min-block-size: 40px;">
          <IconBtn class="me-3" @click="isLeftSidebarOpen = !isLeftSidebarOpen">
            <VIcon icon="tabler-category-2" size="25" />
          </IconBtn>
          <div class="d-flex align-center cursor-pointer chat-active-panel">
            <h4>Cuộc trò chuyện</h4>
          </div>
        </div>
        <VSpacer />
        <VDivider />
        <div class="d-flex" style="position: relative">
          <PerfectScrollbar ref="scrollContainer" tag="ul" class="flex-grow-1 container-conver"
            :suppress-scroll-x="true" style="
              height: calc(100vh - 99px);
              margin-right: 18px;
              padding-bottom: 120px;
              max-height: 930px;
              background-color: rgb(251 251 251);
            " :options="{
              wheelPropagation: false,
              suppressScrollX: true,
              wheelSpeed: 1,
            }" @scroll="handleScrollMsg">
            <div class="min-h-[120%]" />
            <div v-if="isLoadingMoreMsg" class="d-flex justify-center align-center">
              <VProgressCircular color="grey-lighten-4" indeterminate />
            </div>
            <!-- <div class="bot-card">
              <h3>{{ nameBot }}</h3>
              <span> {{ numberSource }} nguồn </span>
              <p>{{ descriptionBot }}</p>
            </div> -->
            <ChatLog :form="form" :chat-messages-data="chatMessagesData" :is-loading-more-msg="isLoadingMoreMsg"
              :conversation-data="conversationData" @scroll-to-bottom="scrollToBottom"
              @open-info-source="openInfoSource" />
            <div ref="bottomMarker" class="mt-5" />
          </PerfectScrollbar>
        </div>
        <div class="d-flex" style="position: relative">
          <VForm ref="formSend" class="chat-log-message-form chat-form-fixed mt-2 mx-5" @submit.prevent>
            <VTextField v-model="form.message" variant="solo" density="default" class="chat-message-input"
              placeholder="Bắt đầu nhập..." autofocus @keydown.enter.prevent="sendMsg">
              <template #append-inner>
                <div class="d-flex gap-1">
                  <VBtn type="button" icon="tabler-send" :disabled="!chatBotRep" @click="sendMsg" />
                </div>
              </template>
            </VTextField>
            <VSlideGroup class="mt-1" show-arrows>
              <VSlideGroupItem v-for="(question, i) in questions" :key="i" v-slot="{ isSelected, toggle }">
                <VChip class="ma-2 suggestion-chip" :variant="isSelected ? 'tonal' : 'outlined'"
                  :color="isSelected ? 'primary' : undefined" :prepend-icon="isSelected ? 'tabler-check' : ''"
                  @click="() => { toggle(); selectQuestion(question.content); }">
                  {{ question.content }}
                </VChip>
              </VSlideGroupItem>
            </VSlideGroup>
          </VForm>
        </div>
      </div>
    </VMain>
  </VLayout>
</template>

<style lang="scss">
@use "@styles/variables/vuetify.scss";
@use "@core/scss/base/mixins.scss";
@use "@layouts/styles/mixins" as layoutsMixins;

// Variables
$chat-app-header-height: 76px;

// Placeholders
%chat-header {
  display: flex;
  align-items: center;
  min-block-size: $chat-app-header-height;
  padding-inline: 1.5rem;
}

.chat-start-conversation-btn {
  cursor: default;
}

.chat-app-layout {
  border-radius: vuetify.$card-border-radius;

  @include mixins.elevation(vuetify.$card-elevation);

  $sel-chat-app-layout: &;

  @at-root {
    .skin--bordered {
      @include mixins.bordered-skin($sel-chat-app-layout);
    }
  }

  .active-chat-user-profile-sidebar,
  .user-profile-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }

  .chat-list-header,
  .active-chat-header {
    @extend %chat-header;
  }

  .chat-list-sidebar {
    .v-navigation-drawer__content {
      display: flex;
      flex-direction: column;
    }
  }
}

.chat-content-container {
  /* stylelint-disable-next-line value-keyword-case */
  /* background-color: v-bind(chatContentContainerBg); */

  // Adjust the padding so text field height stays 48px
  .chat-message-input {
    .v-field__input {
      font-size: 0.9375rem !important;
      line-height: 1.375rem !important;
      padding-block: 0.6rem 0.5rem;
    }

    .v-field__append-inner {
      align-items: center;
      padding-block-start: 0;
    }

    .v-field--appended {
      padding-inline-end: 8px;
    }
  }
}

.chat-user-profile-badge {
  .v-badge__badge {
    /* stylelint-disable liberty/use-logical-spec */
    min-width: 12px !important;
    height: 0.75rem;
    /* stylelint-enable liberty/use-logical-spec */
  }
}

/* Đường ray scrollbar - luôn chiếm chỗ */
.container-conver .ps__rail-y {
  width: 10px !important;
  opacity: 0 !important;
  transition: opacity 0.2s ease-in-out;
  background-color: transparent !important;
}

/* Thanh trượt - mặc định ẩn */
.container-conver .ps__thumb-y {
  background-color: rgba(100, 100, 100, 0.6) !important;
  border-radius: 6px !important;
  width: 8px !important;
}

/* Khi hover thì hiện */
.container-conver:hover .ps__rail-y {
  opacity: 0.8 !important;
  background-color: rgba(126, 125, 125, 0.05) !important;
}

.container-conver:hover .ps__thumb-y {
  background-color: rgba(145, 142, 142, 0.8) !important;
}

.highlighted {
  background-color: rgb(233 233 233 / 80%) !important;
  border-radius: 0.375rem;
}

.chat-form-fixed {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.emoji-dropdown {
  position: absolute;
  bottom: 48px;
  z-index: 20;
  right: 0px;
}

.container-upload-img {
  position: relative;
  justify-content: end;
  align-items: start;
  display: flex;
  left: 15px;

  .btn-remove-file-upload {
    position: absolute !important;
    cursor: pointer !important;
    opacity: 0 !important;
    color: #ffff !important;
    background-color: rgb(189, 189, 189) !important;
    width: 20px !important;
    height: 20px !important;
    top: 5px !important;
    right: 5px !important;

    :deep(i) {
      font-size: 12px !important;
      block-size: 12px !important;
      inline-size: 12px !important;
    }
  }

  &:hover .btn-remove-file-upload {
    opacity: 1 !important;
  }
}

.toast-custom-body {
  word-break: break-word !important;
  overflow-wrap: break-word !important;
  white-space: normal !important;
}

.container-typing {
  position: absolute;
  bottom: 80px;
  left: 22px;
  height: 35px;
  width: min(350px, 80%);
  background: rgba(0, 0, 0, 0.05);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.result-search {
  margin-top: 5px;
  padding: 5px;
  border-radius: 8px;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #e0e0e0;
  }
}

.mention {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 4px;
  border-radius: 4px;
}

.chat-input-wrapper {
  position: relative;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 16px;
  font-family: inherit;
}

.chat-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chat-input-contenteditable {
  flex: 1;
  outline: none;
  white-space: pre-wrap;
  word-break: break-word;
  min-height: 32px;
  max-height: 120px;
  overflow-y: auto;
  padding: 4px;
  border-radius: 6px;
  border: none;
}

.chat-input-contenteditable:empty:before {
  content: attr(placeholder);
  color: #aaa;
  pointer-events: none;
}

.mention-chat {
  background: #e7f3ff;
  color: #1976d2;
  padding: 2px 4px;
  border-radius: 4px;
}

.chat-toolbar {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.chat-active-panel .v-badge__badge {
  width: 10px !important;
  height: 10px !important;
  border-radius: 4.5px !important;
}

.bot-card {
  margin-top: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
}

.bot-card h3 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.bot-card span {
  color: gray;
  margin-bottom: 10px;
}

.bot-card p {
  max-width: 800px;
  line-height: 1.5;
}

.chat-list-sidebar {
  padding: 1rem;
  overflow-y: auto;
}

.chunk-text {
  word-break: break-word;
  white-space: pre-wrap;
  padding: 0.5rem 1rem;
  margin-bottom: 2px;
  border-radius: 8px;
  max-width: 100%;
  box-sizing: border-box;
}

.chat-list-sidebar::-webkit-scrollbar {
  width: 6px;
}

.chat-list-sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.chunk-text.active-chunk {
  background-color: #e3f2fd;
  /* xanh nhạt */
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.chat-log-message-form {

  border-radius: 12px;

  .v-field {
    box-shadow: none;
  }

  .suggestion-chip {
    border-color: #e0e0e0;
    background-color: #ffffff;
    height: 30px !important;
  }

  :deep(.v-slide-group__next .v-icon),
  :deep(.v-slide-group__prev .v-icon) {
    font-size: 18px;
  }
}

.source-list {
  height: 30px;

  &:hover {
    background-color: #e0e0e0;
    cursor: pointer;
  }
}

.highlight-chunk {
  background-color: rgb(115, 103, 240, 20%);
  border-radius: inherit;
  pointer-events: none;
  transition: opacity 0.2s ease-in-out;
  padding: 0 2px;
  border-radius: 2px;
}
</style>

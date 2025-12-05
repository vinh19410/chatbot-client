<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue";
import axios from "axios";
import userAvatar from "@images/user.png";
import { useAuthStore } from "@/store/auth";
import { socket } from "@/utils/socket";
import robotImg from "@/assets/images/robot.jpg";
import AppLoadingIndicator from "@/components/AppLoadingIndicator.vue";

const props = defineProps<{
  form: any;
  chatMessagesData: any[];
  isLoadingMoreMsg: boolean;
  listMessagePinned?: [];
  conversationData: any;
}>();

const emit = defineEmits<{
  (e: "scrollToBottom", data?: any): void;
  (e: "updateVfromMsg", content?: string): void;
  (e: "openInfoSource", id?: string): void;
}>();

const store = useAuthStore();
const baseUrlApi = ref<string>(import.meta.env.VITE_API_BASE_URL_AI);

interface Message {
  id: string | number;
  time: number;
  content: string;
  status?: number;
  _id: string | number;
  senderId: {
    _id: string;
    fullname?: string;
  };
  reactions: any;
  deletedFor: any;
  revoked: boolean;
}

interface MessageGroup {
  messages: Message[];
  time: number;
  dateKey: string;
}
const chatLogRef = ref<HTMLElement | null>();

const waitForMediaLoad = async () => {
  console.log("Starting waitForMediaLoad");
  await nextTick();
  console.log("After nextTick");

  const container = chatLogRef.value;
  if (!container) {
    console.log("Container is null or undefined");

    return;
  }

  const mediaElements = container.querySelectorAll("img, video");

  console.log("mediaElements:", mediaElements);

  const promises = Array.from(mediaElements).map(
    (el: any) =>
      new Promise((resolve) => {
        if (el.complete || el.readyState >= 3) {
          console.log("Media already loaded:", el);
          resolve(true);
        } else {
          el.addEventListener("load", () => {
            console.log("Media loaded:", el);
            resolve(true);
          });
          el.addEventListener("error", () => {
            console.log("Media error:", el);
            resolve(true);
          });
        }
      })
  );

  try {
    await Promise.all(promises);
    console.log("All media loaded");
  } catch (error) {
    console.error("Promise.all error:", error);
  }
};

const scrollToBottom = async () => {
  console.log("Starting scrollToBottom");
  // await waitForMediaLoad();
  console.log("Reached debugger point");
  emit("scrollToBottom");
};

const noAvatar = ref(userAvatar);
const avatar = ref("");
const chatMessagesData = ref<Message[]>([]);
const userId = ref("");
const firstLoad = ref(true);

watch(
  () => props.form,
  (newVal) => {
    if (!newVal?.userId || (newVal.userId && newVal.userId === userId.value))
      return;

    userId.value = newVal.userId;
    avatar.value = newVal?.avatar || noAvatar.value;
    firstLoad.value = true;

    // userName.value = newVal?.username || ''
  },
  { immediate: true, deep: true }
);

watch(
  () => props.chatMessagesData,
  (newVal: any) => {
    if (!Array.isArray(newVal?.messages)) {
      console.error("chatMessagesData must be an array");

      return;
    }
    chatMessagesData.value = newVal?.messages.slice().reverse() || [];
  },
  { immediate: true, deep: true }
);

const getDateKey = (timestamp: number) => {
  const isMilliseconds = timestamp > 2147483647;
  const date = new Date(isMilliseconds ? timestamp : timestamp * 1000);

  const today = new Date();

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) return "Hôm nay";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const msgGroups = computed(() => {
  const _msgGroups: MessageGroup[] = [];
  if (!chatMessagesData.value.length) return _msgGroups;
  let currentGroup: MessageGroup = {
    messages: [],
    time: chatMessagesData.value[0].time,
    dateKey: getDateKey(chatMessagesData.value[0].time),
  };
  debugger
  const visibleMessages = chatMessagesData.value.filter((msg) => {
    const isDeleted = msg?.deletedFor?.includes(store.userInfo?.id);

    return !isDeleted;
  });

  visibleMessages.forEach((msg, index) => {
    const msgDateKey = getDateKey(msg.time);
    const lastGroupDateKey = currentGroup.dateKey;

    // Chỉ kiểm tra dateKey để nhóm, không cần kiểm tra timeDiff
    if (msgDateKey === lastGroupDateKey) {
      currentGroup.messages.push(msg);
    } else {
      _msgGroups.push(currentGroup);
      currentGroup = {
        messages: [msg],
        time: msg.time,
        dateKey: msgDateKey,
      };
    }

    if (index === visibleMessages.length - 1) _msgGroups.push(currentGroup);
  });

  return _msgGroups.filter((group) => group.messages.length > 0);
});

watch(msgGroups, () => {
  if (firstLoad.value && msgGroups.value.length > 0) {
    nextTick(() => {
      scrollToBottom();
      firstLoad.value = false;
    });
  }
});

const formatDateTime = (timestamp: number, hasDate: boolean) => {
  const date = new Date(timestamp * 1000);
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }); // Định dạng giờ: 15:00
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }); // Định dạng ngày: 01/01/2023
  if (hasDate) return `${time} ${dateStr}`;

  return time;
};

const shouldShowAvatar = (
  group: MessageGroup,
  message: Message,
  msgIndex: number
): boolean => {
  const checkUserSender = checkSender(message)
  if (checkUserSender) return false;
  const nextMessage = group.messages[msgIndex + 1];

  return !nextMessage || nextMessage.senderId !== message?.senderId;
};

const checkSender = (message: any) => {
  const senderId = message?.senderId?._id || message?.senderId;

  return senderId === store?.userInfo?.id;
};

const getMessageClass = (message: any) => {
  const isRight = checkSender(message);

  return {
    "chat-right": isRight,
    "chat-left": !isRight,
  };
};

const addReaction = async (messageId: string | number) => {
  try {
    if (!store?.userInfo?.id) return;

    const res = await axios.post(
      `${baseUrlApi.value}/messages/add-reaction/${messageId}`,
      {
        userId: store.userInfo.id,
        type: "like",
      }
    );
  } catch (error: any) {
    toast.error(`Lỗi: ${error}`);
  }
};

onMounted(() => {
  socket.on("reactionAdded", (data: any) => {
    const msg = data.msg;
    if (!msg) return;
    const messageId = msg._id;

    const msgGroup = msgGroups.value.find((group) =>
      group.messages.some((m) => m._id === messageId)
    );

    if (msgGroup) {
      const msgOld = msgGroup.messages.find((m) => m._id === messageId);
      if (msgOld) msgOld.reactions = msg.reactions;
    }
  });

  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement
    if (target.classList.contains("chunk-info")) {
      const chunkId = target.dataset.chunkId
      if (chunkId) {
        emit('openInfoSource', chunkId)
      }
    }
  })
});

const getMessageStatusText = (status: number | undefined) => {
  switch (status) {
    case 0:
      return "Đang gửi...";
    case 1:
    case 2:
      return "Đã nhận";
    case -1:
      return "Gửi thất bại";
    default:
      return "";
  }
};

const showStatusMsg = (message: Message) => {
  const isCurrentUserSender = message.senderId?._id === store?.userInfo?.id;
  if (!isCurrentUserSender) return false;

  const idMsg = message._id;
  const lastMsg = chatMessagesData.value[chatMessagesData.value.length - 1];

  return idMsg === lastMsg._id;
};

const parseTextWithLinks = (item: any) => {
  const text = item?.content || "";
  const urlRegex =
    /((https?:\/\/)(([\w-]+\.)+[\w-]+|localhost(:\d+)?)(\/[\w\-.~:/?#[\]@!$&'()*+,;=]*)?)/gi;

  return text.replace(urlRegex, (url) => {
    const parts = url.split(".");
    const isBase64 = (str) => /^[\w-]+$/.test(str);
    if (parts.length === 3 && parts.every(isBase64)) return url;

    let finalUrl = url;
    if (!url.startsWith("http")) finalUrl = `http://${url}`;
    let color = "white";
    if (!checkSender(item)) color = "#1976D2";

    return `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer" style="color: ${color}; text-decoration: underline;">${url}</a>`;
  });
};

const safeParseJSON = (str: string) => {
  try {
    return JSON.parse(str)
  } catch (err) {
    try {
      // 1. Loại bỏ BOM và trim
      let fixed = str.replace(/^\uFEFF/, "").trim()

      // 2. Thêm nháy kép quanh key nếu thiếu
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')

      // 3. Escape dấu " bên trong value
      fixed = fixed.replace(/"(.*?)":\s*"([^"]*?)"([^"]*?)"/g, (m) => {
        return m.replace(/"([^"]*?)"/g, (x) => x.replace(/"/g, '\\"'))
      })

      // 4. Xóa dấu phẩy thừa trước `}` hoặc `]`
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

      return JSON.parse(fixed)
    } catch (err2) {
      return str
    }
  }
}

// --- helper format contact & text ---
const formatText = (str: string): string => {
  if (!str) return "";
  let out = str.trim();

  // tel
  out = out.replace(/(\+?\d[\d\s().-]{5,}\d)/g, (m) => {
    const tel = m.replace(/\s+/g, "");
    return `<a href="tel:${tel}">${m}</a>`;
  });

  // email
  out = out.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (m) => {
    return `<a href="mailto:${m}">${m}</a>`;
  });

  // website / url
  out = out.replace(/\b(https?:\/\/[^\s]+|www\.[^\s]+)\b/g, (m) => {
    const url = m.startsWith("http") ? m : `https://${m}`;
    return `<a href="${url}" target="_blank" rel="noopener">${m}</a>`;
  });

  // markdown bold
  out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // line list
  if (/^.+[:：].+$/m.test(out)) {
    const lines = out
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length > 1) {
      return `<ul>` + lines.map((l) => `<li>${l}</li>`).join("") + `</ul>`;
    }
  }

  return `<p>${out.replace(/\n/g, "<br>")}</p>`;
};

const convertHtml = (item: any): string => {
  // helper: safe JSON parse (project của bạn có safeParseJSON)
  const safeParse = (s: string) => {
    try { return safeParseJSON(s); } catch {
      try { return JSON.parse(s); } catch { return null; }
    }
  };

  // --- formatText (giữ nguyên, nhỏ gọn, không thêm newline thừa) ---
  const formatText = (str: string): string => {
    if (!str) return "";
    let out = String(str).trim();

    // tel
    out = out.replace(/(\+?\d[\d\s().-]{5,}\d)/g, (m) => {
      const tel = m.replace(/\s+/g, "");
      return `<a href="tel:${tel}">${m}</a>`;
    });

    // email
    out = out.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (m) => {
      return `<a href="mailto:${m}">${m}</a>`;
    });

    // website / url
    out = out.replace(/\b(https?:\/\/[^\s]+|www\.[^\s]+)\b/g, (m) => {
      const url = m.startsWith("http") ? m : `https://${m}`;
      return `<a href="${url}" target="_blank" rel="noopener">${m}</a>`;
    });

    // markdown bold
    out = out.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // convert newlines to <br> (keep paragraphs compact)
    out = out.replace(/\r\n|\r/g, "\n");
    // collapse multiple newlines to single <br>
    out = out.replace(/\n{2,}/g, "\n");

    // final wrap: if it looks like multiple "Label: Value" lines, show as list
    if (/^.+[:：].+$/m.test(out)) {
      const lines = out.split(/\n+/).map(l => l.trim()).filter(Boolean);
      if (lines.length > 1) {
        return `<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>`;
      }
    }

    // fallback paragraph (replace single \n with <br>)
    return `<p>${out.replace(/\n/g, "<br>")}</p>`;
  };

  // --- Merge logic for array fragments ---
  const mergeArrayFragments = (arr: (string | number | any)[]): string[] => {
    const parts = arr.map(x => (x === null || x === undefined) ? "" : String(x).trim());
    const merged: string[] = [];
    const isSentenceEnd = (s: string) => /[.!?]('|")?\s*$/.test(s);
    let i = 0;
    while (i < parts.length) {
      let cur = parts[i] ?? "";
      // merge following fragments while heuristic says it's a continuation
      while (i + 1 < parts.length) {
        const next = parts[i + 1] ?? "";
        if (!next) { i++; continue; }

        const prevTrim = cur.trim();
        const nextTrim = next.trim();
        const prevLast = prevTrim.slice(-1);
        const nextFirst = nextTrim.charAt(0);

        // if prev looks like end of sentence -> stop merging
        if (isSentenceEnd(prevTrim)) break;

        // If prev ends with '(' or '-' or '/' => merge with no space
        if (/[(-\/]$/.test(prevTrim)) {
          cur = cur + nextTrim;
          i++;
          continue;
        }

        // If prev ends with '(' followed by digits and next is 3-digit -> insert comma (handle 2 717 -> 2,717)
        if (/\(\d+$/.test(prevTrim) && /^\d{1,3}$/.test(nextTrim)) {
          cur = cur + "," + nextTrim;
          i++;
          continue;
        }

        // If next starts with lowercase letter or digit or closing paren or comma -> merge with space
        if (/^[a-z0-9\)\,]/i.test(nextTrim)) {
          cur = cur + " " + nextTrim;
          i++;
          continue;
        }

        // Otherwise stop merging (likely new sentence / bullet)
        break;
      }

      merged.push(cur);
      i++;
    }
    return merged;
  };

  // --- Parse content ---
  let message: any;
  try {
    if (typeof item?.content === "string") {
      const parsed = safeParse(item.content);
      message = parsed ?? item.content;
    } else {
      message = item?.content;
    }
  } catch (err) {
    console.error("Lỗi parse JSON:", err);
    message = item?.content || "";
  }

  // --- If plain string ---
  if (typeof message === "string") {
    // trim excessive whitespace and return one paragraph
    return `<div class="answer-block">${formatText(message)}</div>`;
  }

  // --- If array (may contain mixed types) ---
  if (Array.isArray(message)) {
    // merge fragments smartly, then join into ONE paragraph to avoid unnecessary linebreaks
    const merged = mergeArrayFragments(message);
    // join merged fragments with space, but preserve punctuation spacing
    const joined = merged.map(s => s.trim()).filter(Boolean).join(" ");
    // produce as single item
    message = {
      label: "",
      items: [{ text: joined, sources: [] }],
      note: ""
    };
  }

  // --- If normalized object with items ---
  if (message?.error) {
    return `
    <div class="answer-block error">
      <p>${message.error}</p>
      ${message?.ai_suggestion
        ? `<p class="ai-suggestion">Gợi ý: ${message.ai_suggestion}</p>`
        : ""
      }
    </div>
  `;
  }

  const label = typeof message?.label === "string" ? message.label.trim() : "";
  const items = Array.isArray(message?.items) ? message.items : [];
  const note = typeof message?.note === "string" ? message.note : "";

  // mapping chunkId -> số thứ tự (keeps existing behavior)
  const chunkMap = new Map<string, number>();
  let chunkCounter = 1;
  const getChunkNumber = (id: string) => {
    if (!chunkMap.has(id)) {
      chunkMap.set(id, chunkCounter++);
    }
    return chunkMap.get(id);
  };

  // --- Build html ---
  let html = `<div class="answer-block">`;

  if (label) {
    html += `<p class="label">${label}</p>`;
  }

  // Render items: each item -> <li> normally; but if there's only one item, render paragraph (already wrapped by formatText)
  if (items.length > 0) {
    if (items.length === 1) {
      // single item => render as paragraph (avoids extra line breaks)
      const t = typeof items[0]?.text === "string" ? items[0].text : String(items[0] ?? "");
      html += formatText(t);
    } else {
      html += `<ul>`;
      for (const it of items) {
        const text = typeof it?.text === "string" ? it.text : String(it ?? "");
        let textHtml = formatText(text);

        if (Array.isArray(it?.sources) && it.sources.length > 0) {
          const nums = it.sources
            .map((src) => {
              const num = getChunkNumber(src);
              return `<span class="chunk-info" data-chunk-id="${src}">${num}</span>`;
            })
            .join("");

          if (textHtml.endsWith("</p>")) {
            textHtml = textHtml.replace(/<\/p>$/, `${nums}</p>`);
          } else {
            textHtml += nums;
          }
        }

        html += `<li>${textHtml}</li>`;
      }
      html += `</ul>`;
    }
  }

  if (message?.suggestions) {
    const arr = Array.isArray(message.suggestions) ? message.suggestions : [];
    if (arr.length > 0) {
      const random = arr[Math.floor(Math.random() * arr.length)];
      html += `<div class="suggestion">Nếu bạn cần thông tin: <em>${random}</em> Tôi có thể cung cấp</div>`;
    }
  }
  if (note) {
    html += `<div class="note"><em>${note}</em></div>`;
  }

  html += `</div>`;
  return html;
};

</script>

<template>
  <div ref="chatLogRef" class="chat-log pa-6">
    <div v-for="(group, groupIndex) in msgGroups" :key="groupIndex" class="chat-group-wrapper"
      :class="{ 'mb-6': groupIndex !== msgGroups.length - 1 }">
      <!-- Ngày (group) -->
      <div class="text-center text-disabled text-sm my-4">
        {{ group.dateKey }}
      </div>

      <!-- Nhóm tin nhắn -->
      <div v-for="(message, msgIndex) in group.messages" :id="`${message._id}`" :key="message._id + String(msgIndex)"
        class="chat-group d-flex align-start" :class="[checkSender(message) ? 'flex-row-reverse' : '']">
        <div v-if="shouldShowAvatar(group, message, msgIndex)" class="chat-avatar me-4">
          <VAvatar size="32" variant="tonal" class="cursor-pointer">
            <VImg :src="robotImg" alt="Avatar" />
          </VAvatar>
        </div>
        <div v-else style="width: 32px; margin-right: 1rem" />

        <!-- Nội dung tin nhắn -->
        <div class="chat-body d-inline-flex flex-column position-relative"
          :class="checkSender(message) ? 'align-end' : 'align-start'">
          <div class="chat-content py-2 px-4 hover-time" :class="[
            getMessageClass(message),
            { 'mb-1': msgIndex !== group.messages.length - 1 },
          ]">
            <div v-if="message.status === 0" class="d-flex justify-center align-center loading-sending"
              :class="checkSender(message) ? 'loading-left' : 'loading-right'">
              <VProgressCircular color="grey-lighten-4" indeterminate />
            </div>
            <div class="d-flex align-center" v-if="checkSender(message)">
              <div class="mb-0 text-base" style="max-width: 70vw" v-html="parseTextWithLinks(message)" />
            </div>
            <div class="d-flex align-center" v-else :class="message.status === 0
              ? 'text-disabled'
              : 'bot-chat'
              ">
              <div v-if="message?.temp">
                <div class="loading-chat-bot">
                  <div class="effect-1 effects"></div>
                  <div class="effect-2 effects"></div>
                  <div class="effect-3 effects"></div>
                </div>
              </div>
              <div v-else class="mb-0 text-base" style="max-width: 70vw" v-html="convertHtml(message)" />
            </div>
            <div v-if="!message?.reactions?.length" class="reaction-badge">
              <IconBtn class="x-small" style="background-color: white; width: 25px; height: 25px"
                @click="addReaction(message._id)">
                <VIcon icon="tabler-thumb-up" size="20" color="primary" />
              </IconBtn>
            </div>
            <div v-else class="reaction-badge-like">
              <VBtn class="small" style="
                  height: 25px;
                  background-color: rgba(241, 239, 239, 0.91) !important;
                  color: black !important;
                  padding: 0px;
                  min-width: 35px !important;
                ">
                <VIcon icon="tabler-thumb-up-filled" size="20" class="gradient-icon" />

                <span style="font-size: 10px">{{
                  message?.reactions?.length
                }}</span>
              </VBtn>
              <IconBtn class="x-small ml-1" style="background-color: white; width: 25px; height: 25px"
                @click="addReaction(message._id)">
                <VIcon icon="tabler-thumb-up-filled" size="20" class="gradient-icon" />
              </IconBtn>
            </div>
          </div>
          <div v-if="showStatusMsg(message)" class="mt-2" width="15">
            <VChip prepend-icon="tabler-checks" :text="getMessageStatusText(message?.status)" filter size="x-small" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.chat-log {
  overflow-x: hidden;

  .chat-body {
    max-inline-size: calc(100% - 6.75rem);
    margin-top: 10px;

    .chat-content {
      max-width: 75vw;
      border-end-end-radius: 6px;
      border-end-start-radius: 6px;
      position: relative;
      padding-bottom: 15px !important;
      min-width: 65px;
      border-radius: 10px !important;
      font-size: 16px !important;
      line-height: 24px !important;

      .text-sm {
        font-size: 0.65rem !important;
        opacity: 0.8;
      }

      p {
        overflow-wrap: anywhere !important;
      }

      &.chat-left {
        border-start-end-radius: 6px !important;
        background: #fff !important;
        color: #6958cc !important;
        border-color: #cccc;
      }

      &.chat-right {
        border-start-start-radius: 6px;
        background: #6958cc !important;
        color: #fff !important;
      }

      .msg-time {
        position: absolute;
        font-size: 0.55rem;
        opacity: 0;
        transition: opacity 0.2s ease;

        &.left {
          left: -3.6rem;
          top: 50%;
          transform: translateY(-50%);
        }

        &.right {
          right: -3.6rem;
          top: 50%;
          transform: translateY(-50%);
        }
      }

      img {
        max-width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .loading-sending {
        position: absolute;
        width: 15px;
        opacity: 0.8;
        transition: opacity 0.2s ease;
        top: 50%;
        transform: translateY(-50%);
      }

      .loading-left {
        left: -1.5rem;
        color: #cccc
      }

      .loading-right {
        right: -1.5rem;
      }

    }

    .loading-chat-bot {
      display: flex;
      gap: 10px;
      justify-content: center;
      block-size: 15px;
      inline-size: 65px;
    }

    .effects {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #c7cbce;
      animation: bounce 1.5s infinite ease-in-out;
    }

    .effect-1 {
      animation-delay: 0s;
    }

    .effect-2 {
      animation-delay: 0.3s;
    }

    .effect-3 {
      animation-delay: 0.6s;
    }

    @keyframes bounce {

      0%,
      80%,
      100% {
        transform: scale(0);
      }

      40% {
        transform: scale(1);
      }
    }

    .chat-content ul,
    ol {
      margin-left: 10px !important;
    }

    .info-item .label {
      display: block;
    }

    .info-item .value {
      display: block;
    }

    .info-item .chunk-info {
      margin-left: 6px;
    }

    .info-item .chunk-info::after {
      content: "";
      display: block;
    }

    .reaction-badge {
      position: absolute;
      bottom: -8px;
      right: 0;
      opacity: 0;
      z-index: 5;
    }

    .reaction-badge-like {
      position: absolute;
      bottom: -8px;
      right: 0;
      opacity: 1;
      z-index: 5;
    }

    &:hover .reaction-badge {
      opacity: 1;
    }
  }

  .chunk-info {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #f0f0f3;
    color: #888;
    font-weight: 500;
    font-size: 11px;
    cursor: pointer;
    transition: opacity 0.3s ease;
  }

  .chunk-info:hover {
    opacity: 0.5;
  }
}

.chunk-footer {
  display: block;
  margin-top: 4px;
}

.gradient-icon {
  color: rgb(var(--v-theme-primary)) !important;
  font-size: 12px !important;
}

.answer-block p {
  margin: 6px 0;
}

.answer-block ul,
.answer-block ol {
  margin: 6px 0 6px 20px;
  padding-left: 15px;
}

.answer-block li {
  margin-bottom: 6px;
  line-height: 1.5;
}

.answer-block strong {
  font-weight: bold;
  color: #222;
}

.numbered-list {
  list-style-type: none;
}

.step {
  font-weight: bold;
  margin-right: 4px;
}

.bot-chat {

  div,
  p,
  span {
    color: black !important;
  }
}
</style>

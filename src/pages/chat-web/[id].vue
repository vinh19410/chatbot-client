<script lang="ts" setup>
import { hexToRgb } from "@/@layouts/utils";
import Chat from "@/pages/apps/chat/chat.vue";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "vuetify/lib/framework.mjs";
const vuetifyTheme = useTheme()
definePage({
  meta: {
    layout: "blank",
    unauthenticatedOnly: false,
  },
});
const currentTheme = vuetifyTheme.current.value.colors
const router = useRouter();
const route = useRoute();
const userStore = useAuthStore();
const idBot = ref<string | null>(null);

const reloadData = async () => {
  const id = route.params?.id as string;
  if (id) {
    idBot.value = !idBot.value ? id : idBot.value;
    await getOne(idBot.value);
  } else {
    router.push("/bots");
  }
};

const model = ref<any>({
  _id: null,
  name: "",
  description: "",
  model: "",
  lang: "",
  prompt: "",
  isPublic: false,
  sources: [],
  descriptionSource: ""
});

const getOne = async (id: string) => {
  try {
    const res = await $fetchApiAiService(`/bots/get-one/${id}`, {
      method: "GET",
    });

    if (res?.data) {
      model.value = res.data;
      model.value.model = res.data.model;
      model.value.lang = res.data.language;
    }
  } catch (error) {
    console.error("Error fetching bot:", error);
    toast.error("Không có BOTS được tìm thấy");
    setTimeout(() => {
      router.push("/bots");
    }, 2000);
  }
};

const reloadPage = () => {
  window.location.href = `/bot-view/${idBot.value}`;
};

onBeforeMount(() => {
  const user = { _id: '689da208873c455bbc070708' }
  userStore.setCookieUser(user)
  socket.emit('register', user._id)
  reloadData();
});
</script>

<template>
  <VRow>
    <VCol cols="12" class="pb-0">
      <VCard color="primary">
        <VCardTitle>
          <div class="d-flex align-center justify-start gap-2">
            <IconBtn @click="reloadPage">
              <VIcon icon="tabler-arrow-back" />
            </IconBtn>
            <h3 class="user-name mb-0 text-white">
              <strong>{{ model?.name || "Unknown" }}</strong>
            </h3>
          </div>
        </VCardTitle>
      </VCard>
    </VCol>
  </VRow>
  <VRow>
    <Chat
      :bot-id="idBot"
      :name="model?.name"
      :description="model?.descriptionSource || model?.description"
      :sources="model?.sources"
    />
  </VRow>
</template>

<style scoped>
:global(html) {
  overflow: hidden !important;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { VCard, VCardText, VCol, VForm, VLabel } from 'vuetify/components'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const router = useRouter()
definePage({
  meta: {
    hideNav: true,
    unauthenticatedOnly: false,
  },
});
const model = ref<any>({
  _id: null,
  name: '',
  description: '',
  model: '',
  lang: '',
  prompt: '',
  isPublic: false,
  temperature: 2,
})

const items = ref<{ title: string; value: string }[]>()
const itemsModel = ref<{ title: string; value: string }[]>([])
const showAdvanced = ref(false)
const prompt = ref('')
const temperature = ref(2)
const modeEdit = ref(false)

const route = useRoute()

const getOne = async (id: string) => {
  try {
    const res = await $fetchApiAiService(`/bots/get-one/${id}`, {
      method: 'GET',
    })

    if (res?.data) {
      model.value = res.data
      prompt.value = res.data.prompt || ''
      temperature.value = res.data.temperature || 2
      model.value.model = res.data.model
      model.value.lang = res.data.language
    }
  }
  catch (error) {
    console.error('Error fetching bot:', error)
    toast.error(`Error fetching bot: ${error.message || 'Unknown error'}`)
  }
}

onBeforeMount(async () => {
  items.value = AI_OPTION.map(x => {
    return { title: x.name, value: x.id }
  })

  const id = route.params?.id as string
  if (id) {
    await getOne(id)
    modeEdit.value = true
  }
})

const handleSelectProvider = (value: any) => {
  const item = AI_OPTION.find(item => item.id === value)

  if (!item)
    return
  model.value.model = ''
  model.value.provider = value

  const mapModel = item?.models || []
  if (mapModel.length === 0) {
    itemsModel.value = []

    return
  }
  itemsModel.value = mapModel.map(x => { return { title: x, value: x } })
}

const handleSelectProviderImage = (value: any) => {
  model.value.model = value
}

const isFormValid = ref(false)
const refFormBot = ref(null)

const disabled = ref(false)

const handleSelectLang = (value: string) => {
  model.value.lang = value
}

const userStore = useAuthStore()

const handleCreateBot = async () => {
  try {
    if (isFormValid.value === false) {
      toast.error('Vui lòng điền đầy đủ thông tin BOT')

      return
    }

    const res = await $fetchApiAiService('bots/update', {
      method: 'POST',
      body: {
        ...model.value,
        userId: userStore?.userInfo?.id,
        language: model.value.lang,
        id: model.value._id || null,
      },
    })

    if (res?.data) {
      toast.success('Cập nhật BOT thành công')
      disabled.value = true
      setTimeout(() => {
        router.push(`/bot-view/${res?.data._id}`)
      }, 2000)
    }
    else {
      toast.error(`Error creating bot: ${res.message || 'Unknown error'}`)
    }
  }
  catch (error) {
    console.error('Error creating bot:', error)
    toast.error(`Error : ${error.message || 'Unknown error'}`)
  }
}

const resetForm = () => {
  model.value = {
    _id: null,
    name: '',
    description: '',
    model: '',
    lang: '',
    prompt: '',
    isPublic: false,
    temperature: 2,
  }
  itemsModel.value = []
  showAdvanced.value = false
}

onMounted(() => {
  resetForm()
  handleSelectProvider('openai')
})

const reloadPage = () => {
  window.location.href = `/bot-view/${model.value._id}`;
};
</script>

<template>
  <VCard
    class="overflow-visible"
    title="Chỉnh sửa BOT"
    :disabled="disabled"
  >
    <VCardText>
      <VForm
        ref="refFormBot"
        v-model="isFormValid"
      >
        <VCol
          cols="12"
          md="8"
        >
          <AppTextField
            v-model="model.name"
            label="Tên BOT"
            aria-placeholder="Nhập tên BOT của bạn"
            :rules="[requiredValidator]"
            :required="true"
          />
        </VCol>
        <VCol
          cols="12"
          md="8"
        >
          <AppTextarea
            v-model="model.description"
            label="Mô tả"
            placeholder="Mô tả BOT của bạn sẽ làm gì và được sử dụng như thế nào?"
          />
        </VCol>

        <VCol
          v-if="itemsModel.length > 0"
          cols="12"
          md="4"
        >
          <AppSelect
            style="inline-size: 150px;inline-size: 100%;"
            :model-value="model.model"
            :items="itemsModel"
            label="Mô hình OpenAI"
            placeholder="Model"
            :rules="[requiredValidator]"
            :required="true"
            @update:model-value="handleSelectProviderImage"
          />
        </VCol>
        <VCol
          v-if="LANGS.length > 0"
          cols="12"
          md="4"
        >
          <AppSelect
            style="inline-size: 150px;inline-size: 100%;"
            :model-value="model.lang"
            :items="LANGS"
            label="Ngôn ngữ"
            placeholder="Language"
            :rules="[requiredValidator]"
            :required="true"
            @update:model-value="handleSelectLang"
          />
        </VCol>
        <VCol cols="12">
          <div class="d-flex justify-start align-center gap-2">
            Lưu ý: Bạn có thể thay đổi các cài đặt này tại Sửa BOT
          </div>
        </VCol>
      </VForm>
    </VCardText>
  </VCard>
  <VRow class="d-flex justify-end mt-5">
    <VCol cols="auto">
      <VBtn
        type="button"
        variant="tonal"
        color="dark"
        class="me-3"
        :disabled="disabled"
        @click="reloadPage"
      >
        Hủy
      </VBtn>
      <VBtn
        type="button"
        color="primary"
        :disabled="disabled"
        @click="handleCreateBot"
      >
        Cập nhật
      </VBtn>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { VCard, VCardText, VCol, VForm, VLabel } from 'vuetify/components'
import { useRouter } from 'vue-router'
import { set } from 'lodash'
import { p } from '@antfu/utils'
import is from '@sindresorhus/is'
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

onBeforeMount(() => {
  items.value = AI_OPTION.map(x => {
    return { title: x.name, value: x.id }
  })
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

  // const planUser = userStore?.userInfo?.plan || 'free'
  // if (planUser === 'free' && itemsModel.value.length > 0) {
  //   model.value.model = 'gpt-3.5-turbo'
  //   itemsModel.value = itemsModel.value.filter(x => x.value === 'gpt-3.5-turbo')
  // }
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

    const res = await $fetchApiAiService('bots/create', {
      method: 'POST',
      body: {
        ...model.value,
        userId: userStore?.userInfo?.id,
        language: model.value.lang,
        id: model.value._id || null,
      },
    })

    if (res?.data) {
      toast.success('Tạo BOT thành công')
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
    toast.error(`Error : ${error?.data?.message || 'Unknown error'}`)
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
</script>

<template>
  <VCard
    class="overflow-visible"
    title="Tạo mới BOT"
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
        @click="() => router.push('/bots')"
      >
        Hủy
      </VBtn>
      <VBtn
        type="button"
        color="primary"
        :disabled="disabled"
        @click="handleCreateBot"
      >
        Tạo BOT
      </VBtn>
    </VCol>
  </VRow>
</template>

<style lang="scss" scoped>
</style>

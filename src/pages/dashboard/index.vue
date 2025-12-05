<script setup lang="ts">
import { VCardItem, VCardTitle } from 'vuetify/lib/components/index.mjs'
import { useAuthStore } from '@/store/auth'

const router = useRouter()

const createBot = () => {
  router.replace('/bot-create')
}

const authStore = useAuthStore()

onMounted(() => {
  const user = {_id:'689da208873c455bbc070708'}
  authStore.setCookieUser(user)
  socket.emit('register', user._id)
})
</script>

<template>
  <VRow style="height: 30vh;">
    <VCol
      cols="10"
      class="h-100"
    >
      <VCard class="h-100">
        <VCardTitle><h3>Card 1</h3></VCardTitle>
        <VCardItem />
      </VCard>
    </VCol>

    <VCol
      cols="2"
      class="h-100"
    >
      <VCard class="h-100">
        <VBtn
          class="h-100 w-100 flex flex-col items-center justify-center gap-2"
          variant="tonal"
          color="primary"
          block
          @click="createBot"
        >
          <VIcon
            icon="tabler-library-plus"
            size="40"
          />
          <span class="mt-2">Tạo BOT mới</span>
        </VBtn>
      </VCard>
    </VCol>
  </VRow>
  <VRow style="height: 60vh;">
    <VCol
      cols="6"
      class="h-100"
    >
      <VCard class="h-100">
        <VCardTitle><h3>Card 2</h3></VCardTitle>
        <VCardItem />
      </VCard>
    </VCol>

    <VCol
      cols="6"
      class="h-100"
    >
      <VCard class="h-100">
        <VCardTitle><h3>Card 3</h3></VCardTitle>
        <VCardItem />
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<script setup lang="ts">
import { useConfigStore } from '@core/stores/config'
import type { SearchResults } from '@db/app-bar-search/types'
import axios from 'axios'
import { debounce } from 'lodash'
import Shepherd from 'shepherd.js'
import type { RouteLocationRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import ResultSearch from '@/@core/components/ResultSearch.vue'

interface Suggestion {
  icon: string
  title: string
  url: RouteLocationRaw
}

defineOptions({
  inheritAttrs: false,
})

const configStore = useConfigStore()

const isAppSearchBarVisible = ref(false)
const isLoading = ref(false)

const searchQuery = ref('')
const userStore = useAuthStore()
const router = useRouter()
const searchResult = ref<SearchResults[]>([])
const result = ref<any>([])
const isMenuOpen = ref(false)
const baseUrlApi = import.meta.env.VITE_API_BASE_URL_AI
const limit = ref(10)
const page = ref(1)

const imageResult = ref<any>([])
let currentRequestId = 0
const fetchResults = async (isLoadMore = false) => {
  try {
    isLoading.value = true
    const requestId = ++currentRequestId
    const body: any = {
      page: page.value,
      limit: limit.value,
      userId: userStore?.userInfo?.id,
      search: formSearchNormal.value.search
    }

    const response = await $fetchApiAiServiceNoLoading('/bots/list', { method: 'POST', body });
    if (requestId !== currentRequestId) return
    const apiData = response?.data ?? {}

    const nextRecordsTotal = Number(apiData?.total ?? result.value.total ?? 0)
    const fromApiHasNext = apiData?.hasNextPage
    const calcHasNext = (page.value * limit.value) < nextRecordsTotal
    const nextHasNext = typeof fromApiHasNext === 'boolean' ? fromApiHasNext : calcHasNext

    if (isLoadMore && result.value?.data?.length) {
      result.value.data = result.value.data.concat(apiData?.bots ?? [])
      result.value.hasNextPage = nextHasNext
    }
    else {
      result.value = {
        data: apiData?.bots ?? [],
        recordsTotal: apiData?.total ?? 0,
        hasNextPage: nextHasNext,
      }
    }
    isMenuOpen.value = true
  }
  catch (error) {
    console.error('fetchResults error:', error)
    result.value = { data: [] }
    isMenuOpen.value = false
  }
  finally {
    isLoading.value = false
  }
}

const loadMoreResults = async () => {
  if (result.value.data.length >= (result.value.recordsTotal ?? 0)) {
    console.log('No more results')

    return
  }

  page.value++
  await fetchResults(true)
}

const formSearchNormal = ref({
  search: '',
})

const handleFetchData = debounce((normal, image) => {
  result.value = []
  page.value = 1
  fetchResults(false)
}, 500)

const handleScrollAll = (event: Event) => {
  const target = event.target as HTMLElement

  const scrollTop = target.scrollTop
  const scrollHeight = target.scrollHeight
  const clientHeight = target.clientHeight

  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

  if (isAtBottom)
    loadMoreResults()
}

const activatorWidth = ref(0)
const menuLeft = ref(0)
const updateMenuPosition = () => {
  const el = document.querySelector('.navbar-content-container') as HTMLElement
  if (el) {
    activatorWidth.value = el.offsetWidth
    menuLeft.value = el.getBoundingClientRect().left
  }
}


onMounted(async () => {
  await nextTick()
})

onBeforeUnmount(() => {
})

watch(() => result, (newVal: any) => {
  if (newVal?.data?.length)
    updateMenuPosition()
})

const reloadPage = (id: string) => {
  window.location.href = `/bot-view/${id}`;
};

</script>

<template>
  <div class="d-flex align-center cursor-pointer" v-bind="$attrs"
    style=" position: relative; inline-size: 100%;user-select: none;">
    <VMenu v-model="isMenuOpen" location="bottom" content-class="search-menu" :close-on-content-click="false">
      <template #activator="{ props }">
        <span v-if="configStore.appContentLayoutNav === 'vertical'" class="d-none d-md-flex align-center flex-grow-1"
          v-bind="props" @click="Shepherd.activeTour?.cancel()">
          <VTextField v-model="formSearchNormal.search" placeholder="Tìm kiếm..." hide-details :clearable="false"
            class="no-border-input flex-grow-1" density="comfortable" variant="plain" @input="handleFetchData">
            <template #prepend-inner>
              <VIcon icon="tabler-search" size="20" />
            </template>
          </VTextField>
        </span>
      </template>
      <div class="d-flex justify-start align-center"
        style="z-index: 10; background-color: #fff;inline-size: 100%;margin-block-start: 6px;">
      </div>
      <VDivider />
      <VList style="max-block-size: 600px; overflow-y: auto;" @scroll="handleScrollAll">
        <VListItem v-for="(item, index) in result.data" :key="index" style="padding-block: 0;"
          @click="reloadPage(item._id)">
          <ResultSearch :value="item" :search="formSearchNormal.search" />
        </VListItem>
        <VListItem v-if="!result?.data?.length && !isLoading">
          <div class="d-flex align-center justify-center text-disabled">
            Không có dữ liệu
          </div>
        </VListItem>
        <VListItem v-if="result?.hasNextPage" style="block-size: 1px;" />
        <VListItem v-if="isLoading" class="d-flex justify-center align-center loading-sending">
          <VProgressCircular color="grey-lighten-4" indeterminate />
        </VListItem>
      </VList>
    </VMenu>
  </div>
</template>

<style lang="scss">
@use "@styles/variables/vuetify";

.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  font-size: 0.8125rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}

.no-border-input .v-field__outline {
  display: none !important;
}

.no-border-input .v-field {
  border: none !important;
  box-shadow: none !important;
}

.search-menu {
  padding-inline: 0 !important;
}

.app-bar-search-dialog {
  .custom-letter-spacing {
    letter-spacing: 0.8px;
  }

  .card-list {
    --v-card-list-gap: 8px;
  }
}
</style>

<style lang="scss" scoped>
.v-overlay__content {
  block-size: 900px !important;
  max-inline-size: 100% !important;
}
</style>

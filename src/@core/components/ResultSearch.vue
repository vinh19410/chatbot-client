<script setup lang="ts">
interface Props {
  value: {
    [key: string]: any
  }
  search: string
}

const { value, search } = defineProps<Props>()

const formatDate = (iso?: string) => {
  if (!iso)
    return ''
  const d = new Date(iso)

  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

const highlightText = (text?: string | number, keyword?: string) => {
  if (text === undefined || text === null || !keyword)
    return String(text ?? '')
  const str = String(text)
  const regex = new RegExp(`(${keyword.trim()})`, 'gi')

  return str.replace(regex, '<mark>$1</mark>')
}

const highlightAndTrimMulti = (
  text?: string | number,
  keyword?: string,
  maxSnippetLength = 120
) => {
  if (!text) return ''
  const str = String(text)
  if (!keyword || keyword.trim() === '') {
    return str.length > maxSnippetLength ? str.slice(0, maxSnippetLength) + '...' : str
  }

  const regex = new RegExp(`(${keyword.trim()})`, 'gi')
  const matches = [...str.matchAll(regex)]

  if (matches.length === 0) {
    return str.length > maxSnippetLength ? str.slice(0, maxSnippetLength) + '...' : str
  }

  const snippets = matches.map(m => {
    const index = m.index ?? 0
    const start = Math.max(index - maxSnippetLength / 2, 0)
    const end = Math.min(index + maxSnippetLength / 2, str.length)
    let snippet = str.slice(start, end)
    if (start > 0) snippet = '...' + snippet
    if (end < str.length) snippet = snippet + '...'
    return snippet
  })

  const merged = snippets.join(' ... ')
  return merged.replace(regex, '<mark>$1</mark>')
}


</script>

<template>
  <div class="d-flex justify-space-between sample-card">
    <div class="">
      <slot name="selectBox" />
      <div class="details">

        <!-- Tên BOT -->
        <div v-if="value?.name">
          <small>
            <strong>Tên BOT:&nbsp;</strong>
            <span v-html="highlightText(value.name, search)"></span>
          </small>
        </div>

        <!-- Loại tài liệu -->
        <div v-if="value?.description">
          <small>
            <strong>Mô tả:&nbsp;</strong>
            <p v-html="highlightAndTrimMulti(value?.description, search, 250)" style="width: 65vw;"></p>
          </small>
        </div>

        <div v-if="value?.updatedAt">
          <small><strong>Ngày cập nhật:&nbsp;</strong>{{ formatDate(value.updatedAt) }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.sample-card {
  position: relative;
  display: flex;

  /* flex-direction: column; */
  border-block-end: thin solid #f4f3f4;
  box-shadow: 0 3px 12px rgba(var(--v-shadow-key-umbra-color), var(--v-shadow-md-opacity));
  gap: 6px;
  padding-block-end: 8px;

  .similarity {
    color: rgb(var(--v-theme-primary));
    font-size: 0.9rem;
    font-weight: bold;
  }

  .details {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    gap: 4px;
    line-height: 1.3;

    strong {
      color: #333;
      font-weight: 600;
    }
  }
}
</style>

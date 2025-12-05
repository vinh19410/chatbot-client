<script setup lang="ts">
import { VForm } from 'vuetify/lib/components/index.mjs';
import { API_URL, LevelType } from './constants';

const initData: LevelType = {
  title: "",
  agency: "",
  dateEnd: "",
  dateOfficial: "",
  decisionNumber: "",
};

// 👉 Store
const searchQuery = ref('')
const refVForm = ref<VForm>()

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const dataEdit = ref<LevelType>(initData)
const deleteItem: any = ref()
const editDialog = ref<boolean>(false)
const deleteDialog = ref<boolean>(false)

// Headers
const headers: any[] = [
  { title: '#', align: 'left', key: 'tt', sortable: false },
  { title: 'TÊN CẤP BẬC', align: 'left', key: 'title', sortable: false },
  { title: 'NGÀY THIẾT LẬP', align: 'left', key: 'dateSetup', sortable: false },
  { title: 'Thao tác', align: 'center', key: 'actions', sortable: false },
]

// 👉 Fetching data
const { data: listData, execute: fetchData } = await useApiInternal<any>(createUrl(API_URL, {
  query: {
    itemsPerPage,
    page,
    search: searchQuery,
  },
}))

const list = computed(() => listData.value.data)
const totalItems = computed(() => listData.value.totalItems)

// 👉 Fetching data detail
const getDataDetail = async (_id: number) => {
  try {
    const response = await $apiInternal(`${API_URL}/${_id}`, {
      method: 'GET',
    })
    return response;
  }
  catch (error: any) {
    //// handle error
    toast.error(error.message)
  }
  return null;
}

// 👉 Add new data
const addNewData = async (data: any) => {
  try {
    const response = await $apiInternal(API_URL, {
      method: 'POST',
      body: data,
    })

    if (response)
      toast.success('Thêm mới thành công !')
    else
      toast.error('Thêm mới thất bại !')
  }
  catch (error: any) {
    toast.error(error.message)
  }
  fetchData()
  closeEditDialog()
}

// 👉 Edit data
const editData = async (data: any) => {
  try {
    const response = await $apiInternal(`${API_URL}/${data.id}`, {
      method: 'PUT',
      body: data,
    })

    if (response)
      toast.success('Chỉnh sửa thành công !')
    else
      toast.error('Chỉnh sửa thất bại !')
  }
  catch (error: any) {
    toast.error(error.message)
  }
  fetchData()
  closeEditDialog()
}

const closeDelete = () => {
  deleteDialog.value = false
}

// 👉 Delete action
const deleteItemConfirm = async (_id: string) => {
  try {
    const response = await $apiInternal(`${API_URL}/${_id}`, {
      method: 'DELETE',
    })

    if (response)
      toast.success('Xóa thành công !')
    else
      toast.error('Xóa thất bại !')
  }
  catch (error: any) {
    toast.error(error.message)
  }
  closeDelete()
  fetchData()
}

const onSubmit = async () => {
  refVForm.value?.validate().then(({ valid }) => {
    if (valid) {
      if (dataEdit.value.id) { // update
        editData(dataEdit.value);
      } else { // add new
        addNewData(dataEdit.value);
      }
    }
  });
}

const openEditDialog = async (id: number) => {
  editDialog.value = true;
  if (id > 0) {
    // fetch detail
    const itemDetail = await getDataDetail(id);
    if (itemDetail) {
      dataEdit.value = itemDetail;
    } else {
      // handle error
    }
    return;
  }
  dataEdit.value = { ...initData };
}

const closeEditDialog = () => {
  editDialog.value = false;
}

</script>

<template>
  <section>
    <VCard class="mb-6">
      <VCardText class="d-flex flex-wrap gap-4">
        <VCardTitle>
          <h3 class="font-weight-medium">
            Chức vụ
          </h3>
        </VCardTitle>

        <VSpacer />

        <div class="app-user-search-filter d-flex align-center flex-wrap gap-4">
          <!-- 👉 Search  -->
          <!-- <div style="inline-size: 15.625rem;">
            <AppTextField v-model="searchQuery" placeholder="Tìm kiếm theo tên ..." />
          </div> -->
          <!-- 👉 Add user button -->
          <VBtn @click="openEditDialog(0)">
            Thêm mới
          </VBtn>
        </div>
      </VCardText>

      <VDivider />

      <!-- SECTION datatable -->
      <VDataTableServer v-model:items-per-page="itemsPerPage" v-model:page="page" :items="list"
        :items-length="totalItems" :headers="headers" class="text-no-wrap">
        <!-- Actions -->
        <template #item.tt="{ item, index }">
          {{ index + 1 }}
        </template>

        <template #item.actions="{ item, index }">
          <IconBtn @click="openEditDialog(list[index].id)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>

          <IconBtn @click="() => {
            deleteDialog = true;
            deleteItem = item;
          }">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <!-- pagination -->
        <template #bottom>
          <TablePagination v-model:page="page" :items-per-page="itemsPerPage" :total-items="totalItems" />
        </template>
      </VDataTableServer>
      <!-- SECTION -->
    </VCard>

    <!-- 👉 Edit Dialog  -->
    <VDialog v-model="editDialog" max-width="1440px" :persistent="true">
      <VForm ref="refVForm" @submit.prevent="onSubmit">
        <VCard>

          <VCardItem>
            <VRow>

              <VCol cols="12">
                <AppTextField v-model="dataEdit.title" label="Tên cấp bậc" required="required"
                  :rules="[requiredValidator]" placeholder="Nhập">
                </AppTextField>
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="dataEdit.dateSetup" label="Ngày thiết lập" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppDateTimePicker v-model="dataEdit.dateEnd" label="Ngày kết thúc" required="required"
                  :rules="[requiredValidator]" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12">
                <AppDateTimePicker v-model="dataEdit.dateOfficial" required="required" :rules="[requiredValidator]"
                  label="Ngày bổ nhiệm cấp bậc" placeholder="Chọn ngày" />
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="dataEdit.decisionNumber" label="Số quyết định" placeholder="Nhập"></AppTextField>
              </VCol>

              <VCol cols="12" sm="6">
                <AppTextField v-model="dataEdit.agency" label="Cơ quan ban hành" placeholder="Nhập"></AppTextField>
              </VCol>

              <VCol cols="12">
                <div class="d-flex gap-4">
                  <VSpacer />

                  <VBtn color="secondary" variant="elevated" @click="closeEditDialog">
                    Hủy
                  </VBtn>

                  <VBtn color="primary" variant="elevated" type="submit">
                    Lưu
                  </VBtn>
                </div>
              </VCol>

            </VRow>
          </VCardItem>

          <VCardActions>
          </VCardActions>
        </VCard>
      </VForm>
    </VDialog>

    <!-- 👉 Delete Dialog  -->
    <VDialog v-model="deleteDialog" max-width="500px">
      <VCard>
        <VCardItem class="text-center">
          <div class="d-flex justify-end">
            <IconBtn @click="deleteDialog = false">
              <VIcon icon="tabler-x" />
            </IconBtn>
          </div>

          <div class="d-flex justify-center">
            <VIcon icon="tabler-alert-triangle" size="50" color="warning" />

          </div>
        </VCardItem>

        <VCardTitle class="d-block font-weight-regular text-wrap text-center mb-4 py-0">
          <h4 class="text-md">
            Bản ghi {{ deleteItem.title }} sẽ được xóa ?
          </h4>
        </VCardTitle>

        <VCardActions>
          <VSpacer />
          <VBtn color="secondary" variant="elevated" @click="deleteItemConfirm(deleteItem.id)">
            Xoá
          </VBtn>

          <VBtn color="error" variant="elevated" @click="closeDelete">
            Hủy
          </VBtn>
          <VSpacer />
        </VCardActions>
      </VCard>
    </VDialog>
  </section>
</template>

<style>
.v-card-item__content {
  overflow: visible;
}
</style>

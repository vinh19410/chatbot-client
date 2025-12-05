<script setup lang="ts">
import _debounce from 'lodash/debounce';

const baseUrl = import.meta.env.VITE_API_BASE_URL_AI;

interface Props {
  defaultParentId: number;
  defaultParentName: string;
}

interface ImageFile {
  file: File,
  url: string,
}

interface UpdateParentProps {
  name: string;
  file: File | null;
}

interface UpdateChildProps {
  name: string;
}

interface UpdateLastChildProps {
  vi_tri_dong_so_dong_co: string;
  vi_tri_dong_so_khung: string;
  mau_ky_tu_so_dong_co: string;
  mau_ky_tu_so_khung: string;
}

const { defaultParentId, defaultParentName } = defineProps<Props>();

const brands = ref<any[] | any>([]);
const searchString = ref<string>("");
const selectedItems = ref<any[]>([]);
const sourceImage = ref<string>();

// delete
const deleteItem: any = ref();
const deleteDialog = ref<boolean>(false);
const closeDelete = () => {
  deleteDialog.value = false;
};

// update parent
const updateParentDialog = ref<boolean>(false);
const closeUpdateParent = () => {
  updateParentDialog.value = false;
};
const formUpdateParent = ref<UpdateParentProps>({
  name: "",
  file: null,
});
const errorsUpdateParent = ref<any>({
  name: "",
  file: "",
});

// update child
const updateChildDialog = ref<boolean>(false);
const closeUpdateChild = () => {
  updateChildDialog.value = false;
};
const formUpdateChild = ref<UpdateChildProps>({
  name: "",
});
const errorsUpdateChild = ref<any>({
  name: "",
});

// update last child
const isEdit = ref<boolean | any>(false);
const currentTab = ref('tab-1');
const formUpdateLastChild = ref<UpdateLastChildProps>({
  mau_ky_tu_so_khung: "",
  vi_tri_dong_so_khung: "",
  mau_ky_tu_so_dong_co: "",
  vi_tri_dong_so_dong_co: "",
});

const openEditModal = () => {
  const type = selectedItems.value.length;

  if (type === 0) {
    updateParentDialog.value = true;
    isEdit.value = false;
    return;
  }

  if (type <= 2) {
    updateChildDialog.value = true;
    isEdit.value = false;
    return;
  }

  formUpdateLastChild.value.mau_ky_tu_so_khung = brands.value.mau_ky_tu_so_khung;
  formUpdateLastChild.value.vi_tri_dong_so_khung = brands.value.vi_tri_dong_so_khung;
  formUpdateLastChild.value.mau_ky_tu_so_dong_co = brands.value.mau_ky_tu_so_dong_co;
  formUpdateLastChild.value.vi_tri_dong_so_dong_co = brands.value.vi_tri_dong_so_dong_co;
  isEdit.value = !isEdit.value;

}

const fetchListBrand = async (props: { parent_id: number, type_parent: number, filterValue?: string }) => {
  return await $fetchAjaxDoi4({
    api: 'controllerCategories.php',
    body: { _function: 'listData', ...props }
  })
    .then((response) => response.json())
    .then((result) => {
      try {
        return result?.data?.map((x: any) => ({ ...x, parent_id: props.parent_id, children: [] }))
      } catch (error) {
        return result.data;
      }
    })
    .catch((error) => {
      console.error(error);
      toast.error("Không thể tìm thấy danh sách cháy nổ")
    });
}

const deleteBrand = async (props: { id: number }) => {
  return await $fetchAjaxDoi4({
    api: 'controllerCategories.php',
    body: { _function: 'delDataSKSM', ...props }
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error == false) {
        toast.success('Xóa thành công !');
        closeDelete();
        if (selectedItems.value.length > 0)
          selectItem(selectedItems.value[selectedItems.value.length - 1]);
        else fetchListBrand({
          parent_id: defaultParentId,
          type_parent: 0,
          filterValue: ""
        }).then((data) => brands.value = data)
      } else {
        closeDelete();
        toast.error('Xóa thất bại !');
      }
    })
    .catch((error) => {
      closeDelete();
      toast.error(error.message);
    });
}

const validateFormUpdateParent = () => {
  // Reset errors
  errorsUpdateParent.value = {};

  if (!formUpdateParent.value.name) {
    errorsUpdateParent.value.name = 'Name is required.';
  }

  if (!formUpdateParent.value.file) {
    errorsUpdateParent.value.file = 'File is required.';
  }

  return Object.keys(errorsUpdateParent.value).length === 0;
}

const handleUpdateParentSubmit = () => {

  if (!validateFormUpdateParent()) {
    return;
  }

  const formData = new FormData();
  formData.append('name', formUpdateParent.value.name);
  formData.append('file', formUpdateParent.value.file as any);
  formData.append('_function', "updateData");
  formData.append('parent_id', defaultParentId as any);
  formData.append('type_parent', 0 as any);

  $uploadAjaxDoi4({
    api: 'controllerCategories.php',
    formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.status) {
        toast.success('Thêm mới thành công');
        closeUpdateParent();
        selectItem(selectedItems.value[selectedItems.value.length - 1]);
      } else {
        closeUpdateParent();
        toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau');
      }
    })
    .catch((error) => {
      closeUpdateParent();
      toast.error(error.message);
    });
}

const validateFormUpdateChild = () => {
  // Reset errors
  errorsUpdateChild.value = {};

  if (!formUpdateChild.value.name) {
    errorsUpdateChild.value.name = 'Name is required.';
  }

  return Object.keys(errorsUpdateChild.value).length === 0;
}

const handleUpdateChildSubmit = () => {

  if (!validateFormUpdateChild()) {
    return;
  }

  const formData = new FormData();
  formData.append('name', formUpdateChild.value.name);
  formData.append('_function', "updateData");
  formData.append('parent_id', selectedItems.value[selectedItems.value.length - 1].id);
  formData.append('type_parent', selectedItems.value.length as any);

  $uploadAjaxDoi4({
    api: 'controllerCategories.php',
    formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.status) {
        toast.success('Thêm mới thành công');
        closeUpdateChild();
        selectItem(selectedItems.value[selectedItems.value.length - 1]);
      } else {
        closeUpdateChild();
        toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau');
      }
    })
    .catch((error) => {
      closeUpdateChild();
      toast.error(error.message);
    });
}

const handleUpdateLastChildSubmit = () => {
  const formData = new FormData();
  formData.append('vi_tri_dong_so_khung', formUpdateLastChild.value.vi_tri_dong_so_khung);
  formData.append('vi_tri_dong_so_dong_co', formUpdateLastChild.value.vi_tri_dong_so_dong_co);
  formData.append('mau_ky_tu_so_khung', formUpdateLastChild.value.mau_ky_tu_so_khung);
  formData.append('mau_ky_tu_so_dong_co', formUpdateLastChild.value.mau_ky_tu_so_dong_co);
  formData.append('_function', "updateData");
  formData.append('parent_id', selectedItems.value[selectedItems.value.length - 1].id);
  formData.append('type_parent', selectedItems.value.length as any);

  $uploadAjaxDoi4({
    api: 'controllerCategories.php',
    formData,
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error == false) {
        toast.success('Chỉnh sửa thành công');
        isEdit.value = false;
      } else {
        toast.error('Đã có lỗi xảy ra, vui lòng thử lại sau');
        isEdit.value = false;
      }
    })
    .catch((error) => {
      toast.error(error.message);
    });

}

fetchListBrand({
  parent_id: defaultParentId,
  type_parent: 0,
  filterValue: searchString.value
}).then((data) => brands.value = data);

const fetchData = _debounce(() => {
  if (selectedItems.value.length <= 0) {
    fetchListBrand({
      parent_id: defaultParentId,
      type_parent: 0,
      filterValue: searchString.value
    }).then((data) => brands.value = data);
  } else {
    var item = selectedItems.value[selectedItems.value.length - 1];
    fetchListBrand({
      parent_id: item.id,
      type_parent: 1,
      filterValue: searchString.value
    }).then((data) => brands.value = data);
  }
}, 500)
watch([searchString], fetchData)

const getBrandData = (item: any, search = "") => {
  if (item) {
    fetchListBrand({
      parent_id: item.id,
      type_parent: item.type_parent,
      filterValue: search
    }).then((data) => brands.value = data);
  } else {
    fetchListBrand({
      parent_id: defaultParentId,
      type_parent: 0,
      filterValue: search
    }).then((data) => brands.value = data);
  }
}

const selectItem = (item: any) => {
  const index = parseInt(item.type_parent) - 1;
  selectedItems.value[index] = item;
  selectedItems.value = selectedItems.value.slice(0, index + 1);
  getBrandData(item)
}

const onImageChange = (listImage: ImageFile[]) => {
  if (listImage.length <= 0) return;
  const fileReader = new FileReader();
  fileReader.readAsDataURL(listImage[0].file);
  formUpdateParent.value.file = listImage[0].file;
  fileReader.onload = () => {
    if (typeof fileReader.result === 'string') {
      sourceImage.value = fileReader.result;
    }
  };
}
</script>
<template>
  <VCard>
    <div class="mt-4">
      <nav class="mb-2 d-flex gap-2 items-center">
        <button v-if="selectedItems.length > 0" @click="() => { selectedItems = []; getBrandData(null); }">{{
          defaultParentName
        }}</button>
        <template v-for="(item, index) in selectedItems">
          <span><i class="tabler-chevron-right v-icon"></i></span>
          <b v-if="index + 1 == selectedItems.length">
            {{ item.name }}
          </b>
          <span v-else>
            <button @click="selectItem(item)">{{ item.name }}</button>
          </span>
        </template>
      </nav>
      <VRow>
        <VCol>
          <AppTextField v-if="selectedItems.length <= 2" v-model="searchString" class="" label=""
            placeholder="Lọc theo tên" />
        </VCol>
        <VCol sm="auto">
          <VBtn @click="openEditModal">
            <VIcon icon=" tabler-tool" /> Cập nhật dữ liệu
          </VBtn>
        </VCol>
      </VRow>
    </div>
    <div v-if="selectedItems.length <= 2" class="my-4">
      <VRow class="d-flex" v-if="brands && brands.length > 0">
        <VCol sm="3" md="4" lg="2" v-for="item in brands" v-key="item.id"
          class="d-flex items-center justify-center overflow-hidden">
          <VHover>
            <template v-slot:default="{ isHovering, props }">
              <div v-bind="props" class="position-relative w-100">
                <div @click="selectItem(item)" class="bg-white border d-flex"
                  style="padding: 10px; cursor: pointer; inline-size: 100%;">
                  <img :src="baseUrl + item.logo" :alt="item.name" width="100%" height="100px" class="m-auto"
                    style="align-self: center; object-fit: contain;" v-if="item.logo !== ''" />
                  <span v-else>{{ item.name }}</span>
                </div>
                <IconBtn @click="() => {
                  deleteDialog = true;
                  deleteItem = item;
                }" variant="text" position="absolute" :class="(isHovering ? 'd-inline-block' : 'd-none')"
                  :style="{ top: 0, right: 0 }">
                  <VIcon icon="tabler-trash" />
                </IconBtn>
              </div>
            </template>
          </VHover>
        </VCol>
      </VRow>
      <div v-else>
        Không tìm thấy dữ liệu
      </div>
    </div>
    <div v-else class="my-4">
      <div v-if="!isEdit">
        <VTabs v-model="currentTab">
          <VTab value="tab-1">Vị trí đóng số khung</VTab>
          <VTab value="tab-2">Vị trí đóng số động cơ</VTab>
          <VTab value="tab-3">Mẫu ký tự số khung</VTab>
          <VTab value="tab-4">Mẫu ký tự số động cơ</VTab>
        </VTabs>
        <VWindow v-model="currentTab">
          <VWindowItem value="tab-1">
            <VCard>
              <VCardItem class="border">
                <div v-html="brands.vi_tri_dong_so_khung ? brands.vi_tri_dong_so_khung : 'Không có dữ liệu'">
                </div>
              </VCardItem>
            </VCard>
          </VWindowItem>
          <VWindowItem value="tab-2">
            <VCard>
              <VCardItem class="border">
                <div v-html="brands.vi_tri_dong_so_dong_co ? brands.vi_tri_dong_so_dong_co : 'Không có dữ liệu'">
                </div>
              </VCardItem>
            </VCard>
          </VWindowItem>
          <VWindowItem value="tab-3">
            <VCard>
              <VCardItem class="border">
                <div v-html="brands.mau_ky_tu_so_khung ? brands.mau_ky_tu_so_khung : 'Không có dữ liệu'">
                </div>
              </VCardItem>
            </VCard>
          </VWindowItem>
          <VWindowItem value="tab-4">
            <VCard>
              <VCardItem class="border">
                <div v-html="brands.mau_ky_tu_so_dong_co ? brands.mau_ky_tu_so_dong_co : 'Không có dữ liệu'">
                </div>
              </VCardItem>
            </VCard>
          </VWindowItem>
        </VWindow>
      </div>
      <div v-else class="my-4">
        <VRow>
          <VCol sm="6">
            <h2 class="mb-2">Vị trí đóng số khung</h2>
            <CkEditorCustom :modelValue="formUpdateLastChild.vi_tri_dong_so_khung"
              @update:modelValue="($event: string) => (formUpdateLastChild.vi_tri_dong_so_khung = $event)" />
          </VCol>
          <VCol sm="6">
            <h2 class="mb-2">Vị trí đóng số động cơ</h2>
            <CkEditorCustom :modelValue="formUpdateLastChild.vi_tri_dong_so_dong_co"
              @update:modelValue="($event: string) => (formUpdateLastChild.vi_tri_dong_so_dong_co = $event)" />
          </VCol>
          <VCol sm="6">
            <h2 class="mb-2">Mẫu ký tự số khung</h2>
            <CkEditorCustom :modelValue="formUpdateLastChild.mau_ky_tu_so_khung"
              @update:modelValue="($event: string) => (formUpdateLastChild.mau_ky_tu_so_khung = $event)" />
          </VCol>
          <VCol sm="6">
            <h2 class="mb-2">Mẫu ký tự số động cơ</h2>
            <CkEditorCustom :modelValue="formUpdateLastChild.mau_ky_tu_so_dong_co"
              @update:modelValue="($event: string) => (formUpdateLastChild.mau_ky_tu_so_dong_co = $event)" />
          </VCol>
          <VCol sm="12">
            <div class="text-end">
              <VBtn @click="handleUpdateLastChildSubmit">
                Lưu
              </VBtn>
            </div>
          </VCol>
        </VRow>
      </div>
    </div>
  </VCard>

  <!-- 👉 Delete Dialog  -->
  <VDialog v-model="deleteDialog" max-width="500px">
    <VCard>
      <VCardTitle class="text-center">
        <div class="d-flex justify-end">
          <IconBtn @click="deleteDialog = false">
            <VIcon icon="tabler-x" />
          </IconBtn>
        </div>

        <div class="d-flex justify-center">
          <VIcon icon="tabler-alert-triangle" size="50" color="warning" />
        </div>
      </VCardTitle>

      <VCardTitle class="d-block font-weight-regular text-wrap text-center mb-4 py-0">
        <h4 class="text-md">
          Bản ghi '{{ deleteItem.name }}' sẽ được xóa ?
        </h4>
      </VCardTitle>

      <VCardActions>
        <VSpacer />

        <VBtn color="error" variant="outlined" @click="closeDelete">
          Hủy
        </VBtn>

        <VBtn color="success" variant="elevated" @click="deleteBrand({ id: deleteItem.id })">
          Xác nhận
        </VBtn>

        <VSpacer />
      </VCardActions>
    </VCard>
  </VDialog>

  <!-- 👉 Update parent Dialog  -->
  <VDialog v-model="updateParentDialog" max-width="500px">
    <VCard>

      <VCardTitle class="d-block font-weight-regular text-wrap text-center pt-8 pb-3">
        <h2 class="text-md">
          Thêm dữ liệu
        </h2>
      </VCardTitle>

      <VForm @submit.prevent="handleUpdateParentSubmit">
        <VCardTitle class="d-block pt-4 pb-6">
          <AppTextField v-model="formUpdateParent.name" class="mb-3" label="Nhập tên" required="true" />
          <span v-if="errorsUpdateParent.name" class="error">{{ errorsUpdateParent.name }}</span>
          <ImageDropZone2 @on-change="onImageChange" :base64Image="sourceImage" />
          <span v-if="errorsUpdateParent.file" class="error">{{ errorsUpdateParent.file }}</span>

        </VCardTitle>

        <VCardActions>
          <VSpacer />

          <VBtn color="error" variant="outlined" @click="closeUpdateParent">
            Hủy
          </VBtn>

          <VBtn type="submit" color="success" variant="elevated">
            Xác nhận
          </VBtn>

          <VSpacer />
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>

  <!-- 👉 Update child Dialog  -->
  <VDialog v-model="updateChildDialog" max-width="500px">
    <VCard>

      <VCardTitle class="d-block font-weight-regular text-wrap text-center pt-8 pb-3">
        <h2 class="text-md">
          Thêm dữ liệu
        </h2>
      </VCardTitle>

      <VForm @submit.prevent="handleUpdateChildSubmit">
        <VCardTitle class="d-block pt-4 pb-6">
          <AppTextField v-model="formUpdateChild.name" class="mb-3" label="Nhập tên" required="true" />
          <span v-if="errorsUpdateChild.name" class="error">{{ errorsUpdateChild.name }}</span>
        </VCardTitle>

        <VCardActions>
          <VSpacer />

          <VBtn color="error" variant="outlined" @click="closeUpdateChild">
            Hủy
          </VBtn>

          <VBtn type="submit" color="success" variant="elevated">
            Xác nhận
          </VBtn>

          <VSpacer />
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>

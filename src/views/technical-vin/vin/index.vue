<script setup lang="ts">
import { decodeVIN } from '@/plugins/vin-checker/src';
import { VINDecoded } from '@/plugins/vin-checker/src/vin';

var searchString = ref<string>("")
var reportMessage = ref<string>("")
var reportMessage = ref<string>("")
var vinData = ref<VINDecoded | null>(null)
var isSearch = ref<boolean>(false)
var isOpenModal = ref<boolean>(false)

const checkVIN = async () => {
  vinData.value = null;
  isSearch.value = false;

  const data: VINDecoded = decodeVIN(searchString.value);
  console.log(data.info)
  isSearch.value = true;
  vinData.value = data;
  if (!data.isValid) {
    toast.error(data.message || "Có lỗi xảy ra")
  }
}

const reportVinResult = async () => {
  useApiFetchAiService<any>(createUrl('/vin/report')).post({
    message: reportMessage.value,
    vin: searchString.value
  }).then(() => {
    toast.success("Đã báo cáo thành công");
    reportMessage.value = "";
    isOpenModal.value = false;
  });
}

const closeModal = () => {
  reportMessage.value = "";
  isOpenModal.value = false;
}

const rules = {
  length: (value: string) => value.length == 17 || "Phải đủ 17 ký tự",
}

const onInput = () => {
  return searchString.value = searchString.value.toUpperCase();
}

const onKeyPressed = (event: any) => {
  var regex = new RegExp("^[a-zA-Z0-9]+$");
  var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
}
</script>
<template>
  <VCard>
    <div class="mt-4">
      <div class="d-flex">
        <AppTextField counter="17" :error="vinData && !vinData.isValid" :error-messages="vinData?.message"
          v-model="searchString" maxlength="17" required :rules="[rules.length]" class="text-uppercase" label=""
          placeholder="Nhập số VIN..." @input="onInput" @keypress="onKeyPressed" />
        <VBtn @click="checkVIN">
          <VIcon icon=" tabler-search" /> Tra cứu
        </VBtn>
      </div>
      <div class="mt-5" v-if="isSearch && vinData">
        <template v-if="vinData.info && vinData.info.manufacturer && vinData.info.country">
          <h3 class="mb-5">Kết quả tìm kiếm cho: <strong>{{ vinData.vin }}</strong></h3>
          <v-table class="table table-striped">
            <tbody>
              <tr>
                <td>Vùng</td>
                <td>{{ vinData.info?.region }}</td>
              </tr>
              <tr>
                <td>Quốc gia</td>
                <td>{{ vinData.info?.country }}</td>
              </tr>
              <tr>
                <td>Nhà sản xuất</td>
                <td>{{ vinData.info?.manufacturer }}</td>
              </tr>
              <tr>
                <td>Model</td>
                <td>{{ vinData.info?.modelYear }}</td>
              </tr>
            </tbody>
          </v-table>
        </template>
        <p v-else>Không tìm thấy kết quả cho <strong>{{ vinData.vin }}</strong> </p>
        <small>Kết quả không chính xác? <button @click="() => isOpenModal = true">Chọn vào đây để báo
            cáo</button></small>
      </div>
    </div>
  </VCard>
  <VDialog v-model="isOpenModal" max-width="500px">
    <VCard>
      <VCardTitle class="d-block font-weight-regular text-wrap text-center pt-8 pb-3">
        <h2 class="text-md">
          Báo cáo
        </h2>
      </VCardTitle>

      <VForm @submit.prevent="reportVinResult">
        <VCardTitle class="d-block pt-4 pb-6">
          <AppTextField v-model="reportMessage" class="mb-3" label="Nội dung báo cáo" required="true" />
        </VCardTitle>

        <VCardActions>
          <VSpacer />

          <VBtn color="error" variant="outlined" @click="closeModal">
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
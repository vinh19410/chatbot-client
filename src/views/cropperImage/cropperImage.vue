<template>
  <div class="wrap-cropper">
    <div v-if="image" class="cropper-container">
      <img ref="imageRef" :src="image" />
    </div>
    <div class="btn-crop">
      <VBtn v-if="image" @click="cropImage">Crop Image</VBtn>
      &nbsp;
      <VBtn v-if="image" @click="rotate(-90)">Rotate Left</VBtn>
      &nbsp;
      <VBtn v-if="image" @click="rotate(90)">Rotate Right</VBtn>
    </div>
  </div>
</template>
<script>
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { nextTick, onMounted, ref, watch } from 'vue';
// import { VBtn } from 'vuetify/lib/components/index.mjs';

export default {
  props: {
    imageBase64: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const image = ref(props.imageBase64);
    const cropper = ref(null);
    const imageRef = ref(null);

    const initializeCropper = () => {
      if (imageRef.value) {
        if (cropper.value) {
          cropper.value.destroy(); // Destroy previous cropper instance if exists
        }
        cropper.value = new Cropper(imageRef.value, {
          viewMode: 1,
          autoCrop: true,
          rotatable: false, // Disable CropperJS rotation as we handle it manually
          scalable: true,
          checkOrientation: false,
          ready() {
            fitImageToContainer();
          }
        });
      }
    };

    const fitImageToContainer = () => {
      const containerData = cropper.value.getContainerData();
      const imageData = cropper.value.getImageData();
      const scale = Math.min(
        containerData.width / imageData.naturalWidth,
        containerData.height / imageData.naturalHeight
      );
      cropper.value.zoomTo(scale);
    };

    const rotate = (degree) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const imageElement = imageRef.value;
      const originalWidth = imageElement.naturalWidth;
      const originalHeight = imageElement.naturalHeight;

      // Adjust canvas size based on rotation
      if (degree % 180 !== 0) {
        canvas.width = originalHeight;
        canvas.height = originalWidth;
      } else {
        canvas.width = originalWidth;
        canvas.height = originalHeight;
      }

      // Rotate the context
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degree * Math.PI) / 180);
      ctx.drawImage(imageElement, -originalWidth / 2, -originalHeight / 2);

      // Update the image src with the new rotated image
      image.value = canvas.toDataURL();

      nextTick(() => {
        initializeCropper();
      });
    };

    const cropImage = () => {
      if (cropper.value) {
        cropper.value.getCroppedCanvas().toBlob((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            emit('update:croppedImage', reader.result);
          };
          reader.readAsDataURL(blob);
        }, 'image/jpeg');
      }
    };

    watch(() => props.imageBase64, (newBase64) => {
      image.value = newBase64;
      nextTick(() => {
        initializeCropper();
      });
    }, { immediate: true });

    onMounted(() => {
      nextTick(() => {
        initializeCropper();
      });
    });

    return {
      image,
      cropImage,
      imageRef,
      rotate
    };
  }
};
</script>
<style scoped>
.cropper-container {
  overflow: hidden;
  background-color: #f3f3f3;
  block-size: 400px;
  inline-size: 100%;
}

img {
  display: block;
  max-inline-size: 100%;
}

.btn-crop {
  padding-block-start: 10px;
  text-align: center;
}
</style>

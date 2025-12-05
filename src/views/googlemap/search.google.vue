<template>
  <div class="max-w-xl mx-auto p-4 bg-gray-50 h-[200px] overflow-y-auto">
    <div @click="selectAddress(map)" v-for="(map, index) in data" :key="index"
      class="bg-white shadow-md rounded-lg p-4 mb-3 hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <div class="flex items-center">
        <div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mr-4">
          {{ index + 1 }}
        </div>
        <div style="display: flex;align-items: center;justify-content: start;">
          <p class="text-lg font-semibold text-gray-700">
            {{ map.description }}<a
              :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(map.description)}`"
              target="_blank" class="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center">
              <svg style="inline-size: 20px;" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'GoogleMapsSearch',
  props: {
    address: {
      type: String,
      required: true,
    }
  },
  setup(props, { emit }) {
    const data = ref(null);

    const selectAddress = (map) => {
      var request = {
        placeId: map.place_id,
        fields: ['name', 'formatted_address', 'geometry']
      };
      var service = new google.maps.places.PlacesService(document.createElement('div'));
      service.getDetails(request, function (place, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          var address = place.formatted_address;
          var latitude = place.geometry.location.lat();
          var longitude = place.geometry.location.lng();
          emit('update:selectAddress', { latitude, longitude, address});
        } else {
          console.log("Không tìm thấy thông tin vị trí.");
        }
      });
    }

    const loadGoogleMaps = () => {
      return new Promise((resolve, reject) => {
        if (typeof google !== "undefined") {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyApvuR5ZwqjNqfIQooutflK7wSdV-y-msM&libraries=places,marker`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    const initMap = async () => {
      await loadGoogleMaps();
    };

    watch(() => props.address, (newValue, oldValue) => {
      showOnMap(newValue);
    })

    const showOnMap = (newValue) => {
      const service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ input: newValue }, function (predictions, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          data.value = predictions;
        }
      });
    };

    onMounted(() => {
      initMap();
    });

    return {
      showOnMap,
      data,
      selectAddress
    };
  },
};
</script>

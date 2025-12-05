<template>
  <div>
    <div id="map_canvas"></div>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue';

export default {
  name: 'GoogleMapsTable',
  props: {
    dataCam: {
      type: Array,
      required: true,
    }
  },
  setup(props) {
    const map = ref(null);
    const currentMarker = ref(null);

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
      const myLatLng = { lat: 21.0692328, lng: 105.800135 };
      map.value = new google.maps.Map(document.getElementById("map_canvas"), {
        zoom: 13,
        center: myLatLng,
        mapId: "35eced77d006e323",
        mapTypeControl: true,
      });
      props.dataCam.forEach((_, index) => showOnMap(index));
    };

    const showOnMap = (index) => {
      const { latitude, longitude, address, name, nameOwner, phone, statusText, image } = props.dataCam[index];

      // if (currentMarker.value) {
      //   currentMarker.value.setMap(null); // Ẩn marker trước đó
      // }
      const iconImageUrl = image || window.location.origin + "/images/logo/logo.png";

      // Sử dụng google.maps.Marker với biểu tượng
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(latitude, longitude),
        map: map.value,
        icon: {
          url: iconImageUrl,
          scaledSize: new google.maps.Size(45, 45),
        },
      });

      const contentString = `
        <div>
          <h5>Tên vụ án: ${name}</h5>
          <p>Địa chỉ: ${address}</p>
        </div>
      `;

      const infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      marker.addListener("click", () => {
        infowindow.open(map.value, marker);
      });

      currentMarker.value = marker;

      map.value.setCenter(marker.position);
      map.value.setZoom(15);

    };

    onMounted(() => {
      initMap();
    });

    return {
      showOnMap,
    };
  },
};
</script>

<style scoped>
#map_canvas {
  block-size: 70vh;
  inline-size: 100%;
}

#pac-input {
  padding: 5px;
  inline-size: 300px;
  margin-block-start: 10px;
}

table {
  border-collapse: collapse;
  inline-size: 100%;
  margin-block-end: 10px;
}

table,
th,
td {
  border: 1px solid black;
}

th,
td {
  padding: 8px;
  text-align: start;
}
</style>

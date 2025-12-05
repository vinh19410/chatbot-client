import CKEditor from "@ckeditor/ckeditor5-vue";
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { registerPlugins } from "@core/utils/plugins";
import App from "@/App.vue";

// Styles
import '@/assets/fonts/public-sans.css'
import "@core/scss/template/index.scss";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App).use(CKEditor);

// Register plugins
registerPlugins(app);

// Object.assign(window, { $: jQuery, jQuery });
const pinia = createPinia();

pinia.use(piniaPluginPersistedstate);

app.use(pinia);

// Mount vue app
app.mount("#app");

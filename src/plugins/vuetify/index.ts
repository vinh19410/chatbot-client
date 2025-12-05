import { getI18n } from '@/plugins/i18n/index';
import { deepMerge } from '@antfu/utils';
import { themeConfig } from '@themeConfig';
import type { App } from 'vue';
import { useI18n } from 'vue-i18n';
import { LoadingPlugin } from 'vue-loading-overlay';
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify';
import { createVuetify } from 'vuetify';
import { VBtn } from 'vuetify/components/VBtn';
import { VTreeview } from 'vuetify/labs/VTreeview';
import { createVueI18nAdapter } from 'vuetify/locale/adapters/vue-i18n';
import defaults from './defaults';
import { icons } from './icons';
import { staticPrimaryColor, staticPrimaryDarkenColor, themes } from './theme';

// Styles
import { cookieRef } from '@/@layouts/stores/config';
import '@core/scss/template/libs/vuetify/index.scss';
import 'vue-loading-overlay/dist/css/index.css';
import 'vue3-toastify/dist/index.css';
import 'vuetify/styles';

export default function (app: App) {
  const cookieThemeValues = {
    defaultTheme: resolveVuetifyTheme(themeConfig.app.theme),
    themes: {
      light: {
        colors: {
          'primary': cookieRef('lightThemePrimaryColor', staticPrimaryColor).value,
          'primary-darken-1': cookieRef('lightThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
        },
      },
      dark: {
        colors: {
          'primary': cookieRef('darkThemePrimaryColor', staticPrimaryColor).value,
          'primary-darken-1': cookieRef('darkThemePrimaryDarkenColor', staticPrimaryDarkenColor).value,
        },
      },
    },
  };

  const optionTheme = deepMerge({ themes }, cookieThemeValues);

  const vuetify = createVuetify({
    aliases: {
      IconBtn: VBtn,
    },
    defaults,
    icons,
    theme: optionTheme,
    locale: {
      adapter: createVueI18nAdapter({ i18n: getI18n(), useI18n }),
    },
    components: {
      VTreeview,
    },
  });

  app.use(vuetify);

  // import module notify
  app.use(Vue3Toastify, {
    autoClose: 3000,
  } as ToastContainerOptions);
  // import module loading
  app.use(LoadingPlugin);
}

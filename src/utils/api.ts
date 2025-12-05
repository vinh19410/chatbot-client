import axios from "axios";
import { ofetch } from "ofetch";
import type { ActiveLoader } from "vue-loading-overlay";
import { useLoading } from "vue-loading-overlay";
import { useAuthStore } from "@/store/auth";
import { router } from "@/plugins/1.router";

const $loading = useLoading();
let loaderInstance: ActiveLoader | null = null;
export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_AI || "/api",
  async onRequest({ options }) {
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    loaderInstance = $loading.show();
  },
  async onRequestError() {
    loaderInstance?.hide();
    throw new Error("Có lỗi xảy ra khi request");
  },
  async onResponse() {
    loaderInstance?.hide();
  },
  async onResponseError({ response }) {
    loaderInstance?.hide();
    throw new Error(response?._data?.message || "An error occurred");
  },
});

export const $apiAuthSerice = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_AI || "/api",
  async onRequest({ options }) {
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    loaderInstance = $loading.show();
  },
  async onRequestError() {
    loaderInstance?.hide();
    throw new Error("Có lỗi xảy ra khi request");
  },
  async onResponse() {
    loaderInstance?.hide();
  },
  async onResponseError({ response }) {
    loaderInstance?.hide();
    console.log("ressponse: ", response);
    throw new Error(response._data.message, { cause: response._data.field });
  },
});

export const $apiInternal = ofetch.create({
  baseURL: import.meta.env.VITE_API_INTERNAL_API || "/api",
  async onRequest({ options }) {
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    loaderInstance = $loading.show();
  },
  async onRequestError() {
    loaderInstance?.hide();
    throw new Error("Có lỗi xảy ra khi request");
  },
  async onResponse() {
    loaderInstance?.hide();
  },
  async onResponseError({ response }) {
    loaderInstance?.hide();
    throw new Error(response?._data?.message || "An error occurred");
  },
});

// export const $fetchApiImageService = ofetch.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL_CREATE_IMAGE || '/api',
//   async onRequest({ options }) {
//     const accessToken = useCookie('accessToken').value;
//     if (accessToken) {
//       options.headers = {
//         ...options.headers,
//         Authorization: `Bearer ${accessToken}`,
//       };
//     }
//     loaderInstance = $loading.show();
//   },
//   async onRequestError() {
//     loaderInstance?.hide();
//     throw new Error('Có lỗi xảy ra khi request');
//   },
//   async onResponse() {
//     loaderInstance?.hide();
//   },
//   async onResponseError({ response }) {
//     loaderInstance?.hide();
//     throw new Error(response?._data?.message || 'An error occurred');
//   },
// });

export const $fetchApiAiService = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_AI || "/api",
  async onRequest({ options }) {
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    if (!loaderInstance) loaderInstance = $loading.show(); // Chỉ tạo loader nếu chưa có
  },
  async onRequestError() {
    loaderInstance?.hide();
    loaderInstance = null; // Reset loader instance
    throw new Error("Có lỗi xảy ra khi request");
  },
  async onResponse() {
    loaderInstance?.hide();
    loaderInstance = null; // Reset loader instance
  },
  async onResponseError({ response }) {
    loaderInstance?.hide();
    loaderInstance = null; // Reset loader instance
  },
});

export const $fetchApiAiServiceNoLoading = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_AI || "/api",
  async onRequest({ options }) {
    loaderInstance?.hide();
    loaderInstance = null; 
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
  },
  async onRequestError() {
    throw new Error("Có lỗi xảy ra khi request");
  },
  async onResponse() {
  },
});

export const $fetchApiAiByBaseUrlService = (baseURL: string) => {
  const instance = axios.create({
    baseURL: baseURL || "/api",
    timeout: 3000,
  });

  instance.interceptors.request.use(
    (config) => {
      const accessToken = useCookie("accessToken").value;

      if (accessToken && config.headers?.set)
        config.headers.set("Authorization", `Bearer ${accessToken}`);

      loaderInstance = $loading.show();

      return config;
    },
    (error: any) => {
      loaderInstance?.hide();

      return Promise.reject(new Error(error));
    }
  );

  instance.interceptors.response.use(
    (response) => {
      loaderInstance?.hide();

      return response;
    },
    (error) => {
      loaderInstance?.hide();

      if (error.code === "ECONNABORTED")
        return Promise.reject(new Error("Không thể kết nối đến máy chủ"));

      const message = error?.response?.data?.message || "Đã có lỗi xảy ra";

      return Promise.reject(new Error(message));
    }
  );

  return instance;
};

export const $fetchAjax = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL_AJAX || "/ajax",
  async onRequest({ options }) {
    const accessToken = useCookie("accessToken").value;
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }
    loaderInstance = $loading.show();
  },
  async onRequestError() {
    loaderInstance?.hide();
    throw new Error("Có lỗi xảy ra khi request");
  },
  async onResponse() {
    if (loaderInstance) loaderInstance.hide();
  },
  async onResponseError({ response }) {
    if (loaderInstance) loaderInstance.hide();

    throw new Error(response?._data?.message || "An error occurred");
  },
});

export const $fetchAjaxDoi4 = async (props: { api: string; body: any }) => {
  const { api, body } = props;
  const baseURL = import.meta.env.VITE_API_BASE_URL_AJAX;
  const myHeaders = new Headers();

  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
  myHeaders.append("Accept", "application/json, text/javascript, */*");

  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: new URLSearchParams(body),
  };

  loaderInstance = $loading.show();
  try {
    const result = await fetch(`${baseURL}/${api}`, requestOptions);

    loaderInstance?.hide();

    return result;
  } catch (error) {
    loaderInstance?.hide();
    throw error;
  }
};

export const $uploadAjaxDoi4 = async (props: {
  api: string;
  formData: any;
}) => {
  const { api, formData } = props;
  const baseURL = import.meta.env.VITE_API_BASE_URL_AJAX;
  const myHeaders = new Headers();

  myHeaders.append("Accept", "*/*");

  const requestOptions: any = {
    method: "POST",
    headers: myHeaders,
    body: formData,
  };

  loaderInstance = $loading.show();
  try {
    const result = await fetch(`${baseURL}/${api}`, requestOptions);

    loaderInstance?.hide();

    return result;
  } catch (error) {
    loaderInstance?.hide();
    throw error;
  }
};

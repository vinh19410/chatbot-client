import { createFetch } from '@vueuse/core';
import { destr } from 'destr';

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL_AI || '/api',
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value;

      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,

        };
      }

      return { options };
    },
    afterFetch(ctx) {
      const { data, response } = ctx;

      // Parse data if it's JSON

      let parsedData = null;
      try {
        parsedData = destr(data);
      }
      catch (error) {
        console.error(error);
      }

      return { data: parsedData, response };
    },
  },
});

export const useApiInternal = createFetch({
  baseUrl: import.meta.env.VITE_API_INTERNAL_URL || '/api',
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value;

      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,

        };
      }

      return { options };
    },
    afterFetch(ctx) {
      const { data, response } = ctx;

      // Parse data if it's JSON

      let parsedData = null;
      try {
        parsedData = destr(data);
      }
      catch (error) {
        console.error(error);
      }

      return { data: parsedData, response };
    },
  },
});

// export const useApiFetchConfigService = createFetch({
//   baseUrl: import.meta.env.VITE_API_BASE_URL_CONFIG,
//   fetchOptions: {
//     headers: {
//       Accept: 'application/json',
//     },
//   },
//   options: {
//     refetch: true,
//     async beforeFetch({ options }) {
//       const accessToken = useCookie('accessToken').value;

//       if (accessToken) {
//         options.headers = {
//           ...options.headers,
//           Authorization: `Bearer ${accessToken}`,

//         };
//       }

//       return { options };
//     },
//     afterFetch(ctx) {
//       const { data, response } = ctx;

//       // Parse data if it's JSON

//       let parsedData = null;
//       try {
//         parsedData = destr(data);
//       }
//       catch (error) {
//         console.error(error);
//       }

//       return { data: parsedData, response };
//     },
//   },
// });

export const useApiFetchAiService = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL_AI,
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },
  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value;

      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,

        };
      }

      return { options };
    },
    afterFetch(ctx) {
      const { data, response } = ctx;

      // Parse data if it's JSON

      let parsedData = null;
      try {
        parsedData = destr(data);
      }
      catch (error) {
        console.error(error);
      }

      return { data: parsedData, response };
    },
  },
});


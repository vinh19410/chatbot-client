// src/utils/socket.ts
import { io } from "socket.io-client";

const baseUrlApi = import.meta.env.VITE_API_BASE_URL_AI;
const baseUrl = baseUrlApi.replace(/\/api$/, "");

export const socket = io(baseUrl, {
  transports: ["websocket", "polling"],
  withCredentials: false,
});

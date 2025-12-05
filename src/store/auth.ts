import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    userInfo: null as UserInfo | null,
    authenticated: false,
  }),
  actions: {
    setToken(token: string) {
      this.token = token;
      this.authenticated = true;
    },

    // setUserInfo(user: UserInfo) {
    //   this.userInfo = {
    //     id: user.id,
    //     name: user.fullname || user.username || "Unknown",
    //     imageUrl:
    //       user.imageUrl ||
    //       `${import.meta.env.BASE_URL ?? "/"}images/avatars/avatar-default.png`,
    //   };
    // },
    clearAuth() {
      this.token = null;
      this.userInfo = null;
      this.authenticated = false;
      useCookie("userData").value = null;
      useCookie("accessToken").value = null;
      useCookie("userAbilityRules").value = null;
    },
    setCookieUser(data: any) {
      const userData = {
        id: data._id,
        fullName: data.fullName || "Unknown",
        username: data.username || data.fullName || "Unknown",
        avatar:
          data.imageUrl ||
          `${import.meta.env.BASE_URL ?? "/"}images/avatars/avatar-default.png`,
        email: data.email || "admin@demo.com",
        phone: data.phone || null,
        role: "user",
        abilityRules: [
          {
            action: "manage",
            subject: "all",
          },
        ],
      };

      this.userInfo = userData;
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: "auth",
        storage: localStorage,
        paths: ["token", "userInfo"],
      },
    ],
  },
});

interface UserInfo {
  id: string;
  fullName: string;
  username: string;
  avatar: string;
  email: string;
  phone: string | null;
  role: string;
  abilityRules: Array<{
    action: string;
    subject: string;
  }>;
  plan?: string;
  planExpire?: string;
}

import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: localStorage.getItem("wm_token") || null,
  user: JSON.parse(localStorage.getItem("wm_user") || "null"),

  login: (token, user) => {
    localStorage.setItem("wm_token", token);
    localStorage.setItem("wm_user", JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem("wm_token");
    localStorage.removeItem("wm_user");
    set({ token: null, user: null });
  },
}));

export default useAuthStore;

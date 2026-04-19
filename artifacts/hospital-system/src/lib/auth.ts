import { create } from "zustand";

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string | null, user: any | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("auth_token"),
  user: JSON.parse(localStorage.getItem("auth_user") || "null"),
  setAuth: (token, user) => {
    if (token) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    set({ token: null, user: null });
  },
}));

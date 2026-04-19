import { create } from "zustand";
import type { Staff } from "@workspace/api-client-react";

interface AuthState {
  token: string | null;
  user: Staff | null;
  setAuth: (token: string | null, user: Staff | null) => void;
  logout: () => void;
}

function readUser(): Staff | null {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as Staff) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("auth_token"),
  user: readUser(),
  setAuth: (token, user) => {
    if (token && user) {
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

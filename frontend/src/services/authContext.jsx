import { createContext, useContext, useState } from "react";
import { api } from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );
  const token = user?.token || null;

  async function login(email, password) {
    const res = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const fullUser = { ...res.user, token: res.token };
    localStorage.setItem("user", JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser; 
  }

  async function register(name, email, password) {
    const res = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    const fullUser = { ...res.user, token: res.token };
    localStorage.setItem("user", JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  }

  async function resetPassword(email, password) {
    await api("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  function updateUser(partial) {
    if (!partial) return;
    setUser((prev) => {
      const merged = { ...(prev || {}), ...partial };
      try { localStorage.setItem("user", JSON.stringify(merged)); } catch {}
      return merged;
    });
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, resetPassword, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);






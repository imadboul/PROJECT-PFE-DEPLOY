import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore user from token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        toast.error("Invalid token");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    setLoading(false);
  }, []);

  // LOGIN
  async function login(email, password) {
    try {
      const res = await api.post("/client/login/", {
        email,
        password,
      });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const decoded = jwtDecode(accessToken);
      setUser(decoded);

      return { success: true };
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data,
        };
      }

      return { success: false, error: null };
    }
  }

  // SIGNUP
  async function signUp(data) {
    try {
      await api.post("/client/signUp/", data);
      return { success: true };
    } catch (error) {
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data,
        };
      }

      return { success: false, error: null };
    }
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
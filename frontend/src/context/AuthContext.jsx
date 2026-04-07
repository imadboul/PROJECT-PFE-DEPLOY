import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import jwtDecode from "jwt-decode"; 

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore user from token
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        console.log("Invalid token", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }

    setLoading(false);
  }, []);

  // ✅ LOGIN
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
    } catch (err) {
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Login failed";

      return {
        success: false,
        error: errorMessage, // ✅ string فقط
      };
    }
  }

  // ✅ SIGNUP
  async function signUp(data) {
    try {
      await api.post("/client/signUp/", data);
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        "Signup failed";

      return { success: false, error: errorMessage };
    }
  }

  // ✅ LOGOUT
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
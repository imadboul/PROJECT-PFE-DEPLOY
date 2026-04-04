import { createContext, useEffect, useState } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Restore user from token
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (e) {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // ✅ SIGN UP
  async function signUp(data) {
    try {
      await api.post("/client/signUp/", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber,
      });


      return { success: true ,message: "Registration successful.Please check your email to verify your account."};
    } catch (err) {
  return { success: false, error: err.response?.data };
}
  }

  // ✅ LOGIN (JWT from backend)
  async function login(email, password) {
    try {
      const res = await api.post("/client/login/", {
        email,
        password,
      });

      const accessToken = res.data.access;
      const refreshToken = res.data.refresh;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const decoded = jwtDecode(accessToken);
      setUser(decoded);

      return { success: true, message: "Login successful" };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Login failed",
      };
    }
  }

  // ✅ LOGOUT
  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ signUp, login, logout, user,loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

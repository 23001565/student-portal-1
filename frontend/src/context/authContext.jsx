// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial auth check
  useEffect(() => {
    let alive = true;

    authApi
      .me()
      .then((res) => {
        if (alive) setUser(res.user);
      })
      .catch(() => {
        if (alive) setUser(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // Global logout on 401
  useEffect(() => {
    const handler = () => {
      setUser(null);
    };

    window.addEventListener("auth:logout", handler);
    return () => {
      window.removeEventListener("auth:logout", handler);
    };
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    console.log("Auth context logout called");
    await authApi.logout();
    console.log("Auth API logout completed, setting user to null");
    setUser(null);
    console.log("User set to null");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

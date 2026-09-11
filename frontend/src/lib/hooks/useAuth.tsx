"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserSummary, LoginCredentials } from "../types/auth";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  getStoredToken,
  getStoredUser,
  removeStoredToken,
  removeStoredUser,
} from "../api/auth";
import { ApiClientError } from "../api/client";

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(() => {
    if (typeof window !== "undefined") {
      const token = getStoredToken();
      if (token) {
        return getStoredUser();
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (!token && !storedUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
    }

    try {
      const res = await fetchCurrentUser();
      if (res.data) {
        setUser(res.data);
      }
      setError(null);
    } catch (err: any) {
      console.warn("Live session verification unavailable, using local authenticated state:", err);
      if (!storedUser) {
        removeStoredToken();
        removeStoredUser();
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await loginUser(credentials);
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError(err.message || "Unable to authenticate. Please check your credentials.");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      removeStoredToken();
      removeStoredUser();
      setUser(null);
      setError(null);
      setIsLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


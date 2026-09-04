"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { UserSummary, LoginCredentials } from "../types/auth";
import { fetchCurrentUser, loginUser, logoutUser, switchUserRole, getStoredToken } from "../api/auth";
import { ApiClientError } from "../api/client";

interface AuthContextType {
  user: UserSummary | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (targetRole: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetchCurrentUser();
      setUser(res.data);
      setError(null);
    } catch (err: any) {
      console.warn("Session expired or invalid:", err);
      setUser(null);
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
      setUser(res.data.user);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unable to authenticate. Please check your credentials.");
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
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  const switchRole = async (targetRole: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await switchUserRole(targetRole);
      setUser(res.data.user);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Failed to switch role context.");
      }
      throw err;
    } finally {
      setIsLoading(false);
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
        switchRole,
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

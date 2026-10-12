import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { User, AuthContextType } from "../types";
import { registerUser, loginUser, getToken, saveToken, logoutUser, getCurrentUser } from "../api/auth";
import { ApiError } from "../api/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!!getToken());

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      const token = getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getCurrentUser();
        if (!cancelled) {
          setUser(data.user);
        }
      } catch {
        logoutUser();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const onUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener("wellmind:unauthorized", onUnauthorized);
    void restore();
    return () => {
      cancelled = true;
      window.removeEventListener("wellmind:unauthorized", onUnauthorized);
    };
  }, []);

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await registerUser({ name, email, password });
      if (response.msg === "User registered successfully") {
        return { success: true, message: "Signup successful! Please sign in." };
      }
      return { success: false, message: response.msg || "Signup failed" };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Signup failed. Try again.";
      return { success: false, message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser({ email, password });
      if (response.token && response.user) {
        saveToken(response.token);
        setUser({ id: String(response.user.id), name: response.user.name, email: response.user.email });
        return { success: true, message: "Login successful!" };
      }
      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Login failed. Try again.";
      return { success: false, message };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

import { useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser, User } from "@/api/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    if (stored && isLoggedIn === "true") {
      try {
        setUser(JSON.parse(stored));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");
      }
    }
  }, []);

  const login = async (emailOrPhone: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await loginUser(emailOrPhone, password);
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      }
      
      return data;
    } catch (error: any) {
      const errorMessage = error?.message || "Login failed. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (payload: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await registerUser(payload);
      
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
      }
      
      return data;
    } catch (error: any) {
      const errorMessage = error?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await logoutUser();
      setUser(null);
      setError(null);
    } catch (error: any) {
      console.error("Logout error:", error);
      // Even if logout fails on server, clear local state
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  return { 
    user, 
    login, 
    signup, 
    logout, 
    loading, 
    error,
    isLoggedIn: !!user 
  };
}
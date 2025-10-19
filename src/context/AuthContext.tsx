import { createContext, useContext, useState } from "react";

const AuthContext = createContext<{
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}>({ token: null, login: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    // ✅ restore from localStorage on first render
    return localStorage.getItem("authToken");
  });

  const login = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface UserProfile {
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("authToken");
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const storedUser = localStorage.getItem("userProfile");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Fetch user profile when token is available
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;

      try {
        const response = await fetch("/api/profiles/me", {
          headers: {
            Authorization: `Basic ${token}`,
          },
        });
        const result = await response.json();
        
        if (response.ok) {
          const userProfile: UserProfile = {
            name: `${result.firstName ?? ""} ${result.lastName ?? ""}`.trim() || "User",
            email: result.email,
            firstName: result.firstName,
            lastName: result.lastName,
          };
          setUser(userProfile);
          localStorage.setItem("userProfile", JSON.stringify(userProfile));
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userProfile");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  doctorName: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctorName, setDoctorName] = useState("");

  const login = (email: string, _password: string) => {
    // Demo login - accepts any non-empty credentials
    if (email && _password) {
      setIsAuthenticated(true);
      setDoctorName(email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setDoctorName("");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, doctorName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

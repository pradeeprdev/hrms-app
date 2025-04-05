import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const TOKEN_EXPIRY = 2 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const tokenTime = localStorage.getItem("tokenTime");

    if (storedToken && tokenTime) {
      const timePassed = Date.now() - parseInt(tokenTime, 10);
      if (timePassed < TOKEN_EXPIRY) {
        setUser({ token: storedToken });
        setLoading(false);
        const timeout = setTimeout(() => logout(), TOKEN_EXPIRY - timePassed);
        return () => clearTimeout(timeout);
      } else {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("tokenTime", Date.now());
    setUser({ token });
    setTimeout(() => logout(), TOKEN_EXPIRY);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenTime");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

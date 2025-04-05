import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const TOKEN_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const tokenTime = localStorage.getItem("tokenTime");

    if (storedToken && tokenTime) {
      const timePassed = Date.now() - parseInt(tokenTime);
      if (timePassed < TOKEN_EXPIRY) {
        setUser({ token: storedToken });
        const timeout = setTimeout(() => logout(), TOKEN_EXPIRY - timePassed);
        return () => clearTimeout(timeout);
      } else {
        logout();
      }
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
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
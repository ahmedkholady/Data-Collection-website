import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Default admin credentials
const DEFAULT_AUTH = {
  username: 'admin',
  password: 'admin',
};

export const AuthProvider = ({ children }) => {
  // Stored credentials (allows client to change them)
  const [credentials, setCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('app-credentials');
      return saved ? JSON.parse(saved) : DEFAULT_AUTH;
    } catch {
      return DEFAULT_AUTH;
    }
  });

  // Login session state - uses sessionStorage so reopening browser/tab always starts at /login
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Clear any legacy persistent login from localStorage
    localStorage.removeItem('app-auth-session');
    return sessionStorage.getItem('app-auth-session') === 'true';
  });

  // Current user info
  const [currentUser, setCurrentUser] = useState(() => {
    return {
      username: credentials.username,
      role: 'admin',
    };
  });

  // Login handler
  const login = async (username, password) => {
    // Simulate network delay for smooth UX
    await new Promise((res) => setTimeout(res, 500));

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (trimmedUser === credentials.username && trimmedPass === credentials.password) {
      setIsAuthenticated(true);
      setCurrentUser({ username: trimmedUser, role: 'admin' });
      sessionStorage.setItem('app-auth-session', 'true');
      return { success: true };
    } else {
      return {
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة!',
      };
    }
  };

  // Logout handler
  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('app-auth-session');
    localStorage.removeItem('app-auth-session');
  };

  // Update credentials handler (allows client to change username/password)
  const updateCredentials = (newUsername, newPassword) => {
    const updated = {
      username: newUsername.trim(),
      password: newPassword.trim(),
    };
    setCredentials(updated);
    setCurrentUser((prev) => ({ ...prev, username: updated.username }));
    localStorage.setItem('app-credentials', JSON.stringify(updated));
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        credentials,
        login,
        logout,
        updateCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

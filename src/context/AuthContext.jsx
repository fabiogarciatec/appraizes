import { createContext, useState, useContext, useEffect } from 'react';
import ApiService from '../services/ApiService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há um usuário salvo no localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Tentando login com ApiService...');
      
      // Autenticação via ApiService para manter a consistência
      const data = await ApiService.post('/api/auth/login', { username, password });
      console.log('Resposta do login:', data);
      
      if (data.success && data.user) {
        // Usuário autenticado com sucesso
        setCurrentUser(data.user);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro durante login:', error);
      throw error; // Propagar o erro para que o componente Login possa tratá-lo
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

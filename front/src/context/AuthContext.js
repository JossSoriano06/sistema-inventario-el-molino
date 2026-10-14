import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import * as SecureStore from 'expo-secure-store';

import { iniciarSesion } from '../services/authService';
import {
  establecerToken,
  establecerAlSesionExpirada,
} from '../services/api';

const CLAVE_SESION = 'sesion';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // sesion = { token, id, nombreUsuario, nombreCompleto, rol } o null
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [aviso, setAviso] = useState('');

  const logout = useCallback(async () => {
    establecerToken(null);
    setSesion(null);

    try {
      await SecureStore.deleteItemAsync(CLAVE_SESION);
    } catch (error) {
      // si no se pudo borrar, la sesión en memoria ya se cerró
    }
  }, []);

  // Cuando el backend rechaza el token (vencido o inválido)
  const sesionExpirada = useCallback(() => {
    setAviso('Tu sesión expiró. Inicia sesión nuevamente.');
    logout();
  }, [logout]);

  // Al abrir la app: recuperar la sesión guardada, si existe
  useEffect(() => {
    establecerAlSesionExpirada(sesionExpirada);

    async function restaurarSesion() {
      try {
        const guardada = await SecureStore.getItemAsync(CLAVE_SESION);

        if (guardada) {
          const datos = JSON.parse(guardada);

          if (datos.token) {
            establecerToken(datos.token);
            setSesion(datos);
          }
        }
      } catch (error) {
        // sin sesión guardada o ilegible: se muestra el login
      } finally {
        setCargando(false);
      }
    }

    restaurarSesion();
  }, [sesionExpirada]);

  async function login(nombreUsuario, contrasena, recordar = true) {
    const datos = await iniciarSesion(nombreUsuario.trim(), contrasena);

    establecerToken(datos.token);

    try {
      if (recordar) {
        await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(datos));
      } else {
        await SecureStore.deleteItemAsync(CLAVE_SESION);
      }
    } catch (error) {
      // si no se pudo guardar, la sesión sigue activa mientras la app esté abierta
    }

    setAviso('');
    setSesion(datos);
  }

  return (
    <AuthContext.Provider value={{ sesion, cargando, aviso, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }

  return contexto;
}

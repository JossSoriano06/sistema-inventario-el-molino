
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const PUERTO = 8080;
const TIEMPO_MAXIMO_MS = 30000;

// Si la detección automática falla, coloca aquí la IP de tu PC.
const IP_MANUAL = null;

function obtenerHost() {
  if (IP_MANUAL) {
    return IP_MANUAL;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : null;

  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

export const API_URL = `http://${obtenerHost()}:${PUERTO}/api`;

console.log('API_URL:', API_URL);

// Token JWT
let tokenActual = null;
let alSesionExpirada = null;

export function establecerToken(token) {
  tokenActual = token;
}
export function obtenerTokenActual() {
  return tokenActual;
}
export function establecerAlSesionExpirada(funcion) {
  alSesionExpirada = funcion;
}

// Peticiones al Backend
export async function apiFetch(ruta, opciones = {}) {
  const { headers = {}, ...resto } = opciones;

  const controlador = new AbortController();

  const temporizador = setTimeout(
    () => controlador.abort(),
    TIEMPO_MAXIMO_MS
  );

  // Detectar si el cuerpo es FormData
  const esFormData =
    typeof FormData !== 'undefined' &&
    resto.body instanceof FormData;

  // Preparar encabezados
  const encabezados = {
    ...(tokenActual
      ? { Authorization: `Bearer ${tokenActual}` }
      : {}),
    ...headers,
  };

  // JSON necesita Content-Type.
  // FormData debe establecerlo automáticamente React Native.
  if (!esFormData && resto.body !== undefined) {
    encabezados['Content-Type'] = 'application/json';
  }

  let respuesta;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...resto,
      signal: controlador.signal,
      headers: encabezados,
    });

  } catch (error) {

    if (error.name === 'AbortError') {
      throw new Error('La petición tardó demasiado tiempo.');
    }

    throw error;

  } finally {
    clearTimeout(temporizador);
  }

  // Sesión vencida
  if (
    respuesta.status === 401 &&
    tokenActual &&
    alSesionExpirada
  ) {
    alSesionExpirada();
  }

  return respuesta;
}

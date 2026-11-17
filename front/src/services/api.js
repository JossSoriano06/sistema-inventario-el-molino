import Constants from 'expo-constants';
import { Platform } from 'react-native';
 
const PUERTO = 8080;
const TIEMPO_MAXIMO_MS = 10000;
 
// Si la detección automática falla (por ejemplo con el modo "tunnel" de Expo),
// escribe aquí la IP de tu PC, por ejemplo: '192.168.1.15'
const IP_MANUAL = null;
 
function obtenerHost() {
  if (IP_MANUAL) {
    return IP_MANUAL;
  }
 
  // Expo sabe en qué IP está corriendo tu PC; sirve para celular físico y emulador
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri ? hostUri.split(':')[0] : null;
 
  if (host && host !== 'localhost' && host !== '127.0.0.1') {
    return host;
  }
 
  // El emulador de Android ve el localhost de la PC como 10.0.2.2
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}
 
export const API_URL = `http://${obtenerHost()}:${PUERTO}/api`;
 
// Mira esta línea en la terminal de Expo para saber a qué dirección se conecta la app
console.log('API_URL:', API_URL);
 
// El token vive aquí en memoria; el AuthContext lo actualiza al iniciar y cerrar sesión
let tokenActual = null;
let alSesionExpirada = null;
 
export function establecerToken(token) {
  tokenActual = token;
}
 
// El AuthContext registra aquí qué hacer cuando el backend rechaza el token
export function establecerAlSesionExpirada(funcion) {
  alSesionExpirada = funcion;
}
 
// Única puerta de salida hacia el backend: agrega el token a cada petición
export async function apiFetch(ruta, opciones = {}) {
  const { headers, ...resto } = opciones;
 
  // Si el backend no responde en 10 segundos, se corta en vez de quedar cargando para siempre
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TIEMPO_MAXIMO_MS);
 
  let respuesta;
 
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...resto,
      signal: controlador.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(tokenActual ? { Authorization: `Bearer ${tokenActual}` } : {}),
        ...headers,
      },
    });
  } finally {
    clearTimeout(temporizador);
  }
 
  // 401 con una sesión activa = token vencido o inválido: volver al login
  if (respuesta.status === 401 && tokenActual && alSesionExpirada) {
    alSesionExpirada();
  }
 
  return respuesta;
}
 
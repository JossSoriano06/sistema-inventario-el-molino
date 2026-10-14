import { apiFetch } from './api';

// Llama al backend y devuelve { token, id, nombreUsuario, nombreCompleto, rol }
export async function iniciarSesion(nombreUsuario, contrasena) {
  let respuesta;

  try {
    respuesta = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ nombreUsuario, contrasena }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No se pudo iniciar sesión.');
  }

  return datos;
}

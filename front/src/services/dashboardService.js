import { apiFetch } from './api';

export async function obtenerResumenDashboard(periodo = 'semana') {

  try {

    const respuesta = await apiFetch(
      `/dashboard/resumen?periodo=${periodo}`
    );

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(
        datos.mensaje ||
        datos.message ||
        `Error HTTP ${respuesta.status}`
      );
    }

    return datos;

  } catch (error) {

    console.error('Error al obtener Dashboard:', error);

    throw error;
  }
}
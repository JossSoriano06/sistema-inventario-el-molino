import { apiFetch } from './api';

// Historial de movimientos de inventario
export async function obtenerMovimientos() {
  const respuesta = await apiFetch('/inventario');

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener el historial.');
  }

  return await respuesta.json();
}

// Registrar una entrada o salida de stock
export async function registrarMovimiento(movimiento) {
  const respuesta = await apiFetch('/inventario', {
    method: 'POST',
    body: JSON.stringify(movimiento),
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(datos.mensaje || 'No se pudo registrar el movimiento.');
  }

  return datos;
}

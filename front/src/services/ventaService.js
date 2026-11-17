
import { apiFetch } from './api';

// Registrar una venta con una lista de productos y cantidades
export async function registrarVenta(detalles) {
  const respuesta = await apiFetch('/ventas', {
    method: 'POST',
    body: JSON.stringify({
      detalles: detalles.map((item) => ({
        productoId: Number(item.productoId),
        cantidad: Number(item.cantidad),
      })),
    }),
  });

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        datos.message ||
        'No se pudo registrar la venta.'
    );
  }

  return datos;
}

// Consultar todas las ventas registradas
export async function obtenerVentas() {
  const respuesta = await apiFetch('/ventas');

  if (!respuesta.ok) {
    throw new Error(
      'No se pudo obtener el historial de ventas.'
    );
  }

  return await respuesta.json();
}

// Consultar una venta por su identificador
export async function obtenerVentaPorId(id) {
  const respuesta = await apiFetch(`/ventas/${id}`);

  const datos = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje ||
        datos.message ||
        'No se pudo obtener el detalle de la venta.'
    );
  }

  return datos;
}

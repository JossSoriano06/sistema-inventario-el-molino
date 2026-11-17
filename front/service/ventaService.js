import { obtenerProductos } from './productoService';

const API_URL = 'http://10.0.2.2:8080/api';

export async function registrarVenta(detalles) {
  const respuesta = await fetch(`${API_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      detalles: detalles.map((item) => ({
        productoId: Number(item.productoId),
        cantidad: Number(item.cantidad),
      })),
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No se pudo registrar la venta.'
    );
  }

  return datos;
}

export async function obtenerVentas() {
  const respuesta = await fetch(`${API_URL}/ventas`);

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener el historial de ventas.');
  }

  return respuesta.json();
}

export async function obtenerVentaPorId(id) {
  const respuesta = await fetch(`${API_URL}/ventas/${id}`);

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.mensaje || 'No se pudo obtener la venta.'
    );
  }

  return datos;
}

export { obtenerProductos };
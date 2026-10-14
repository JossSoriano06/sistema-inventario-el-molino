import { apiFetch } from './api';

// Obtener todos los productos
export async function obtenerProductos() {
  const respuesta = await apiFetch('/productos');

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}

// Registrar un producto
export async function registrarProducto(producto) {
  const respuesta = await apiFetch('/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo registrar el producto');
  }

  return await respuesta.json();
}

// Actualizar un producto existente
export async function actualizarProducto(id, producto) {
  const respuesta = await apiFetch(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo actualizar el producto');
  }

  return await respuesta.json();
}

// Eliminar un producto
export async function eliminarProducto(id) {
  const respuesta = await apiFetch(`/productos/${id}`, {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar el producto');
  }
}

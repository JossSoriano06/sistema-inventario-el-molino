
const API_URL = 'http://10.0.2.2:8080/api/productos';

// Obtener todos los productos
export async function obtenerProductos() {
  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}

// Registrar un producto
export async function registrarProducto(producto) {
  const respuesta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo registrar el producto');
  }

  return await respuesta.json();
}

// Actualizar un producto existente
export async function actualizarProducto(id, producto) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo actualizar el producto');
  }

  return await respuesta.json();
}

// Eliminar un producto
export async function eliminarProducto(id) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar el producto');
  }
}

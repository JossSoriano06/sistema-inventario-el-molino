

import { apiFetch, API_URL, obtenerTokenActual } from './api';
import * as FileSystem from 'expo-file-system/legacy';

// OBTENER TODOS LOS PRODUCTOS


export async function obtenerProductos() {
  const respuesta = await apiFetch('/productos');

  if (!respuesta.ok) {
    throw new Error('No se pudieron cargar los productos');
  }

  return await respuesta.json();
}


// REGISTRAR UN PRODUCTO


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


// ACTUALIZAR UN PRODUCTO


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


// SUBIR FOTOGRAFÍA DE UN PRODUCTO



export async function subirImagenProducto(id, uri) {

  if (!uri || typeof uri !== 'string') {
    throw new Error('No se recibió una fotografía válida.');
  }

  const extension = uri
    .split('?')[0]
    .split('.')
    .pop()
    .toLowerCase();

  const tiposPermitidos = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };

  const tipo = tiposPermitidos[extension];

  if (!tipo) {
    throw new Error('Formato de imagen no permitido.');
  }

  const token = obtenerTokenActual();

  if (!token) {
    throw new Error('Tu sesión ha expirado. Inicia sesión nuevamente.');
  }

  try {

    const resultado = await FileSystem.uploadAsync(
      `${API_URL}/productos/${id}/imagen`,
      uri,
      {
        httpMethod: 'POST',

        uploadType: FileSystem.FileSystemUploadType.MULTIPART,

        fieldName: 'imagen',

        mimeType: tipo,

        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const datos = JSON.parse(resultado.body || '{}');

    if (resultado.status < 200 || resultado.status >= 300) {
      throw new Error(
        datos.message ||
        datos.mensaje ||
        `Error al subir la imagen. Código: ${resultado.status}`
      );
    }

    return datos;

  } catch (error) {

    console.error('Error al subir fotografía:', error);

    throw error;
  }
}



// ELIMINAR UN PRODUCTO


export async function eliminarProducto(id) {
  const respuesta = await apiFetch(`/productos/${id}`, {
    method: 'DELETE',
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo eliminar el producto');
  }
}

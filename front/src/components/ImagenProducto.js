
import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../services/api';

const BASE_URL = API_URL.replace(/\/api\/?$/, '');

export function obtenerUrlImagen(imagenUrl) {
  if (!imagenUrl) return null;

  // Si ya es una URL completa, se utiliza directamente.
  if (
    imagenUrl.startsWith('http://') ||
    imagenUrl.startsWith('https://')
  ) {
    return imagenUrl;
  }

  // Si el backend devuelve una ruta relativa, se completa.
  const ruta = imagenUrl.startsWith('/')
    ? imagenUrl
    : `/${imagenUrl}`;

  return `${BASE_URL}${ruta}`;
}

export default function ImagenProducto({
  imagenUrl,
  ancho = 54,
  alto = 54,
  icono = 'package-variant-closed',
  tamanoIcono = 29,
}) {
  const [errorImagen, setErrorImagen] = useState(false);

  useEffect(() => {
    setErrorImagen(false);
  }, [imagenUrl]);

  const url = obtenerUrlImagen(imagenUrl);

  const mostrarImagen = url && !errorImagen;

  return (
    <View
      style={[
        styles.contenedor,
        {
          width: ancho,
          height: alto,
        },
      ]}
    >
      {mostrarImagen ? (
        <Image
          source={{ uri: url }}
          style={styles.imagen}
          resizeMode="cover"
          onError={() => setErrorImagen(true)}
        />
      ) : (
        <MaterialCommunityIcons
          name={icono}
          size={tamanoIcono}
          color="#8B4A2B"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: '#F7E9DD',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  imagen: {
    width: '100%',
    height: '100%',
  },
});

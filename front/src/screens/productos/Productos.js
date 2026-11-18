
import React, { useState, useCallback } from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {
  obtenerProductos,
  eliminarProducto,
} from '../../services/productoService';

import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../services/api';

// =====================================================
// CONSTRUIR URL COMPLETA DE LA IMAGEN
// =====================================================

function obtenerUrlImagen(imagenUrl) {

  if (!imagenUrl) {
    return null;
  }

  // Si ya es una URL completa, utilizarla directamente.
  if (
    imagenUrl.startsWith('http://') ||
    imagenUrl.startsWith('https://')
  ) {
    return imagenUrl;
  }

  // Obtener la dirección del servidor sin /api.
  const servidor = API_URL.replace(/\/api\/?$/, '');

  return `${servidor}${imagenUrl.startsWith('/') ? '' : '/'}${imagenUrl}`;
}

// =====================================================
// PANTALLA PRINCIPAL DE PRODUCTOS
// =====================================================

export default function Productos({ navigation }) {

  const { logout } = useAuth();

  const [buscar, setBuscar] = useState('');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // ===================================================
  // CARGAR PRODUCTOS AL ENTRAR A LA PANTALLA
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [])
  );

  async function cargarProductos() {

    try {

      setCargando(true);
      setError('');

      const datos = await obtenerProductos();

      setProductos(datos);

    } catch (e) {

      console.error('Error al cargar productos:', e);

      setError(
        'No se pudieron cargar los productos. Verifica el backend y la conexión.'
      );

    } finally {

      setCargando(false);

    }
  }

  // ===================================================
  // FILTRAR PRODUCTOS POR NOMBRE
  // ===================================================

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(buscar.toLowerCase())
  );

  // ===================================================
  // SELECCIONAR ICONO SEGÚN EL TIPO DE PRODUCTO
  // ===================================================

  const obtenerIconoProducto = (producto) => {

    const texto = `${producto.nombre || ''} ${producto.categoria || ''}`
      .toLowerCase();

    if (
      texto.includes('cheesecake') ||
      texto.includes('queso')
    ) {
      return 'cake-variant';
    }

    if (
      texto.includes('galleta') ||
      texto.includes('chispas')
    ) {
      return 'cookie';
    }

    if (
      texto.includes('torta') ||
      texto.includes('pastel')
    ) {
      return 'cake';
    }

    if (texto.includes('pan')) {
      return 'bread-slice';
    }

    if (
      texto.includes('cupcake') ||
      texto.includes('muffin')
    ) {
      return 'cupcake';
    }

    return 'food';
  };

  // ===================================================
  // OPCIONES DE PRODUCTO
  // ===================================================

  function mostrarOpciones(producto) {

    Alert.alert(
      producto.nombre,
      '¿Qué deseas hacer con este producto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Editar',
          onPress: () => {
            navigation.navigate('EditarProducto', {
              producto,
            });
          },
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => confirmarEliminacion(producto),
        },
      ]
    );
  }

  // ===================================================
  // CONFIRMAR ELIMINACIÓN
  // ===================================================

  function confirmarEliminacion(producto) {

    Alert.alert(
      'Eliminar producto',
      `¿Deseas eliminar "${producto.nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',

          onPress: async () => {

            try {

              await eliminarProducto(producto.id);

              await cargarProductos();

              Alert.alert(
                'Producto eliminado',
                'El producto se eliminó correctamente.'
              );

            } catch (error) {

              console.error('Error al eliminar:', error);

              Alert.alert(
                'Error',
                'No se pudo eliminar el producto.'
              );

            }
          },
        },
      ]
    );
  }

  // ===================================================
  // MOSTRAR IMAGEN O ICONO DEL PRODUCTO
  // ===================================================

  const renderImagenProducto = (producto) => {

    const urlImagen = obtenerUrlImagen(producto.imagenUrl);

    return (

      <View style={styles.imagenProducto}>

        {urlImagen ? (

          <Image
            source={{
              uri: urlImagen,
            }}
            style={styles.fotoProducto}
            resizeMode="cover"
            onError={(evento) => {
              console.error(
                `No se pudo cargar la imagen del producto ${producto.id}:`,
                evento.nativeEvent.error
              );
            }}
          />

        ) : (

          <MaterialCommunityIcons
            name={obtenerIconoProducto(producto)}
            size={38}
            color="#8B4A2B"
          />

        )}

      </View>
    );
  };

  // ===================================================
  // RENDERIZAR CADA PRODUCTO
  // ===================================================

  const renderProducto = ({ item }) => {

    const precio = Number(item.precio || 0);

    return (

      <View style={styles.productoCard}>

        {/* IMAGEN DEL PRODUCTO */}

        {renderImagenProducto(item)}

        {/* INFORMACIÓN */}

        <View style={styles.infoProducto}>

          <Text
            style={styles.nombreProducto}
            numberOfLines={1}
          >
            {item.nombre}
          </Text>

          <Text style={styles.precioProducto}>
            S/ {precio.toFixed(2)}
          </Text>

          <Text style={styles.stockProducto}>
            Stock: {item.stock}
          </Text>

        </View>

        {/* OPCIONES */}

        <TouchableOpacity
          onPress={() => mostrarOpciones(item)}
          hitSlop={10}
          style={styles.botonOpciones}
        >

          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color="#6F5A4A"
          />

        </TouchableOpacity>

      </View>
    );
  };

  // ===================================================
  // INTERFAZ PRINCIPAL
  // ===================================================

  return (

    <View style={styles.container}>

      {/* ENCABEZADO */}

      <View style={styles.header}>

        <Text style={styles.titulo}>
          Productos
        </Text>

        <TouchableOpacity
          style={styles.botonCerrar}
          onPress={logout}
          activeOpacity={0.7}
        >

          <Ionicons
            name="log-out-outline"
            size={20}
            color="#8B4A2B"
          />

          <Text style={styles.textoCerrar}>
            Cerrar sesión
          </Text>

        </TouchableOpacity>

      </View>

      {/* BUSCADOR */}

      <View style={styles.buscarContainer}>

        <Ionicons
          name="search-outline"
          size={21}
          color="#A8886D"
        />

        <TextInput
          style={styles.buscarInput}
          placeholder="Buscar producto..."
          placeholderTextColor="#A8886D"
          value={buscar}
          onChangeText={setBuscar}
        />

        <TouchableOpacity
          onPress={() => setBuscar('')}
        >

          <Ionicons
            name={buscar ? 'close-circle' : 'options-outline'}
            size={22}
            color="#8B4A2B"
          />

        </TouchableOpacity>

      </View>

      {/* LISTADO DE PRODUCTOS */}

      {cargando ? (

        <View style={styles.estado}>

          <ActivityIndicator
            size="large"
            color="#8B4A2B"
          />

          <Text style={styles.mensajeEstado}>
            Cargando productos...
          </Text>

        </View>

      ) : error ? (

        <View style={styles.estado}>

          <Text style={styles.mensajeError}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={cargarProductos}
          >

            <Text style={styles.textoReintentar}>
              Reintentar
            </Text>

          </TouchableOpacity>

        </View>

      ) : (

        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.lista}

          refreshing={cargando}
          onRefresh={cargarProductos}

          ListEmptyComponent={

            <Text style={styles.mensajeEstado}>
              {buscar
                ? 'No se encontraron productos.'
                : 'Todavía no hay productos registrados.'}
            </Text>

          }
        />

      )}

      {/* BOTÓN AGREGAR */}

      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => navigation.navigate('NuevoProducto')}
        activeOpacity={0.8}
      >

        <Ionicons
          name="add"
          size={32}
          color="#FFFFFF"
        />

      </TouchableOpacity>

    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },

  header: {
    height: 80,
    backgroundColor: '#8B4A2B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    paddingLeft: 25,
  },

  botonCerrar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EAD9C9',
    marginLeft: 'auto',
    marginRight: 15,
  },

  textoCerrar: {
    marginLeft: 5,
    color: '#8B4A2B',
    fontSize: 12,
    fontWeight: '600',
  },

  buscarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 18,
    paddingHorizontal: 13,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAD9C9',
  },

  buscarInput: {
    flex: 1,
    marginLeft: 9,
    fontSize: 14,
    color: '#5C3A21',
  },

  lista: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 100,
  },

  productoCard: {
    backgroundColor: '#FFFFFF',
    minHeight: 82,
    borderRadius: 13,
    marginBottom: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAD9C9',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  imagenProducto: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: '#F7E9DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },

  fotoProducto: {
    width: '100%',
    height: '100%',
  },

  infoProducto: {
    flex: 1,
  },

  nombreProducto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4F3424',
    marginBottom: 5,
  },

  precioProducto: {
    fontSize: 13,
    color: '#6F5A4A',
  },

  stockProducto: {
    fontSize: 13,
    color: '#48A875',
    fontWeight: '600',
    marginTop: 3,
  },

  botonOpciones: {
    padding: 5,
  },

  botonAgregar: {
    position: 'absolute',
    right: 22,
    bottom: 75,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#8B4A2B',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  mensajeEstado: {
    color: '#6F5A4A',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },

  mensajeError: {
    color: '#B42318',
    textAlign: 'center',
    fontSize: 14,
  },

  botonReintentar: {
    backgroundColor: '#8B4A2B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },

  textoReintentar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

});

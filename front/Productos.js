import React, { useState, useEffect, useCallback } from 'react';
import {View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import {obtenerProductos, actualizarProducto, eliminarProducto} from './service/productoService';


export default function Productos({ navigation }) {
  const [buscar, setBuscar] = useState('');
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
      setError(
        'No se pudieron cargar los productos. Verifica el backend y la conexión.'
      );
    } finally {
      setCargando(false);
    }
  }

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(buscar.toLowerCase())
  );



//accion de editar y eliminar producto
    
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




  const renderProducto = ({ item }) => {

    return (
      <TouchableOpacity style={styles.productoCard}>

        <View style={styles.imagenProducto}>
          <MaterialCommunityIcons
            name={item.icono}
            size={38}
            color="#8B4A2B"
          />
        </View>

        <View style={styles.infoProducto}>

          <Text style={styles.nombreProducto}>
            {item.nombre}
          </Text>

          <Text style={styles.precioProducto}>
            S/ {item.precio.toFixed(2)}
          </Text>

          <Text style={styles.stockProducto}>
            Stock: {item.stock}
          </Text>

        </View>

        <TouchableOpacity
          onPress={() => mostrarOpciones(item)}
          hitSlop={10}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={20}
            color="#6F5A4A"
          />
        </TouchableOpacity>

      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      

      <View style={styles.header}>

      <Text style={styles.titulo}>
        Productos
      </Text>

      <TouchableOpacity
        style={styles.botonCerrar}
        onPress={() => navigation.navigate('Login')}
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

        <TouchableOpacity>
          <Ionicons
            name="options-outline"
            size={22}
            color="#8B4A2B"
          />
        </TouchableOpacity>

      </View>


      



        {cargando ? (
          <View style={styles.estado}>
            <ActivityIndicator size="large" color="#8B4A2B" />
            <Text style={styles.mensajeEstado}>
              Cargando productos...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.estado}>
            <Text style={styles.mensajeError}>{error}</Text>

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
            ListEmptyComponent={
              <Text style={styles.mensajeEstado}>
                {buscar
                  ? 'No se encontraron productos.'
                  : 'Todavía no hay productos registrados.'}
              </Text>
            }
          />
        )}



      



      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => navigation.navigate('NuevoProducto')}
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

  bottomNav: {
    position: 'absolute',

    bottom: 0,
    left: 0,
    right: 0,

    height: 68,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#EAD9C9',

    flexDirection: 'row',

    justifyContent: 'space-around',

    alignItems: 'center',
  },

  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  navTexto: {
    fontSize: 11,

    color: '#7B6B5D',

    marginTop: 3,
  },

  navTextoActivo: {
    fontSize: 11,

    color: '#8B4A2B',

    fontWeight: '600',

    marginTop: 3,
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
},

textoCerrar: {
  marginLeft: 5,

  color: '#8B4A2B',

  fontSize: 12,
  fontWeight: '600',
},
});
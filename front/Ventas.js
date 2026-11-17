import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { obtenerProductos } from './service/productoService';
import { registrarVenta } from './service/ventaService';

export default function Ventas({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
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
      setError('No se pudieron cargar los productos.');
    } finally {
      setCargando(false);
    }
  }

  function agregarProducto(producto) {
    if (producto.stock <= 0) {
      Alert.alert(
        'Sin stock',
        'Este producto no tiene unidades disponibles.'
      );
      return;
    }

    setCarrito((actual) => {
      const existente = actual.find(
        (item) => item.productoId === producto.id
      );

      if (existente) {
        if (existente.cantidad >= producto.stock) {
          Alert.alert(
            'Stock insuficiente',
            `Solo hay ${producto.stock} unidades disponibles.`
          );
          return actual;
        }

        return actual.map((item) =>
          item.productoId === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [
        ...actual,
        {
          productoId: producto.id,
          nombre: producto.nombre,
          precio: Number(producto.precio),
          stock: producto.stock,
          cantidad: 1,
        },
      ];
    });
  }

  function cambiarCantidad(productoId, cambio) {
    setCarrito((actual) =>
      actual
        .map((item) => {
          if (item.productoId !== productoId) {
            return item;
          }

          const nuevaCantidad = item.cantidad + cambio;

          if (nuevaCantidad > item.stock) {
            Alert.alert(
              'Stock insuficiente',
              `Solo hay ${item.stock} unidades disponibles.`
            );
            return item;
          }

          return { ...item, cantidad: nuevaCantidad };
        })
        .filter((item) => item.cantidad > 0)
    );
  }

  function quitarProducto(productoId) {
    setCarrito((actual) =>
      actual.filter((item) => item.productoId !== productoId)
    );
  }

  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0
  );

  const cantidadTotal = carrito.reduce(
    (suma, item) => suma + item.cantidad,
    0
  );

  async function confirmarVenta() {
    if (carrito.length === 0) {
      Alert.alert(
        'Carrito vacío',
        'Agrega al menos un producto para registrar la venta.'
      );
      return;
    }

    Alert.alert(
      'Confirmar venta',
      `¿Deseas registrar la venta por S/ ${total.toFixed(2)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: registrarVentaConfirmada,
        },
      ]
    );
  }

  async function registrarVentaConfirmada() {
    try {
      setProcesando(true);

      const detalles = carrito.map((item) => ({
        productoId: item.productoId,
        cantidad: item.cantidad,
      }));

      const venta = await registrarVenta(detalles);

      setCarrito([]);
      await cargarProductos();

      Alert.alert(
        'Venta registrada',
        `La venta N.° ${venta.id} se registró correctamente.\nTotal: S/ ${Number(venta.total).toFixed(2)}`
      );
    } catch (e) {
      Alert.alert(
        'No se pudo registrar la venta',
        e.message || 'Verifica la conexión con el servidor.'
      );

      await cargarProductos();
    } finally {
      setProcesando(false);
    }
  }

  function renderProducto({ item }) {
    const sinStock = item.stock <= 0;

    return (
      <View style={styles.productoCard}>
        <View style={styles.iconoProducto}>
          <MaterialCommunityIcons
            name="cake-variant"
            size={30}
            color="#8B4A2B"
          />
        </View>

        <View style={styles.infoProducto}>
          <Text style={styles.nombreProducto}>
            {item.nombre}
          </Text>

          <Text style={styles.precioProducto}>
            S/ {Number(item.precio).toFixed(2)}
          </Text>

          <Text
            style={[
              styles.stockProducto,
              sinStock && styles.stockAgotado,
            ]}
          >
            {sinStock ? 'Sin stock' : `Stock: ${item.stock}`}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonAgregar,
            sinStock && styles.botonDeshabilitado,
          ]}
          disabled={sinStock}
          onPress={() => agregarProducto(item)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  }

  function renderCarrito({ item }) {
    return (
      <View style={styles.itemCarrito}>
        <View style={styles.infoCarrito}>
          <Text style={styles.nombreCarrito}>
            {item.nombre}
          </Text>

          <Text style={styles.precioCarrito}>
            S/ {(item.precio * item.cantidad).toFixed(2)}
          </Text>

          <Text style={styles.precioUnitario}>
            S/ {item.precio.toFixed(2)} por unidad
          </Text>
        </View>

        <View style={styles.controlesCantidad}>
          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => cambiarCantidad(item.productoId, -1)}
          >
            <MaterialCommunityIcons
              name="minus"
              size={18}
              color="#8B4A2B"
            />
          </TouchableOpacity>

          <Text style={styles.cantidad}>
            {item.cantidad}
          </Text>

          <TouchableOpacity
            style={styles.botonCantidad}
            onPress={() => cambiarCantidad(item.productoId, 1)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#8B4A2B"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonEliminar}
            onPress={() => quitarProducto(item.productoId)}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color="#B42318"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Ventas</Text>
          <Text style={styles.subtitulo}>
            Registra una nueva venta
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonHistorial}
          onPress={() => navigation.navigate('HistorialVentas')}
        >
          <MaterialCommunityIcons
            name="receipt-clock-outline"
            size={22}
            color="#8B4A2B"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tituloSeccion}>
        <Text style={styles.tituloLista}>Productos disponibles</Text>
      </View>

      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#8B4A2B"
          style={styles.cargando}
        />
      ) : error ? (
        <View style={styles.estado}>
          <Text style={styles.mensajeError}>{error}</Text>

          <TouchableOpacity
            style={styles.botonReintentar}
            onPress={cargarProductos}
          >
            <Text style={styles.textoBotonPrincipal}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaProductos}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No hay productos registrados.
            </Text>
          }
          ListFooterComponent={<View style={styles.espacioFinal} />}
        />
      )}

      <View style={styles.panelCarrito}>
        <View style={styles.encabezadoCarrito}>
          <View style={styles.filaTituloCarrito}>
            <MaterialCommunityIcons
              name="cart-outline"
              size={24}
              color="#8B4A2B"
            />
            <Text style={styles.tituloCarrito}>Carrito</Text>
            <Text style={styles.contadorCarrito}>
              {cantidadTotal} unidades
            </Text>
          </View>

          {carrito.length > 0 && (
            <TouchableOpacity
              onPress={() => setCarrito([])}
            >
              <Text style={styles.limpiarTexto}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {carrito.length === 0 ? (
          <Text style={styles.carritoVacio}>
            Agrega productos para comenzar la venta.
          </Text>
        ) : (
          <FlatList
            data={carrito}
            keyExtractor={(item) => String(item.productoId)}
            renderItem={renderCarrito}
            style={styles.listaCarrito}
            nestedScrollEnabled
          />
        )}

        <View style={styles.separador} />

        <View style={styles.totalFila}>
          <Text style={styles.textoTotal}>Total a pagar</Text>
          <Text style={styles.total}>
            S/ {total.toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonConfirmar,
            (carrito.length === 0 || procesando) &&
              styles.botonDeshabilitado,
          ]}
          disabled={carrito.length === 0 || procesando}
          onPress={confirmarVenta}
        >
          {procesando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.textoBotonPrincipal}>
                Confirmar venta
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },

  header: {
    backgroundColor: '#8B4A2B',
    paddingTop: 45,
    paddingBottom: 17,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titulo: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  subtitulo: {
    fontSize: 12,
    color: '#F0DDD0',
    marginTop: 4,
  },

  botonHistorial: {
    width: 42,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tituloSeccion: {
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 8,
  },

  tituloLista: {
    color: '#4F3424',
    fontSize: 16,
    fontWeight: 'bold',
  },

  listaProductos: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  productoCard: {
    backgroundColor: '#FFFFFF',
    minHeight: 76,
    borderRadius: 13,
    marginBottom: 9,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAD9C9',
    elevation: 2,
  },

  iconoProducto: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#F7E9DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoProducto: {
    flex: 1,
  },

  nombreProducto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F3424',
  },

  precioProducto: {
    fontSize: 13,
    color: '#6F5A4A',
    marginTop: 3,
  },

  stockProducto: {
    fontSize: 12,
    color: '#27834A',
    marginTop: 3,
  },

  stockAgotado: {
    color: '#B42318',
  },

  botonAgregar: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#8B4A2B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  botonDeshabilitado: {
    opacity: 0.45,
  },

  panelCarrito: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EAD9C9',
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 14,
    maxHeight: '55%',
  },

  encabezadoCarrito: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  filaTituloCarrito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  tituloCarrito: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#4F3424',
  },

  contadorCarrito: {
    fontSize: 11,
    color: '#8A7768',
  },

  limpiarTexto: {
    color: '#A33B2B',
    fontSize: 12,
    fontWeight: '600',
  },

  carritoVacio: {
    color: '#8A7768',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },

  listaCarrito: {
    maxHeight: 145,
  },

  itemCarrito: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1E9E2',
  },

  infoCarrito: {
    flex: 1,
  },

  nombreCarrito: {
    fontSize: 13,
    color: '#4F3424',
    fontWeight: '600',
  },

  precioCarrito: {
    fontSize: 12,
    color: '#8B4A2B',
    fontWeight: 'bold',
    marginTop: 3,
  },

  precioUnitario: {
    fontSize: 10,
    color: '#8A7768',
    marginTop: 2,
  },

  controlesCantidad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  botonCantidad: {
    width: 27,
    height: 27,
    borderRadius: 8,
    backgroundColor: '#F7E9DE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cantidad: {
    color: '#4F3424',
    fontSize: 13,
    fontWeight: 'bold',
    minWidth: 15,
    textAlign: 'center',
  },

  botonEliminar: {
    marginLeft: 3,
    padding: 3,
  },

  separador: {
    height: 1,
    backgroundColor: '#EADDD2',
    marginVertical: 9,
  },

  totalFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  textoTotal: {
    color: '#4F3424',
    fontSize: 14,
    fontWeight: '600',
  },

  total: {
    color: '#8B4A2B',
    fontSize: 22,
    fontWeight: 'bold',
  },

  botonConfirmar: {
    backgroundColor: '#8B4A2B',
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },

  textoBotonPrincipal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  cargando: {
    marginTop: 30,
  },

  estado: {
    alignItems: 'center',
    padding: 20,
  },

  mensajeError: {
    color: '#B42318',
    textAlign: 'center',
  },

  botonReintentar: {
    backgroundColor: '#8B4A2B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },

  vacio: {
    color: '#8A7768',
    textAlign: 'center',
    marginTop: 25,
  },

  espacioFinal: {
    height: 10,
  },
});
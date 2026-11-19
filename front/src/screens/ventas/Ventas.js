
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { obtenerProductos } from '../../services/productoService';
import { registrarVenta } from '../../services/ventaService';

import ImagenProducto from '../../components/ImagenProducto';

import { evaluarStockBajo } from '../../services/notificacionesService';

const COLOR = '#8B4A2B';
const FONDO = '#FDF6F0';
const FORMATO_MONEDA = (valor) =>
  `S/ ${Number(valor || 0).toFixed(2)}`;

function iconoProducto(producto) {
  const texto =
    `${producto?.nombre || ''} ${producto?.categoria || ''}`.toLowerCase();

  if (texto.includes('galleta') || texto.includes('chispas')) {
    return 'cookie';
  }
  if (texto.includes('cheesecake') || texto.includes('queso')) {
    return 'cake-variant';
  }
  if (texto.includes('torta') || texto.includes('pastel')) {
    return 'cake';
  }
  if (texto.includes('pan')) {
    return 'bread-slice';
  }
  if (texto.includes('cupcake') || texto.includes('muffin')) {
    return 'cupcake';
  }

  return 'food';
}

export default function Ventas({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  const cargarProductos = useCallback(async (refresco = false) => {
    try {
      if (refresco) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError('');

      const datos = await obtenerProductos();
      const lista = Array.isArray(datos) ? datos : [];

      setProductos(lista);
      return lista;

      // Actualizar los productos del carrito con el stock más reciente.
      setCarrito((actual) =>
        actual
          .map((linea) => {
            const actualizado = lista.find(
              (p) => p.id === linea.producto.id
            );

            if (!actualizado) return null;

            return {
              ...linea,
              producto: actualizado,
              cantidad: Math.min(
                linea.cantidad,
                Number(actualizado.stock || 0)
              ),
            };
          })
          .filter(
            (linea) => linea && linea.cantidad > 0
          )
      );
    } catch (e) {
      setError(
        'No se pudieron cargar los productos. Verifica la conexión con el backend.'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarProductos();
    }, [cargarProductos])
  );

  const productosFiltrados = useMemo(
    () =>
      productos.filter((producto) =>
        `${producto.nombre || ''} ${producto.categoria || ''}`
          .toLowerCase()
          .includes(buscar.toLowerCase().trim())
      ),
    [productos, buscar]
  );

  const totalUnidades = carrito.reduce(
    (suma, linea) => suma + linea.cantidad,
    0
  );

  const totalVenta = carrito.reduce(
    (suma, linea) =>
      suma +
      Number(linea.producto.precio || 0) * linea.cantidad,
    0
  );

  function agregarProducto(producto) {
    const stock = Number(producto.stock || 0);

    if (stock <= 0) {
      Alert.alert(
        'Sin stock',
        'Este producto no tiene unidades disponibles.'
      );
      return;
    }

    setCarrito((actual) => {
      const existente = actual.find(
        (linea) => linea.producto.id === producto.id
      );

      if (existente) {
        if (existente.cantidad >= stock) {
          Alert.alert(
            'Stock insuficiente',
            `Solo hay ${stock} unidades disponibles.`
          );
          return actual;
        }

        return actual.map((linea) =>
          linea.producto.id === producto.id
            ? {
                ...linea,
                cantidad: linea.cantidad + 1,
              }
            : linea
        );
      }

      return [...actual, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(productoId, cambio) {
    setCarrito((actual) =>
      actual
        .map((linea) => {
          if (linea.producto.id !== productoId) {
            return linea;
          }

          const nuevaCantidad = linea.cantidad + cambio;

          if (
            nuevaCantidad >
            Number(linea.producto.stock || 0)
          ) {
            Alert.alert(
              'Stock insuficiente',
              `Solo hay ${linea.producto.stock} unidades disponibles.`
            );
            return linea;
          }

          return {
            ...linea,
            cantidad: nuevaCantidad,
          };
        })
        .filter((linea) => linea.cantidad > 0)
    );
  }

  function quitarProducto(productoId) {
    setCarrito((actual) =>
      actual.filter(
        (linea) => linea.producto.id !== productoId
      )
    );
  }

  function confirmarVenta() {
    if (carrito.length === 0) {
      Alert.alert(
        'Carrito vacío',
        'Agrega al menos un producto antes de registrar la venta.'
      );
      return;
    }

    Alert.alert(
      'Confirmar venta',
      `¿Registrar ${totalUnidades} ${
        totalUnidades === 1 ? 'unidad' : 'unidades'
      } por ${FORMATO_MONEDA(totalVenta)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Registrar venta',
          onPress: guardarVenta,
        },
      ]
    );
  }

  
async function guardarVenta() {
  try {
    setProcesando(true);

    // Guardar los IDs de los productos vendidos.
    const idsAfectados = carrito.map(
      (linea) => linea.producto.id
    );

    const resultado = await registrarVenta(
      carrito.map((linea) => ({
        productoId: linea.producto.id,
        cantidad: linea.cantidad,
      }))
    );

    setCarrito([]);

    // Obtener el inventario actualizado.
    const productosActualizados = await cargarProductos(true);

    // Evaluar solamente los productos de esta venta.
    if (Array.isArray(productosActualizados)) {
      const productosAfectados = productosActualizados.filter(
        (producto) =>
          idsAfectados.includes(producto.id)
      );

      await evaluarStockBajo(productosAfectados);
    }

    Alert.alert(
      'Venta registrada',
      `La venta${
        resultado?.id ? ` #${resultado.id}` : ''
      } se registró correctamente. El inventario fue actualizado por el backend.`,
      [{ text: 'Aceptar' }]
    );

  } catch (e) {
    Alert.alert(
      'No se pudo registrar',
      e.message || 'Ocurrió un error al registrar la venta.'
    );

    await cargarProductos(true);

  } finally {
    setProcesando(false);
  }
}


  const renderProducto = ({ item }) => {
    const stock = Number(item.stock || 0);

    const enCarrito =
      carrito.find(
        (linea) => linea.producto.id === item.id
      )?.cantidad || 0;

    return (
      <View style={styles.productoCard}>
       <ImagenProducto style={styles.imagenProducto}
          imagenUrl={item.imagenUrl}
          ancho={54}
          alto={54}
          icono={iconoProducto(item)}
        />

        <View style={styles.productoInfo}>
          <Text
            style={styles.productoNombre}
            numberOfLines={2}
          >
            {item.nombre}
          </Text>

          <Text style={styles.productoPrecio}>
            {FORMATO_MONEDA(item.precio)}
          </Text>

          <Text
            style={[
              styles.productoStock,
              stock <= 5 && styles.stockBajo,
            ]}
          >
            {stock > 0
              ? `Disponible: ${stock}`
              : 'Agotado'}

            {enCarrito > 0
              ? ` · En carrito: ${enCarrito}`
              : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.botonAgregar,
            stock <= enCarrito &&
              styles.botonDeshabilitado,
          ]}
          onPress={() => agregarProducto(item)}
          disabled={stock <= enCarrito}
          accessibilityLabel={`Agregar ${item.nombre} a la venta`}
        >
          <Ionicons
            name="add"
            size={25}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderLineaCarrito = ({ item }) => (
    <View style={styles.lineaCarrito}>
      <View style={styles.lineaInfo}>
        <Text
          style={styles.lineaNombre}
          numberOfLines={1}
        >
          {item.producto.nombre}
        </Text>

        <Text style={styles.lineaPrecio}>
          {FORMATO_MONEDA(
            Number(item.producto.precio) * item.cantidad
          )}
        </Text>

        <Text style={styles.lineaUnitario}>
          {FORMATO_MONEDA(item.producto.precio)} por unidad
        </Text>
      </View>

      <View style={styles.controlesCantidad}>
        <TouchableOpacity
          style={styles.botonCantidad}
          onPress={() =>
            cambiarCantidad(item.producto.id, -1)
          }
        >
          <Ionicons
            name="remove"
            size={18}
            color={COLOR}
          />
        </TouchableOpacity>

        <Text style={styles.cantidad}>
          {item.cantidad}
        </Text>

        <TouchableOpacity
          style={styles.botonCantidad}
          onPress={() =>
            cambiarCantidad(item.producto.id, 1)
          }
        >
          <Ionicons
            name="add"
            size={18}
            color={COLOR}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonQuitar}
          onPress={() =>
            quitarProducto(item.producto.id)
          }
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color="#B54736"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.titulo}>Ventas</Text>
          <Text style={styles.subtitulo}>
            Registrar una nueva venta
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonHistorial}
          onPress={() =>
            navigation.navigate('HistorialVentas')
          }
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={COLOR}
          />
          <Text style={styles.textoHistorial}>
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buscarContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#A8886D"
        />

        <TextInput
          style={styles.buscarInput}
          placeholder="Buscar producto para vender..."
          placeholderTextColor="#A8886D"
          value={buscar}
          onChangeText={setBuscar}
        />

        {!!buscar && (
          <TouchableOpacity
            onPress={() => setBuscar('')}
          >
            <Ionicons
              name="close-circle"
              size={19}
              color="#A8886D"
            />
          </TouchableOpacity>
        )}
      </View>

      {cargando ? (
        <View style={styles.estado}>
          <ActivityIndicator
            size="large"
            color={COLOR}
          />
          <Text style={styles.estadoTexto}>
            Cargando productos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderProducto}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listaProductos}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => cargarProductos(true)}
              colors={[COLOR]}
            />
          }
          ListHeaderComponent={
            <Text style={styles.seccionTitulo}>
              Productos disponibles
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <MaterialCommunityIcons
                name="food-off-outline"
                size={40}
                color="#C9B8AA"
              />

              <Text style={styles.vacioTitulo}>
                {error
                  ? 'No se pudo cargar el catálogo'
                  : 'No hay productos disponibles'}
              </Text>

              <Text style={styles.vacioTexto}>
                {error ||
                  'Registra productos o cambia tu búsqueda.'}
              </Text>

              {!!error && (
                <TouchableOpacity
                  style={styles.reintentar}
                  onPress={() => cargarProductos()}
                >
                  <Text style={styles.reintentarTexto}>
                    Reintentar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            <View
              style={{
                height: carrito.length ? 12 : 24,
              }}
            />
          }
        />
      )}

      {carrito.length > 0 && (
        <View style={styles.carritoPanel}>
          <View style={styles.carritoEncabezado}>
            <View style={styles.carritoTituloFila}>
              <MaterialCommunityIcons
                name="cart-check"
                size={22}
                color={COLOR}
              />

              <Text style={styles.carritoTitulo}>
                Detalle de venta
              </Text>

              <View style={styles.contador}>
                <Text style={styles.contadorTexto}>
                  {totalUnidades}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setCarrito([])}
            >
              <Text style={styles.limpiar}>Vaciar</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={carrito}
            keyExtractor={(item) =>
              String(item.producto.id)
            }
            renderItem={renderLineaCarrito}
            style={styles.listaCarrito}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.totalFila}>
            <Text style={styles.totalEtiqueta}>
              Total de la venta
            </Text>

            <Text style={styles.totalValor}>
              {FORMATO_MONEDA(totalVenta)}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.botonRegistrar,
              procesando && styles.botonDeshabilitado,
            ]}
            onPress={confirmarVenta}
            disabled={procesando}
          >
            {procesando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={21}
                  color="#FFFFFF"
                />
                <Text style={styles.botonRegistrarTexto}>
                  Registrar venta
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FONDO,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  subtitulo: {
    marginTop: 3,
    fontSize: 13,
    color: '#96765F',
  },
  botonHistorial: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E6D3C3',
    backgroundColor: '#FFFFFF',
    borderRadius: 11,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  textoHistorial: {
    color: COLOR,
    fontWeight: '600',
    fontSize: 13,
  },
  buscarContainer: {
    marginHorizontal: 18,
    marginBottom: 12,
    paddingHorizontal: 13,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADDD2',
    borderRadius: 12,
  },
  buscarInput: {
    flex: 1,
    color: '#5C3A21',
    fontSize: 14,
    paddingVertical: 10,
  },
  listaProductos: {
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  seccionTitulo: {
    color: '#6D4A34',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 9,
    marginTop: 2,
  },
  productoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0E3D8',
    elevation: 1,
  },
  productoIcono: {
    width: 54,
    height: 54,
    borderRadius: 13,
    backgroundColor: '#F8EDE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  imagenProducto:{
    marginRight: 12,
  },
  productoInfo: {
    marginLeft: 20,
    flex: 1,
    paddingRight: 8,
  },
  productoNombre: {
    color: '#4F3425',
    fontWeight: '700',
    fontSize: 14,
  },
  productoPrecio: {
    color: COLOR,
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 4,
  },
  productoStock: {
    color: '#887464',
    fontSize: 11,
    marginTop: 3,
  },
  stockBajo: {
    color: '#B54736',
  },
  botonAgregar: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonDeshabilitado: {
    opacity: 0.45,
  },
  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    gap: 10,
  },
  estadoTexto: {
    color: '#8B7564',
    fontSize: 14,
  },
  vacio: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 30,
    gap: 8,
  },
  vacioTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6D4A34',
    textAlign: 'center',
  },
  vacioTexto: {
    fontSize: 13,
    color: '#967F6E',
    textAlign: 'center',
    lineHeight: 19,
  },
  reintentar: {
    backgroundColor: '#F1E1D4',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginTop: 5,
  },
  reintentarTexto: {
    color: COLOR,
    fontWeight: '700',
  },
  carritoPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderColor: '#EADDD2',
    maxHeight: '53%',
    elevation: 12,
  },
  carritoEncabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  carritoTituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  carritoTitulo: {
    color: '#5C3A21',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contador: {
    backgroundColor: '#F4E4D7',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  contadorTexto: {
    color: COLOR,
    fontSize: 12,
    fontWeight: 'bold',
  },
  limpiar: {
    color: '#B54736',
    fontWeight: '600',
    fontSize: 12,
  },
  listaCarrito: {
    flexGrow: 0,
    maxHeight: 155,
  },
  lineaCarrito: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3EAE3',
  },
  lineaInfo: {
    flex: 1,
    paddingRight: 8,
  },
  lineaNombre: {
    color: '#5C3A21',
    fontSize: 13,
    fontWeight: '600',
  },
  lineaPrecio: {
    color: COLOR,
    fontWeight: 'bold',
    marginTop: 2,
    fontSize: 13,
  },
  lineaUnitario: {
    color: '#A18A78',
    fontSize: 10,
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
    backgroundColor: '#F8EDE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cantidad: {
    color: '#5C3A21',
    fontWeight: 'bold',
    minWidth: 15,
    textAlign: 'center',
  },
  botonQuitar: {
    padding: 4,
    marginLeft: 2,
  },
  totalFila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginTop: 2,
  },
  totalEtiqueta: {
    color: '#6D4A34',
    fontSize: 14,
    fontWeight: '600',
  },
  totalValor: {
    color: COLOR,
    fontSize: 22,
    fontWeight: 'bold',
  },
  botonRegistrar: {
    backgroundColor: COLOR,
    borderRadius: 13,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botonRegistrarTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

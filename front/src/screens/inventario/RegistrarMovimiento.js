import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { obtenerProductos } from '../../services/productoService';
import { registrarMovimiento } from '../../services/inventarioService';

export default function RegistrarMovimiento({ route, navigation }) {
  const productoInicial = route.params?.producto;

  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState(
    productoInicial ? String(productoInicial.id) : ''
  );
  const [tipo, setTipo] = useState('ENTRADA');
  const [cantidad, setCantidad] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarProductos() {
      try {
        const datos = await obtenerProductos();
        setProductos(datos);
      } catch (error) {
        Alert.alert(
          'Error',
          'No se pudieron cargar los productos. Verifica el servidor.'
        );
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  const productoSeleccionado = productos.find(
    (producto) => String(producto.id) === productoId
  );

  async function guardarMovimiento() {
    const cantidadNumero = Number(cantidad);

    if (!productoId) {
      Alert.alert('Validación', 'Selecciona un producto.');
      return;
    }

    if (
      !cantidad.trim() ||
      !Number.isInteger(cantidadNumero) ||
      cantidadNumero <= 0
    ) {
      Alert.alert(
        'Validación',
        'La cantidad debe ser un número entero mayor que cero.'
      );
      return;
    }

    if (!motivo.trim()) {
      Alert.alert('Validación', 'Escribe el motivo del movimiento.');
      return;
    }

    if (
      tipo === 'SALIDA' &&
      productoSeleccionado &&
      cantidadNumero > productoSeleccionado.stock
    ) {
      Alert.alert(
        'Stock insuficiente',
        `Solo hay ${productoSeleccionado.stock} unidades disponibles.`
      );
      return;
    }

    setGuardando(true);

    try {
      await registrarMovimiento({
        productoId: Number(productoId),
        tipo,
        cantidad: cantidadNumero,
        motivo: motivo.trim(),
      });

      Alert.alert(
        'Movimiento registrado',
        `${tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada correctamente.`,
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#8B4A2B" />
        <Text style={styles.textoCargando}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={23}
          color="#8B4A2B"
        />
        <Text style={styles.textoVolver}>Volver al inventario</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Registrar movimiento</Text>
      <Text style={styles.subtitulo}>
        Registra entradas y salidas de existencias.
      </Text>

      <Text style={styles.etiqueta}>Producto</Text>

      {productos.length === 0 ? (
        <Text style={styles.aviso}>
          No hay productos registrados. Primero registra un producto.
        </Text>
      ) : (
        <View style={styles.listaProductos}>
          {productos.map((producto) => {
            const seleccionado = String(producto.id) === productoId;

            return (
              <TouchableOpacity
                key={producto.id}
                style={[
                  styles.opcionProducto,
                  seleccionado && styles.opcionSeleccionada,
                ]}
                onPress={() => setProductoId(String(producto.id))}
              >
                <View style={styles.infoProducto}>
                  <Text style={styles.nombreProducto}>
                    {producto.nombre}
                  </Text>
                  <Text style={styles.stockProducto}>
                    Stock actual: {producto.stock}
                  </Text>
                </View>

                {seleccionado && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={22}
                    color="#8B4A2B"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Text style={styles.etiqueta}>Tipo de movimiento</Text>

      <View style={styles.tipos}>
        <TouchableOpacity
          style={[
            styles.botonTipo,
            tipo === 'ENTRADA' && styles.tipoEntradaActivo,
          ]}
          onPress={() => setTipo('ENTRADA')}
        >
          <MaterialCommunityIcons
            name="package-down"
            size={22}
            color={tipo === 'ENTRADA' ? '#FFFFFF' : '#32845C'}
          />
          <Text
            style={[
              styles.textoTipo,
              tipo === 'ENTRADA' && styles.textoTipoActivo,
            ]}
          >
            Entrada
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botonTipo,
            tipo === 'SALIDA' && styles.tipoSalidaActivo,
          ]}
          onPress={() => setTipo('SALIDA')}
        >
          <MaterialCommunityIcons
            name="package-up"
            size={22}
            color={tipo === 'SALIDA' ? '#FFFFFF' : '#B54736'}
          />
          <Text
            style={[
              styles.textoTipo,
              tipo === 'SALIDA' && styles.textoTipoActivo,
            ]}
          >
            Salida
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.etiqueta}>Cantidad de unidades</Text>

      <TextInput
        style={styles.input}
        value={cantidad}
        onChangeText={setCantidad}
        placeholder="Ej. 5"
        placeholderTextColor="#B6A69A"
        keyboardType="number-pad"
      />

      <Text style={styles.etiqueta}>Motivo</Text>

      <TextInput
        style={[styles.input, styles.inputMotivo]}
        value={motivo}
        onChangeText={setMotivo}
        placeholder="Ej. Producción de tortas"
        placeholderTextColor="#B6A69A"
        multiline
        maxLength={200}
      />

      <TouchableOpacity
        style={[
          styles.botonGuardar,
          (guardando || productos.length === 0) && styles.botonDeshabilitado,
        ]}
        onPress={guardarMovimiento}
        disabled={guardando || productos.length === 0}
      >
        {guardando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <MaterialCommunityIcons
              name="content-save-outline"
              size={21}
              color="#FFFFFF"
            />
            <Text style={styles.textoGuardar}>Guardar movimiento</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FDF6F0',
  },
  contenido: {
    padding: 20,
    paddingBottom: 35,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF6F0',
  },
  textoCargando: {
    color: '#8B4A2B',
    marginTop: 10,
  },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
    gap: 7,
  },
  textoVolver: {
    color: '#8B4A2B',
    fontWeight: '600',
  },
  titulo: {
    color: '#8B4A2B',
    fontSize: 25,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#8B786A',
    fontSize: 13,
    marginTop: 5,
    marginBottom: 23,
  },
  etiqueta: {
    color: '#4D382D',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 9,
    marginTop: 12,
  },
  listaProductos: {
    gap: 8,
  },
  opcionProducto: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADDD2',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  opcionSeleccionada: {
    borderColor: '#8B4A2B',
    backgroundColor: '#F9EDE3',
  },
  infoProducto: {
    flex: 1,
  },
  nombreProducto: {
    color: '#4D382D',
    fontWeight: '600',
    fontSize: 14,
  },
  stockProducto: {
    color: '#8B786A',
    fontSize: 12,
    marginTop: 4,
  },
  tipos: {
    flexDirection: 'row',
    gap: 10,
  },
  botonTipo: {
    flex: 1,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#EADDD2',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tipoEntradaActivo: {
    backgroundColor: '#32845C',
    borderColor: '#32845C',
  },
  tipoSalidaActivo: {
    backgroundColor: '#B54736',
    borderColor: '#B54736',
  },
  textoTipo: {
    fontWeight: '600',
    color: '#4D382D',
  },
  textoTipoActivo: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADDD2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#4D382D',
  },
  inputMotivo: {
    minHeight: 85,
    textAlignVertical: 'top',
  },
  botonGuardar: {
    backgroundColor: '#8B4A2B',
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    gap: 9,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  textoGuardar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  aviso: {
    color: '#8B786A',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
  },
});
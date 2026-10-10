import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const API_URL = 'http://10.0.2.2:8080/api';

export default function Inventario({ navigation }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const cargarInventario = useCallback(async () => {
    try {
      setError('');

      const respuesta = await fetch(`${API_URL}/productos`);

      if (!respuesta.ok) {
        throw new Error('No se pudo consultar el inventario');
      }

      const datos = await respuesta.json();
      setProductos(datos);
    } catch (e) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarInventario();
    }, [cargarInventario])
  );

  const actualizar = () => {
    setActualizando(true);
    cargarInventario();
  };

  const renderProducto = ({ item }) => {
    const stock = Number(item.stock ?? 0);
    const stockBajo = stock <= 5;

    return (
      <View style={styles.tarjeta}>
        <View style={styles.iconoProducto}>
          <MaterialCommunityIcons
            name="package-variant-closed"
            size={29}
            color="#8B4A2B"
          />
        </View>

        <View style={styles.datosProducto}>
          <Text style={styles.nombre} numberOfLines={2}>
            {item.nombre}
          </Text>

          <Text style={styles.categoria}>
            {item.categoria}
          </Text>

          <View style={styles.stockFila}>
            <Text style={styles.stockEtiqueta}>
              Stock disponible:
            </Text>

            <Text
              style={[
                styles.stockValor,
                stockBajo && styles.stockBajo,
              ]}
            >
              {stock} unidades
            </Text>
          </View>

          {stockBajo && (
            <View style={styles.alertaStock}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={15}
                color="#B54736"
              />
              <Text style={styles.textoAlerta}>
                Stock bajo
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.botonMovimiento}
          onPress={() =>
            navigation.navigate('RegistrarMovimiento', {
              producto: item,
            })
          }
          accessibilityLabel={`Registrar movimiento de ${item.nombre}`}
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color="#8B4A2B" />
        <Text style={styles.textoCargando}>
          Cargando inventario...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <View>
          <Text style={styles.titulo}>Inventario</Text>
          <Text style={styles.subtitulo}>
            Control de existencias
          </Text>
        </View>

        

        <TouchableOpacity
          style={styles.botonActualizar}
          onPress={actualizar}
          accessibilityLabel="Actualizar inventario"
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color="#8B4A2B"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.resumen}>
        <View style={styles.resumenIcono}>
          <MaterialCommunityIcons
            name="package-variant"
            size={28}
            color="#8B4A2B"
          />
        </View>

        <View>
          <Text style={styles.resumenEtiqueta}>
            Productos registrados
          </Text>
          <Text style={styles.resumenNumero}>
            {productos.length}
          </Text>
        </View>
      </View>

      {error !== '' && (
        <TouchableOpacity
          style={styles.errorCaja}
          onPress={actualizar}
        >
          <Text style={styles.errorTexto}>{error}</Text>
          <Text style={styles.reintentar}>
            Toca aquí para reintentar
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={productos}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderProducto}
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={actualizar}
            colors={['#8B4A2B']}
          />
        }
        ListEmptyComponent={
          error === '' ? (
            <View style={styles.vacio}>
              <MaterialCommunityIcons
                name="package-variant"
                size={48}
                color="#C9B8AA"
              />
              <Text style={styles.vacioTitulo}>
                No hay productos
              </Text>
              <Text style={styles.vacioTexto}>
                Registra productos para consultar sus existencias.
              </Text>
            </View>
          ) : null
        }

        
      />

                <TouchableOpacity style={styles.botonInventario}
            onPress={() => navigation.navigate('HistorialInventario')}
            >
            <MaterialCommunityIcons
                name="history"
                size={22}
                color="#FFFFFF"
            />

            <Text
                style={styles.botonInventarioTexto}
            >
                Ver historial de movimientos
            </Text>
            </TouchableOpacity>
                </View>
            );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#FDF6F0',
    paddingHorizontal: 15,
    paddingTop: 18,
  },
  encabezado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  titulo: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#8B4A2B',
  },
  subtitulo: {
    fontSize: 13,
    color: '#8B786A',
    marginTop: 3,
  },
  botonActualizar: {
    backgroundColor: '#FFFFFF',
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EADDD2',
  },
  resumen: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EADDD2',
  },
  resumenIcono: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F7E9DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  resumenEtiqueta: {
    color: '#8B786A',
    fontSize: 13,
  },
  resumenNumero: {
    color: '#8B4A2B',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 3,
  },
  lista: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EADDD2',
    elevation: 2,
  },
  iconoProducto: {
    width: 54,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#F7E9DD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  datosProducto: {
    flex: 1,
  },
  nombre: {
    color: '#4D382D',
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoria: {
    color: '#958276',
    fontSize: 12,
    marginTop: 3,
  },
  stockFila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 7,
    gap: 4,
  },
  stockEtiqueta: {
    fontSize: 12,
    color: '#8B786A',
  },
  stockValor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#32845C',
  },
  stockBajo: {
    color: '#B54736',
  },
  alertaStock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 4,
  },
  textoAlerta: {
    fontSize: 11,
    color: '#B54736',
  },
  botonMovimiento: {
    backgroundColor: '#8B4A2B',
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  centro: {
    flex: 1,
    backgroundColor: '#FDF6F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCargando: {
    color: '#8B4A2B',
    marginTop: 12,
  },
  errorCaja: {
    backgroundColor: '#FBE8E5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorTexto: {
    color: '#B54736',
    fontWeight: 'bold',
  },
  reintentar: {
    color: '#8B4A2B',
    fontSize: 12,
    marginTop: 4,
  },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 35,
  },
  vacioTitulo: {
    color: '#8B4A2B',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
  },
  vacioTexto: {
    color: '#8B786A',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },

    botonInventario: {
    backgroundColor: '#805438',
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
    botonInventarioTexto: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 15,
    }
});
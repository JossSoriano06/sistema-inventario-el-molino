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

export default function HistorialInventario({ navigation }) {
  const [movimientos, setMovimientos] = useState([]);
  const [filtro, setFiltro] = useState('TODOS');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  const cargarMovimientos = async () => {
    try {
      const respuesta = await fetch(`${API_URL}/inventario`);

      if (!respuesta.ok) {
        throw new Error('No se pudo obtener el historial.');
      }

      const datos = await respuesta.json();
      setMovimientos(datos);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo cargar el historial. Verifica que el backend esté ejecutándose.'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarMovimientos();
    }, [])
  );

  const movimientosFiltrados = movimientos.filter((movimiento) => {
    if (filtro === 'TODOS') return true;

    return movimiento.tipo?.toUpperCase() === filtro;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return fecha.replace('T', ' ');
    }

    return fechaObjeto.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMovimiento = ({ item }) => {
    const esEntrada = item.tipo?.toUpperCase() === 'ENTRADA';

    return (
      <View style={styles.tarjeta}>
        <View style={styles.filaSuperior}>
          <View style={styles.iconoContenedor}>
            <MaterialCommunityIcons
              name={esEntrada ? 'arrow-down-circle' : 'arrow-up-circle'}
              size={32}
              color={esEntrada ? '#27834A' : '#D64545'}
            />
          </View>

          <View style={styles.informacion}>
            <Text style={styles.nombreProducto}>
              {item.producto?.nombre || `Producto #${item.producto?.id ?? '?'}`}
            </Text>

            <Text
              style={[
                styles.tipo,
                { color: esEntrada ? '#27834A' : '#D64545' },
              ]}
            >
              {esEntrada ? 'ENTRADA' : 'SALIDA'}
            </Text>
          </View>

          <Text
            style={[
              styles.cantidad,
              { color: esEntrada ? '#27834A' : '#D64545' },
            ]}
          >
            {esEntrada ? '+' : '-'}{item.cantidad ?? 0}
          </Text>
        </View>

        <View style={styles.separador} />

        <View style={styles.detalle}>
          <MaterialCommunityIcons
            name="swap-horizontal"
            size={18}
            color="#8A7768"
          />
          <Text style={styles.textoDetalle}>
            Stock: {item.stockAnterior ?? '-'} → {item.stockNuevo ?? '-'}
          </Text>
        </View>

        <View style={styles.detalle}>
          <MaterialCommunityIcons
            name="text-box-outline"
            size={18}
            color="#8A7768"
          />
          <Text style={styles.textoDetalle}>
            {item.motivo || 'Sin motivo registrado'}
          </Text>
        </View>

        <View style={styles.detalle}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={18}
            color="#8A7768"
          />
          <Text style={styles.textoDetalle}>
            {formatearFecha(item.fecha)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.encabezado}>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={26}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.encabezadoTexto}>
          <Text style={styles.titulo}>Historial</Text>
          <Text style={styles.subtitulo}>
            Registro de movimientos del inventario
          </Text>
        </View>
      </View>

      <View style={styles.resumen}>
        <Text style={styles.total}>
          {movimientos.length}
        </Text>
        <Text style={styles.totalTexto}>
          movimientos registrados
        </Text>
      </View>

      <View style={styles.filtros}>
        {[
          { valor: 'TODOS', texto: 'Todos' },
          { valor: 'ENTRADA', texto: 'Entradas' },
          { valor: 'SALIDA', texto: 'Salidas' },
        ].map((opcion) => (
          <TouchableOpacity
            key={opcion.valor}
            style={[
              styles.botonFiltro,
              filtro === opcion.valor && styles.botonFiltroActivo,
            ]}
            onPress={() => setFiltro(opcion.valor)}
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === opcion.valor && styles.textoFiltroActivo,
              ]}
            >
              {opcion.texto}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {cargando ? (
        <ActivityIndicator
          size="large"
          color="#A66A3F"
          style={styles.cargando}
        />
      ) : (
        <FlatList
          data={movimientosFiltrados}
          keyExtractor={(item, index) =>
            String(item.id ?? index)
          }
          renderItem={renderMovimiento}
          contentContainerStyle={styles.lista}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => {
                setActualizando(true);
                cargarMovimientos();
              }}
              colors={['#A66A3F']}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <MaterialCommunityIcons
                name="clipboard-text-clock-outline"
                size={58}
                color="#C8B7A8"
              />
              <Text style={styles.vacioTitulo}>
                No hay movimientos
              </Text>
              <Text style={styles.vacioTexto}>
                Los movimientos registrados aparecerán aquí.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8F5F1',
  },
  encabezado: {
    backgroundColor: '#805438',
    paddingTop: 45,
    paddingBottom: 22,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botonVolver: {
    marginRight: 14,
    padding: 4,
  },
  encabezadoTexto: {
    flex: 1,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#F0E2D6',
    fontSize: 13,
    marginTop: 4,
  },
  resumen: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 10,
    padding: 17,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
  },
  total: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#805438',
  },
  totalTexto: {
    fontSize: 14,
    color: '#76675D',
  },
  filtros: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  botonFiltro: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#EDE5DC',
    alignItems: 'center',
  },
  botonFiltroActivo: {
    backgroundColor: '#805438',
  },
  textoFiltro: {
    color: '#604B3C',
    fontWeight: '600',
    fontSize: 12,
  },
  textoFiltroActivo: {
    color: '#FFFFFF',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 25,
    flexGrow: 1,
  },
  tarjeta: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconoContenedor: {
    marginRight: 10,
  },
  informacion: {
    flex: 1,
  },
  nombreProducto: {
    color: '#382D26',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipo: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cantidad: {
    fontSize: 21,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  separador: {
    height: 1,
    backgroundColor: '#EEE7E0',
    marginVertical: 12,
  },
  detalle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  textoDetalle: {
    color: '#6D6057',
    fontSize: 13,
    flex: 1,
  },
  cargando: {
    marginTop: 50,
  },
  vacio: {
    alignItems: 'center',
    marginTop: 55,
    paddingHorizontal: 20,
  },
  vacioTitulo: {
    color: '#5B4536',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  vacioTexto: {
    color: '#8A7B70',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 20,
  },
});
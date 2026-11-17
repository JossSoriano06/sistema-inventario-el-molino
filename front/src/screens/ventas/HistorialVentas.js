
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

import {
  obtenerVentas,
  obtenerVentaPorId,
} from '../../services/ventaService';

const COLOR = '#8B4A2B';
const FONDO = '#FDF6F0';

const moneda = (valor) =>
  `S/ ${Number(valor || 0).toFixed(2)}`;

function fechaLegible(valor) {
  if (!valor) return 'Fecha no disponible';

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return String(valor);
  }

  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function detallesDe(venta) {
  return (
    venta?.detalles ||
    venta?.detalleVentas ||
    venta?.items ||
    []
  );
}

export default function HistorialVentas() {
  const [ventas, setVentas] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [filtro, setFiltro] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const cargarVentas = useCallback(async (refresco = false) => {
    try {
      if (refresco) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      setError('');

      const datos = await obtenerVentas();

      setVentas(Array.isArray(datos) ? datos : []);
    } catch (e) {
      setError(
        e.message || 'No se pudo cargar el historial de ventas.'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarVentas();
    }, [cargarVentas])
  );

  const ventasFiltradas = useMemo(() => {
    const hoy = new Date();

    return ventas.filter((venta) => {
      const fecha = new Date(
        venta.fecha ||
        venta.createdAt ||
        venta.fechaVenta ||
        ''
      );

      const coincideFiltro =
        filtro === 'todas' ||
        (
          !Number.isNaN(fecha.getTime()) &&
          (
            filtro === 'hoy'
              ? fecha.toDateString() === hoy.toDateString()
              : fecha.getMonth() === hoy.getMonth() &&
                fecha.getFullYear() === hoy.getFullYear()
          )
        );

      const texto = `
        ${venta.id ?? ''}
        ${detallesDe(venta)
          .map(
            (detalle) =>
              detalle.producto?.nombre ||
              detalle.nombreProducto ||
              ''
          )
          .join(' ')}
      `.toLowerCase();

      return (
        coincideFiltro &&
        texto.includes(buscar.toLowerCase().trim())
      );
    });
  }, [ventas, filtro, buscar]);

  const totalHistorico = ventas.reduce(
    (suma, venta) =>
      suma + Number(venta.total || 0),
    0
  );

  const totalFiltrado = ventasFiltradas.reduce(
    (suma, venta) =>
      suma + Number(venta.total || 0),
    0
  );

  async function mostrarDetalle(venta) {
    try {
      const detalle =
        venta.id != null
          ? await obtenerVentaPorId(venta.id)
          : venta;

      const lineas = detallesDe(detalle);

      const textoProductos = lineas.length
        ? lineas
            .map((linea) => {
              const nombre =
                linea.producto?.nombre ||
                linea.nombreProducto ||
                `Producto ${linea.productoId || ''}`;

              const cantidad = Number(
                linea.cantidad || 0
              );

              const precio = Number(
                linea.subtotal ??
                (
                  Number(
                    linea.precioUnitario ||
                    linea.producto?.precio ||
                    0
                  ) * cantidad
                )
              );

              return `• ${nombre} x${cantidad}: ${moneda(precio)}`;
            })
            .join('\n')
        : 'No hay detalle de productos disponible.';

      Alert.alert(
        `Detalle de venta #${detalle.id ?? venta.id ?? '-'}`,
        `${fechaLegible(
          detalle.fecha ||
          detalle.createdAt ||
          venta.fecha
        )}\n\n${textoProductos}\n\nTOTAL: ${moneda(
          detalle.total ?? venta.total
        )}`,
        [{ text: 'Cerrar' }]
      );
    } catch (e) {
      Alert.alert(
        'No se pudo abrir el detalle',
        e.message || 'Intenta nuevamente.'
      );
    }
  }

  const renderVenta = ({ item }) => {
    const detalles = detallesDe(item);

    const unidades = detalles.reduce(
      (suma, linea) =>
        suma + Number(linea.cantidad || 0),
      0
    );

    const nombres = detalles
      .slice(0, 2)
      .map(
        (linea) =>
          linea.producto?.nombre ||
          linea.nombreProducto ||
          'Producto'
      )
      .join(', ');

    const extra =
      detalles.length > 2
        ? ` y ${detalles.length - 2} más`
        : '';

    return (
      <TouchableOpacity
        style={styles.ventaCard}
        onPress={() => mostrarDetalle(item)}
        activeOpacity={0.8}
      >
        <View style={styles.iconoVenta}>
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={26}
            color={COLOR}
          />
        </View>

        <View style={styles.ventaInfo}>
          <View style={styles.ventaTituloFila}>
            <Text style={styles.ventaTitulo}>
              Venta #{item.id ?? '-'}
            </Text>

            <Text style={styles.ventaTotal}>
              {moneda(item.total)}
            </Text>
          </View>

          <Text style={styles.ventaFecha}>
            {fechaLegible(
              item.fecha ||
              item.createdAt ||
              item.fechaVenta
            )}
          </Text>

          <Text
            style={styles.ventaProductos}
            numberOfLines={2}
          >
            {nombres || 'Sin detalle de productos'}
            {extra}
          </Text>

          <View style={styles.ventaPie}>
            <Ionicons
              name="cube-outline"
              size={14}
              color="#9A806D"
            />

            <Text style={styles.ventaUnidades}>
              {unidades || detalles.length}{' '}
              {
                (unidades || detalles.length) === 1
                  ? 'unidad'
                  : 'unidades'
              }
            </Text>

            <Text style={styles.verDetalle}>
              Ver detalle
            </Text>

            <Ionicons
              name="chevron-forward"
              size={15}
              color={COLOR}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcono}>
          <Ionicons
            name="receipt-outline"
            size={25}
            color={COLOR}
          />
        </View>

        <View style={styles.headerTextos}>
          <Text style={styles.titulo}>
            Historial de ventas
          </Text>

          <Text style={styles.subtitulo}>
            Consulta las operaciones registradas
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonActualizar}
          onPress={() => cargarVentas(true)}
          accessibilityLabel="Actualizar historial"
        >
          <Ionicons
            name="refresh"
            size={21}
            color={COLOR}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.resumen}>
        <View style={styles.resumenItem}>
          <Text style={styles.resumenEtiqueta}>
            Ventas registradas
          </Text>

          <Text style={styles.resumenValor}>
            {ventas.length}
          </Text>
        </View>

        <View style={styles.separador} />

        <View style={styles.resumenItem}>
          <Text style={styles.resumenEtiqueta}>
            Importe total
          </Text>

          <Text style={styles.resumenMonto}>
            {moneda(totalHistorico)}
          </Text>
        </View>
      </View>

      <View style={styles.buscarContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#A8886D"
        />

        <TextInput
          style={styles.buscarInput}
          placeholder="Buscar por número o producto..."
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

      <View style={styles.filtros}>
        {[
          { key: 'todas', label: 'Todas' },
          { key: 'hoy', label: 'Hoy' },
          { key: 'mes', label: 'Este mes' },
        ].map((opcion) => (
          <TouchableOpacity
            key={opcion.key}
            style={[
              styles.filtro,
              filtro === opcion.key &&
                styles.filtroActivo,
            ]}
            onPress={() => setFiltro(opcion.key)}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === opcion.key &&
                  styles.filtroTextoActivo,
              ]}
            >
              {opcion.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {cargando ? (
        <View style={styles.estado}>
          <ActivityIndicator
            size="large"
            color={COLOR}
          />

          <Text style={styles.estadoTexto}>
            Cargando historial...
          </Text>
        </View>
      ) : (
        <FlatList
          data={ventasFiltradas}
          keyExtractor={(item, index) =>
            String(item.id ?? index)
          }
          renderItem={renderVenta}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={() => cargarVentas(true)}
              colors={[COLOR]}
            />
          }
          ListHeaderComponent={
            ventasFiltradas.length > 0 ? (
              <Text style={styles.resultados}>
                {ventasFiltradas.length}{' '}
                {ventasFiltradas.length === 1
                  ? 'resultado'
                  : 'resultados'}{' '}
                · {moneda(totalFiltrado)}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <MaterialCommunityIcons
                name="receipt-text-clock-outline"
                size={50}
                color="#C9B8AA"
              />

              <Text style={styles.vacioTitulo}>
                {error
                  ? 'No se pudo cargar el historial'
                  : 'Aún no hay ventas'}
              </Text>

              <Text style={styles.vacioTexto}>
                {error ||
                  'Cuando registres una venta, aparecerá aquí.'}
              </Text>

              {!!error && (
                <TouchableOpacity
                  style={styles.reintentar}
                  onPress={() => cargarVentas()}
                >
                  <Text style={styles.reintentarTexto}>
                    Reintentar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerIcono: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F4E4D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  headerTextos: {
    flex: 1,
  },
  titulo: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#5C3A21',
  },
  subtitulo: {
    color: '#96765F',
    fontSize: 12,
    marginTop: 3,
  },
  botonActualizar: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EADDD2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumen: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginBottom: 14,
    borderRadius: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#F0E3D8',
  },
  resumenItem: {
    flex: 1,
    paddingHorizontal: 15,
  },
  resumenEtiqueta: {
    color: '#967F6E',
    fontSize: 11,
  },
  resumenValor: {
    color: '#5C3A21',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 5,
  },
  resumenMonto: {
    color: COLOR,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 7,
  },
  separador: {
    width: 1,
    backgroundColor: '#EADDD2',
  },
  buscarContainer: {
    marginHorizontal: 18,
    paddingHorizontal: 12,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EADDD2',
    borderRadius: 12,
  },
  buscarInput: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13,
    color: '#5C3A21',
  },
  filtros: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  filtro: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4D2C3',
    backgroundColor: '#FFFFFF',
  },
  filtroActivo: {
    backgroundColor: COLOR,
    borderColor: COLOR,
  },
  filtroTexto: {
    fontSize: 12,
    color: '#806550',
    fontWeight: '600',
  },
  filtroTextoActivo: {
    color: '#FFFFFF',
  },
  lista: {
    paddingHorizontal: 18,
    paddingBottom: 25,
    flexGrow: 1,
  },
  resultados: {
    color: '#967F6E',
    fontSize: 12,
    marginBottom: 9,
  },
  ventaCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0E3D8',
    elevation: 1,
  },
  iconoVenta: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8EDE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  ventaInfo: {
    flex: 1,
  },
  ventaTituloFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  ventaTitulo: {
    color: '#5C3A21',
    fontWeight: 'bold',
    fontSize: 14,
  },
  ventaTotal: {
    color: COLOR,
    fontWeight: 'bold',
    fontSize: 15,
  },
  ventaFecha: {
    color: '#A18A78',
    fontSize: 11,
    marginTop: 4,
  },
  ventaProductos: {
    color: '#806550',
    fontSize: 12,
    marginTop: 7,
    lineHeight: 17,
  },
  ventaPie: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 9,
  },
  ventaUnidades: {
    color: '#9A806D',
    fontSize: 11,
    flex: 1,
  },
  verDetalle: {
    color: COLOR,
    fontSize: 11,
    fontWeight: '700',
  },
  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  estadoTexto: {
    color: '#8B7564',
    fontSize: 14,
  },
  vacio: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 35,
    gap: 9,
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
});

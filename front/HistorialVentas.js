import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { obtenerVentas } from './service/ventaService';

export default function HistorialVentas({ navigation }) {
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [filtro, setFiltro] = useState('TODAS');

  useFocusEffect(
    useCallback(() => {
      cargarVentas();
    }, [])
  );

  async function cargarVentas() {
    try {
      const datos = await obtenerVentas();
      setVentas(Array.isArray(datos) ? datos : []);
    } catch (error) {
      Alert.alert(
        'Error',
        'No se pudo cargar el historial de ventas. Verifica la conexión con el backend.'
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }

  const ventasFiltradas = ventas.filter((venta) => {
    if (filtro === 'TODAS') {
      return true;
    }

    const fecha = venta.fecha ? new Date(venta.fecha) : null;

    if (!fecha || Number.isNaN(fecha.getTime())) {
      return false;
    }

    const hoy = new Date();

    if (filtro === 'HOY') {
      return (
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth() &&
        fecha.getDate() === hoy.getDate()
      );
    }

    if (filtro === 'MES') {
      return (
        fecha.getFullYear() === hoy.getFullYear() &&
        fecha.getMonth() === hoy.getMonth()
      );
    }

    return true;
  });

  const totalVentas = ventas.reduce(
    (suma, venta) => suma + Number(venta.total || 0),
    0
  );

  function formatearFecha(fecha) {
    if (!fecha) {
      return 'Fecha no disponible';
    }

    const fechaObjeto = new Date(fecha);

    if (Number.isNaN(fechaObjeto.getTime())) {
      return String(fecha).replace('T', ' ');
    }

    return fechaObjeto.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function verDetalle(venta) {
    const detalles = Array.isArray(venta.detalles)
      ? venta.detalles
      : [];

    const lineas = detalles.map((detalle) => {
      const nombre = detalle.producto?.nombre || 'Producto';
      const cantidad = detalle.cantidad || 0;
      const subtotal = Number(detalle.subtotal || 0);

      return `${nombre}\n  ${cantidad} unidad(es) — S/ ${subtotal.toFixed(2)}`;
    });

    const mensaje = [
      `Venta N.° ${venta.id}`,
      `Fecha: ${formatearFecha(venta.fecha)}`,
      '',
      'Productos:',
      ...(lineas.length > 0 ? lineas : ['Sin detalles disponibles']),
      '',
      `TOTAL: S/ ${Number(venta.total || 0).toFixed(2)}`,
    ].join('\n');

    Alert.alert('Detalle de venta', mensaje, [
      {
        text: 'Cerrar',
        style: 'cancel',
      },
    ]);
  }

  function renderVenta({ item }) {
    const detalles = Array.isArray(item.detalles)
      ? item.detalles
      : [];

    const unidades = detalles.reduce(
      (suma, detalle) => suma + Number(detalle.cantidad || 0),
      0
    );

    return (
      <TouchableOpacity
        style={styles.tarjeta}
        onPress={() => verDetalle(item)}
        activeOpacity={0.75}
      >
        <View style={styles.filaSuperior}>
          <View style={styles.iconoVenta}>
            <MaterialCommunityIcons
              name="receipt-text-outline"
              size={27}
              color="#8B4A2B"
            />
          </View>

          <View style={styles.infoVenta}>
            <Text style={styles.numeroVenta}>
              Venta N.° {item.id}
            </Text>

            <Text style={styles.fechaVenta}>
              {formatearFecha(item.fecha)}
            </Text>

            <Text style={styles.cantidadProductos}>
              {unidades} unidad(es) · {detalles.length} producto(s)
            </Text>
          </View>

          <View style={styles.infoTotal}>
            <Text style={styles.totalVenta}>
              S/ {Number(item.total || 0).toFixed(2)}
            </Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#A8886D"
            />
          </View>
        </View>

        <View style={styles.separador} />

        {detalles.slice(0, 2).map((detalle, index) => (
          <View
            key={detalle.id ?? `${item.id}-${index}`}
            style={styles.filaDetalle}
          >
            <Text style={styles.nombreDetalle} numberOfLines={1}>
              {detalle.producto?.nombre || 'Producto'}
            </Text>

            <Text style={styles.cantidadDetalle}>
              x{detalle.cantidad}
            </Text>
          </View>
        ))}

        {detalles.length > 2 && (
          <Text style={styles.masProductos}>
            +{detalles.length - 2} producto(s) más
          </Text>
        )}

        <Text style={styles.verDetalle}>
          Toca para consultar el detalle
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={25}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.titulo}>Historial de ventas</Text>
          <Text style={styles.subtitulo}>
            Consulta las ventas registradas
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botonActualizar}
          onPress={() => {
            setActualizando(true);
            cargarVentas();
          }}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={23}
            color="#8B4A2B"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.resumen}>
        <View style={styles.iconoResumen}>
          <MaterialCommunityIcons
            name="cash-register"
            size={28}
            color="#8B4A2B"
          />
        </View>

        <View style={styles.infoResumen}>
          <Text style={styles.etiquetaResumen}>
            Ventas registradas
          </Text>
          <Text style={styles.numeroResumen}>
            {ventas.length}
          </Text>
        </View>

        <View style={styles.divisorResumen} />

        <View style={styles.infoResumen}>
          <Text style={styles.etiquetaResumen}>
            Total acumulado
          </Text>
          <Text style={styles.totalResumen}>
            S/ {totalVentas.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.filtros}>
        {[
          { valor: 'TODAS', texto: 'Todas' },
          { valor: 'HOY', texto: 'Hoy' },
          { valor: 'MES', texto: 'Este mes' },
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

      <View style={styles.encabezadoLista}>
        <Text style={styles.tituloLista}>Registro de operaciones</Text>
        <Text style={styles.contadorLista}>
          {ventasFiltradas.length} venta(s)
        </Text>
      </View>

      {cargando ? (
        <View style={styles.estado}>
          <ActivityIndicator size="large" color="#8B4A2B" />
          <Text style={styles.textoEstado}>
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
              onRefresh={() => {
                setActualizando(true);
                cargarVentas();
              }}
              colors={['#8B4A2B']}
            />
          }
          ListEmptyComponent={
            <View style={styles.vacio}>
              <MaterialCommunityIcons
                name="receipt-text-clock-outline"
                size={60}
                color="#C8B7A8"
              />

              <Text style={styles.tituloVacio}>
                No hay ventas registradas
              </Text>

              <Text style={styles.textoVacio}>
                Cuando registres una venta, aparecerá aquí.
              </Text>

              <TouchableOpacity
                style={styles.botonIrVentas}
                onPress={() => navigation.navigate('Ventas')}
              >
                <Text style={styles.textoBotonIrVentas}>
                  Ir a ventas
                </Text>
              </TouchableOpacity>
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
    backgroundColor: '#FDF6F0',
  },

  header: {
    backgroundColor: '#8B4A2B',
    paddingTop: 45,
    paddingBottom: 19,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  botonVolver: {
    padding: 5,
    marginRight: 9,
  },

  headerInfo: {
    flex: 1,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },

  subtitulo: {
    color: '#F0DDD0',
    fontSize: 12,
    marginTop: 4,
  },

  botonActualizar: {
    backgroundColor: '#FFFFFF',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resumen: {
    margin: 16,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAD9C9',
    elevation: 2,
  },

  iconoResumen: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#F7E9DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoResumen: {
    flex: 1,
  },

  etiquetaResumen: {
    color: '#8A7768',
    fontSize: 11,
  },

  numeroResumen: {
    color: '#4F3424',
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 4,
  },

  totalResumen: {
    color: '#8B4A2B',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 6,
  },

  divisorResumen: {
    width: 1,
    height: 42,
    backgroundColor: '#EADDD2',
    marginHorizontal: 12,
  },

  filtros: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 8,
  },

  botonFiltro: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#EFE5DC',
  },

  botonFiltroActivo: {
    backgroundColor: '#8B4A2B',
  },

  textoFiltro: {
    color: '#604B3C',
    fontSize: 12,
    fontWeight: '600',
  },

  textoFiltroActivo: {
    color: '#FFFFFF',
  },

  encabezadoLista: {
    marginHorizontal: 18,
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tituloLista: {
    color: '#4F3424',
    fontSize: 15,
    fontWeight: 'bold',
  },

  contadorLista: {
    color: '#8A7768',
    fontSize: 11,
  },

  lista: {
    paddingHorizontal: 16,
    paddingBottom: 25,
    flexGrow: 1,
  },

  tarjeta: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EAD9C9',
    elevation: 2,
  },

  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconoVenta: {
    width: 47,
    height: 47,
    borderRadius: 12,
    backgroundColor: '#F7E9DE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  infoVenta: {
    flex: 1,
  },

  numeroVenta: {
    color: '#4F3424',
    fontSize: 14,
    fontWeight: 'bold',
  },

  fechaVenta: {
    color: '#8A7768',
    fontSize: 11,
    marginTop: 4,
  },

  cantidadProductos: {
    color: '#6F5A4A',
    fontSize: 11,
    marginTop: 4,
  },

  infoTotal: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },

  totalVenta: {
    color: '#8B4A2B',
    fontSize: 15,
    fontWeight: 'bold',
  },

  separador: {
    height: 1,
    backgroundColor: '#F0E7DF',
    marginVertical: 11,
  },

  filaDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  nombreDetalle: {
    flex: 1,
    color: '#6F5A4A',
    fontSize: 12,
    marginRight: 10,
  },

  cantidadDetalle: {
    color: '#8B4A2B',
    fontSize: 12,
    fontWeight: '600',
  },

  masProductos: {
    color: '#8A7768',
    fontSize: 11,
    marginTop: 2,
  },

  verDetalle: {
    color: '#A8886D',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 7,
  },

  estado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textoEstado: {
    color: '#6F5A4A',
    marginTop: 10,
  },

  vacio: {
    alignItems: 'center',
    paddingHorizontal: 25,
    marginTop: 45,
  },

  tituloVacio: {
    color: '#5B4536',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 12,
  },

  textoVacio: {
    color: '#8A7768',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 19,
  },

  botonIrVentas: {
    backgroundColor: '#8B4A2B',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 16,
  },

  textoBotonIrVentas: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
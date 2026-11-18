
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';

import { obtenerResumenDashboard } from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

const COLOR = '#8B4A2B';
const FONDO = '#FDF6F0';

const moneda = (valor) =>
  `S/ ${Number(valor || 0).toFixed(2)}`;

// =====================================================
// COMPONENTE: TARJETA DE INDICADOR
// =====================================================

function TarjetaIndicador({
  titulo,
  valor,
  icono,
  color,
  detalle,
}) {
  return (
    <View style={styles.tarjetaIndicador}>

      <View
        style={[
          styles.iconoIndicador,
          { backgroundColor: `${color}18` },
        ]}
      >
        <MaterialCommunityIcons
          name={icono}
          size={24}
          color={color}
        />
      </View>

      <Text style={styles.indicadorTitulo}>
        {titulo}
      </Text>

      <Text style={styles.indicadorValor}>
        {valor}
      </Text>

      <Text style={styles.indicadorDetalle}>
        {detalle}
      </Text>

    </View>
  );
}

// =====================================================
// PANTALLA PRINCIPAL: DASHBOARD
// =====================================================

export default function Dashboard() {

  const { sesion } = useAuth();

  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('semana');

  // ===================================================
  // CARGAR INFORMACIÓN DEL DASHBOARD
  // ===================================================

  const cargarResumen = useCallback(async (
  refrescar = false,
  periodoSeleccionado = periodo
) => {

  try {

    if (refrescar) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    setError('');

    const datos = await obtenerResumenDashboard(
      periodoSeleccionado
    );

    setResumen(datos);

  } catch (e) {

    setError(
      e.message || 'No se pudo cargar la información.'
    );

  } finally {

    setCargando(false);
    setActualizando(false);

  }

}, [periodo]);

  // Actualizar cuando el usuario ingrese a Inicio

  useFocusEffect(
  useCallback(() => {
    cargarResumen(false, periodo);
  }, [cargarResumen, periodo])
);

  // ===================================================
  // ESTADO DE CARGA
  // ===================================================

  if (cargando && !resumen) {

    return (
      <View style={styles.centro}>

        <ActivityIndicator
          size="large"
          color={COLOR}
        />

        <Text style={styles.textoSecundario}>
          Cargando información...
        </Text>

      </View>
    );

  }

  // ===================================================
  // ERROR DE CONEXIÓN
  // ===================================================

  if (error && !resumen) {

    return (
      <View style={styles.centro}>

        <MaterialCommunityIcons
          name="cloud-alert-outline"
          size={48}
          color="#B54736"
        />

        <Text style={styles.errorTitulo}>
          No se pudo cargar el Dashboard
        </Text>

        <Text style={styles.textoSecundario}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.botonReintentar}
          onPress={() => cargarResumen()}
        >
          <Text style={styles.textoBoton}>
            Reintentar
          </Text>
        </TouchableOpacity>

      </View>
    );

  }

  // ===================================================
  // PREPARAR DATOS DEL GRÁFICO
  // ===================================================

  const ventasPorDia = resumen?.ventasPorDia || [];

  const datosGrafico = ventasPorDia.map((punto) => ({

    value: Number(punto.total || 0),

    label: punto.etiqueta || '',

    frontColor: COLOR,

    topLabelComponent: () => (
      <Text style={styles.valorGrafico}>
        {Number(punto.total || 0) > 0
          ? Number(punto.total).toFixed(0)
          : ''}
      </Text>
    ),

  }));

  // ===================================================
  // RENDERIZADO
  // ===================================================

  return (

    <ScrollView
      style={styles.contenedor}
      contentContainerStyle={styles.contenido}

      refreshControl={
        <RefreshControl
          refreshing={actualizando}
          onRefresh={() => cargarResumen(true)}
          colors={[COLOR]}
        />
      }
    >

      {/* =============================================
          ENCABEZADO
      ============================================= */}

      <View style={styles.encabezado}>

        <View style={{ flex: 1 }}>

          <Text style={styles.saludo}>
            PANEL ADMINISTRATIVO
          </Text>

          <Text style={styles.titulo}>
            ¡Hola, {sesion?.nombreCompleto || 'Administrador'}!
          </Text>

          <Text style={styles.subtitulo}>
            Resumen de Pastelería El Molino
          </Text>

        </View>

        <TouchableOpacity
          style={styles.botonActualizar}
          onPress={() => cargarResumen(true)}
        >

          <MaterialCommunityIcons
            name="refresh"
            size={23}
            color={COLOR}
          />

        </TouchableOpacity>

      </View>

      {/* ERROR AL ACTUALIZAR */}

      {error !== '' && (

        <Text style={styles.avisoError}>
          {error}
        </Text>

      )}


{/* FILTRO DE PERÍODO */}

<Text style={styles.seccionTitulo}>
  Período de consulta
</Text>

<View style={styles.contenedorFiltro}>

  {[
    { valor: 'dia', etiqueta: 'Día', icono: 'calendar-today' },
    { valor: 'semana', etiqueta: 'Semana', icono: 'calendar-week' },
    { valor: 'mes', etiqueta: 'Mes', icono: 'calendar-month' },
  ].map((opcion) => (

    <TouchableOpacity
      key={opcion.valor}
      style={[
        styles.botonFiltro,
        periodo === opcion.valor && styles.botonFiltroActivo,
      ]}
      onPress={() => {
        setPeriodo(opcion.valor);
        cargarResumen(true, opcion.valor);
      }}
      disabled={actualizando}
    >

      <MaterialCommunityIcons
        name={opcion.icono}
        size={17}
        color={periodo === opcion.valor ? '#FFFFFF' : COLOR}
      />

      <Text
        style={[
          styles.textoFiltro,
          periodo === opcion.valor && styles.textoFiltroActivo,
        ]}
      >
        {opcion.etiqueta}
      </Text>

    </TouchableOpacity>

  ))}

</View>


      {/* =============================================
          INDICADORES GENERALES
      ============================================= */}

      <Text style={styles.seccionTitulo}>
        Resumen general
      </Text>

      <View style={styles.gridIndicadores}>

        <TarjetaIndicador
          titulo="Productos"
          valor={resumen?.totalProductos ?? 0}
          icono="package-variant"
          color="#8B4A2B"
          detalle="Registrados"
        />

        <TarjetaIndicador
          titulo="Stock bajo"
          valor={resumen?.productosStockBajo ?? 0}
          icono="alert-circle-outline"
          color="#C1842D"
          detalle="De 1 a 5 unidades"
        />

        <TarjetaIndicador
          titulo="Agotados"
          valor={resumen?.productosAgotados ?? 0}
          icono="package-variant-closed-remove"
          color="#B54736"
          detalle="Sin existencias"
        />

        <TarjetaIndicador
          titulo="Disponibles"
          valor={resumen?.productosDisponibles ?? 0}
          icono="check-circle-outline"
          color="#43865A"
          detalle="Con existencias"
        />

      </View>

      {/* =============================================
          INGRESOS Y VENTAS
      ============================================= */}

      <View style={styles.tarjetaIngresos}>

  <View style={styles.filaIngresos}>

    <View>
      <Text style={styles.etiquetaBlanca}>
        Ingresos del período
      </Text>

      <Text style={styles.ingresoPrincipal}>
        {moneda(resumen?.ingresosPeriodo)}
      </Text>

      <Text style={styles.detalleBlanco}>
        {resumen?.ventasPeriodo ?? 0} ventas registradas
      </Text>
    </View>

    <MaterialCommunityIcons
      name="cash-multiple"
      size={36}
      color="#FFFFFF"
    />

  </View>

</View>

      {/* =============================================
          GRÁFICO DE VENTAS
      ============================================= */}

      <Text style={styles.seccionTitulo}>
        Ventas de los últimos 7 días
      </Text>

      <View style={styles.tarjetaSeccion}>

        <View style={styles.encabezadoGrafico}>

          <View>

            <Text style={styles.tituloGrafico}>
              Rendimiento de ventas
            </Text>

            <Text style={styles.subtituloGrafico}>
              Ingresos diarios en soles
            </Text>

          </View>

          <MaterialCommunityIcons
            name="chart-bar"
            size={25}
            color={COLOR}
          />

        </View>

        {datosGrafico.length === 0 ? (

          <Text style={styles.vacio}>
            Todavía no hay datos de ventas.
          </Text>

        ) : (

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >

            <BarChart
              data={datosGrafico}

              height={150}
              barWidth={25}
              spacing={18}

              roundedTop
              roundedBottom

              noOfSections={4}

              yAxisThickness={0}
              xAxisThickness={1}

              xAxisColor="#EADDD2"
              yAxisColor="transparent"

              yAxisTextStyle={{
                color: '#A99B90',
                fontSize: 10,
              }}

              xAxisLabelTextStyle={{
                color: '#806B5C',
                fontSize: 10,
              }}

              hideRules={false}
              rulesColor="#F1EAE4"
              rulesType="solid"

              isAnimated
              animationDuration={600}

              initialSpacing={15}
              endSpacing={15}

              formatYLabel={(value) =>
                Number(value).toFixed(0)
              }

            />

          </ScrollView>

        )}

      </View>

      {/* =============================================
          ALERTAS DE INVENTARIO
      ============================================= */}

      <Text style={styles.seccionTitulo}>
        Alertas de inventario
      </Text>

      <View style={styles.tarjetaSeccion}>

        {(resumen?.alertasStock || []).length === 0 ? (

          <View style={styles.filaVacia}>

            <MaterialCommunityIcons
              name="check-circle-outline"
              size={23}
              color="#43865A"
            />

            <Text style={styles.textoVacio}>
              No hay productos con stock bajo.
            </Text>

          </View>

        ) : (

          resumen.alertasStock.map((producto) => (

            <View
              key={producto.id}
              style={styles.filaProducto}
            >

              <MaterialCommunityIcons
                name={
                  producto.agotado
                    ? 'package-variant-closed-remove'
                    : 'alert-circle-outline'
                }
                size={25}
                color={
                  producto.agotado
                    ? '#B54736'
                    : '#C1842D'
                }
              />

              <View style={styles.datosProducto}>

                <Text style={styles.nombreProducto}>
                  {producto.nombre}
                </Text>

                <Text style={styles.detalleProducto}>
                  {producto.agotado
                    ? 'Producto agotado'
                    : 'Necesita reposición'}
                </Text>

              </View>

              <Text style={styles.stockProducto}>
                {producto.stock} un.
              </Text>

            </View>

          ))

        )}

      </View>

      {/* =============================================
          PRODUCTOS MÁS VENDIDOS
      ============================================= */}

      <Text style={styles.seccionTitulo}>
        Productos más vendidos
      </Text>

      <View style={styles.tarjetaSeccion}>

        {(resumen?.productosMasVendidos || []).length === 0 ? (

          <Text style={styles.vacio}>
            Todavía no hay ventas registradas.
          </Text>

        ) : (

          resumen.productosMasVendidos.map((producto, index) => (

            <View
              key={`${producto.nombre}-${index}`}
              style={styles.filaProducto}
            >

              <View style={styles.numeroRanking}>

                <Text style={styles.numeroRankingTexto}>
                  {index + 1}
                </Text>

              </View>

              <Text
                style={[
                  styles.nombreProducto,
                  { flex: 1 },
                ]}
                numberOfLines={1}
              >
                {producto.nombre}
              </Text>

              <Text style={styles.stockProducto}>
                {producto.unidades} un.
              </Text>

            </View>

          ))

        )}

      </View>

      {/* =============================================
          VENTAS RECIENTES
      ============================================= */}

      <Text style={styles.seccionTitulo}>
        Ventas recientes
      </Text>

      <View style={styles.tarjetaSeccion}>

        {(resumen?.ventasRecientes || []).length === 0 ? (

          <Text style={styles.vacio}>
            No hay ventas recientes.
          </Text>

        ) : (

          resumen.ventasRecientes.map((venta) => (

            <View
              key={venta.id}
              style={styles.filaProducto}
            >

              <MaterialCommunityIcons
                name="receipt-text-outline"
                size={24}
                color={COLOR}
              />

              <View style={styles.datosProducto}>

                <Text style={styles.nombreProducto}>
                  Venta #{venta.id}
                </Text>

                <Text style={styles.detalleProducto}>
                  {venta.fecha || 'Fecha no disponible'}
                </Text>

              </View>

              <Text style={styles.totalVenta}>
                {moneda(venta.total)}
              </Text>

            </View>

          ))

        )}

      </View>

      {/* PIE */}

      <Text style={styles.pie}>
        Desliza hacia abajo para actualizar la información.
      </Text>

    </ScrollView>

  );
}

// =====================================================
// ESTILOS
// =====================================================

const styles = StyleSheet.create({

  contenedor: {
    flex: 1,
    backgroundColor: FONDO,
  },

  contenido: {
    padding: 18,
    paddingBottom: 35,
  },

  centro: {
    flex: 1,
    backgroundColor: FONDO,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  encabezado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },

  saludo: {
    color: COLOR,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
  },

  titulo: {
    color: '#3F2A20',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 5,
  },

  subtitulo: {
    color: '#806B5C',
    fontSize: 13,
    marginTop: 4,
  },

  botonActualizar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#F1E3D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  seccionTitulo: {
    color: '#4F3424',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 11,
  },

  gridIndicadores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },

  tarjetaIndicador: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 14,
    elevation: 2,
  },

  iconoIndicador: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  indicadorTitulo: {
    color: '#806B5C',
    fontSize: 12,
  },

  indicadorValor: {
    color: '#3F2A20',
    fontSize: 25,
    fontWeight: '800',
    marginTop: 4,
  },

  indicadorDetalle: {
    color: '#A99B90',
    fontSize: 10,
    marginTop: 4,
  },

  tarjetaIngresos: {
    backgroundColor: COLOR,
    marginTop: 15,
    padding: 19,
    borderRadius: 18,
  },

  filaIngresos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  etiquetaBlanca: {
    color: '#F5DFD0',
    fontSize: 13,
  },

  ingresoPrincipal: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '800',
    marginTop: 5,
  },

  detalleBlanco: {
    color: '#F5DFD0',
    fontSize: 11,
    marginTop: 4,
  },

  ingresoMes: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  separadorBlanco: {
    height: 1,
    backgroundColor: '#FFFFFF35',
    marginVertical: 15,
  },

  tarjetaSeccion: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    elevation: 2,
  },

  encabezadoGrafico: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  tituloGrafico: {
    color: '#493327',
    fontSize: 14,
    fontWeight: '800',
  },

  subtituloGrafico: {
    color: '#A99B90',
    fontSize: 11,
    marginTop: 4,
  },

  valorGrafico: {
    color: COLOR,
    fontSize: 9,
    fontWeight: '700',
    marginBottom: 4,
  },

  filaProducto: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EAE4',
  },

  datosProducto: {
    flex: 1,
  },

  nombreProducto: {
    color: '#493327',
    fontSize: 13,
    fontWeight: '700',
  },

  detalleProducto: {
    color: '#A99B90',
    fontSize: 11,
    marginTop: 3,
  },

  stockProducto: {
    color: COLOR,
    fontSize: 12,
    fontWeight: '800',
  },

  numeroRanking: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: '#F1E3D8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numeroRankingTexto: {
    color: COLOR,
    fontWeight: '800',
  },

  totalVenta: {
    color: COLOR,
    fontSize: 12,
    fontWeight: '800',
  },

  filaVacia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 8,
  },

  textoVacio: {
    color: '#43865A',
    fontSize: 12,
  },

  vacio: {
    color: '#A99B90',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 15,
  },

  textoSecundario: {
    color: '#806B5C',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },

  errorTitulo: {
    color: '#B54736',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
  },

  botonReintentar: {
    backgroundColor: COLOR,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 12,
  },

  textoBoton: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  avisoError: {
    color: '#B54736',
    backgroundColor: '#FCE8E6',
    padding: 10,
    borderRadius: 10,
    fontSize: 12,
  },

  pie: {
    color: '#A99B90',
    textAlign: 'center',
    fontSize: 10,
    marginTop: 22,
  },

  contenedorFiltro: {
  flexDirection: 'row',
  backgroundColor: '#F1E3D8',
  borderRadius: 14,
  padding: 5,
  gap: 5,
},

botonFiltro: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 5,
  paddingVertical: 12,
  borderRadius: 10,
},

botonFiltroActivo: {
  backgroundColor: COLOR,
},

textoFiltro: {
  color: COLOR,
  fontSize: 12,
  fontWeight: '600',
},

textoFiltroActivo: {
  color: '#FFFFFF',
},

});

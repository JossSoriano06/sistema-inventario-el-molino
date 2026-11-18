
package com.elmolino.demo.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elmolino.demo.entity.DetalleVenta;
import com.elmolino.demo.entity.Producto;
import com.elmolino.demo.entity.Venta;
import com.elmolino.demo.repository.ProductoRepository;
import com.elmolino.demo.repository.VentaRepository;



@Service
public class DashboardService {

    private static final int UMBRAL_STOCK_BAJO = 5;

    private static final DateTimeFormatter FORMATO_FECHA =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final ProductoRepository productoRepository;
    private final VentaRepository ventaRepository;

    public DashboardService(
            ProductoRepository productoRepository,
            VentaRepository ventaRepository) {

        this.productoRepository = productoRepository;
        this.ventaRepository = ventaRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumen(String periodo) {

    LocalDate hoy = LocalDate.now();

    List<Producto> productos = productoRepository.findAll();

    List<Venta> ventas =
            ventaRepository.findAllByOrderByFechaDesc();

    // Estadísticas actuales del inventario
    long totalProductos = productos.size();

    long productosDisponibles = productos.stream()
            .filter(p -> obtenerStock(p) > 0)
            .count();

    long productosStockBajo = productos.stream()
            .filter(p -> obtenerStock(p) > 0)
            .filter(p -> obtenerStock(p) <= UMBRAL_STOCK_BAJO)
            .count();

    long productosAgotados = productos.stream()
            .filter(p -> obtenerStock(p) == 0)
            .count();

    BigDecimal valorInventario = productos.stream()
            .map(p -> {
                BigDecimal precio = p.getPrecio() == null
                        ? BigDecimal.ZERO : p.getPrecio();

                return precio.multiply(
                        BigDecimal.valueOf(obtenerStock(p))
                );
            })
            .reduce(BigDecimal.ZERO, BigDecimal::add);

    // Definir el período solicitado
    LocalDateTime inicio;
    LocalDateTime fin = LocalDateTime.now();

    switch (periodo.toLowerCase()) {

        case "dia":
            inicio = hoy.atStartOfDay();
            break;

        case "semana":
            inicio = hoy.minusDays(6).atStartOfDay();
            break;

        case "mes":
            inicio = hoy.withDayOfMonth(1).atStartOfDay();
            break;

        default:
            throw new IllegalArgumentException(
                    "Período no válido. Utilice dia, semana o mes."
            );
    }

    // Filtrar ventas según el período
    List<Venta> ventasPeriodo = ventas.stream()
            .filter(v -> v.getFecha() != null)
            .filter(v -> !v.getFecha().isBefore(inicio))
            .filter(v -> !v.getFecha().isAfter(fin))
            .toList();

    BigDecimal ingresosPeriodo = sumarVentas(ventasPeriodo);

    // Datos para el gráfico
    List<Map<String, Object>> ventasPorDia =
            calcularGraficoPeriodo(ventasPeriodo, periodo, hoy);

    // Datos complementarios
    List<Map<String, Object>> productosMasVendidos =
            obtenerProductosMasVendidos(ventasPeriodo);

    List<Map<String, Object>> ventasRecientes =
            obtenerVentasRecientes(ventasPeriodo);

    List<Map<String, Object>> alertasStock =
            obtenerAlertasStock(productos);

    // Respuesta
    Map<String, Object> resumen = new LinkedHashMap<>();

    resumen.put("totalProductos", totalProductos);
    resumen.put("productosDisponibles", productosDisponibles);
    resumen.put("productosStockBajo", productosStockBajo);
    resumen.put("productosAgotados", productosAgotados);
    resumen.put("valorInventario", valorInventario);

    resumen.put("periodo", periodo);
    resumen.put("ventasPeriodo", ventasPeriodo.size());
    resumen.put("ingresosPeriodo", ingresosPeriodo);

    resumen.put("ventasPorDia", ventasPorDia);

    resumen.put("productosMasVendidos", productosMasVendidos);
    resumen.put("ventasRecientes", ventasRecientes);
    resumen.put("alertasStock", alertasStock);

    return resumen;
}

// Generar los datos del gráfico según el período
private List<Map<String, Object>> calcularGraficoPeriodo(
        List<Venta> ventas,
        String periodo,
        LocalDate hoy) {

    List<Map<String, Object>> resultado = new ArrayList<>();

    if (periodo.equalsIgnoreCase("dia")) {

        for (int hora = 0; hora < 24; hora++) {

            final int horaActual = hora;

            BigDecimal total = ventas.stream()
                    .filter(v -> v.getFecha().getHour() == horaActual)
                    .map(Venta::getTotal)
                    .filter(t -> t != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dato = new LinkedHashMap<>();

            dato.put("fecha", String.format("%02d:00", hora));
            dato.put("etiqueta", String.format("%02d h", hora));
            dato.put("total", total);

            resultado.add(dato);
        }

    } else {

        LocalDate inicio = periodo.equalsIgnoreCase("semana")
                ? hoy.minusDays(6)
                : hoy.withDayOfMonth(1);

        for (LocalDate dia = inicio;
             !dia.isAfter(hoy);
             dia = dia.plusDays(1)) {

            final LocalDate fechaActual = dia;

            BigDecimal total = ventas.stream()
                    .filter(v -> v.getFecha()
                            .toLocalDate().equals(fechaActual))
                    .map(Venta::getTotal)
                    .filter(t -> t != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dato = new LinkedHashMap<>();

            dato.put("fecha", dia.toString());
            dato.put(
                    "etiqueta",
                    dia.format(DateTimeFormatter.ofPattern("dd/MM"))
            );
            dato.put("total", total);

            resultado.add(dato);
        }
    }

    return resultado;
}

    // Obtener stock de manera segura
    private int obtenerStock(Producto producto) {
        return producto.getStock() == null
                ? 0
                : producto.getStock();
    }

    // Sumar importes de ventas
    private BigDecimal sumarVentas(List<Venta> ventas) {
        return ventas.stream()
                .map(Venta::getTotal)
                .filter(total -> total != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Calcular ventas de los últimos siete días
    private List<Map<String, Object>> calcularVentasPorDia(
            List<Venta> ventas,
            LocalDate hoy) {

        List<Map<String, Object>> resultado = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {

            LocalDate dia = hoy.minusDays(i);

            BigDecimal totalDia = ventas.stream()
                    .filter(v -> v.getFecha() != null)
                    .filter(v -> v.getFecha()
                            .toLocalDate().equals(dia))
                    .map(Venta::getTotal)
                    .filter(total -> total != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> dato = new LinkedHashMap<>();

            dato.put("fecha", dia.toString());
            dato.put(
                    "etiqueta",
                    dia.format(DateTimeFormatter.ofPattern("dd/MM"))
            );
            dato.put("total", totalDia);

            resultado.add(dato);
        }

        return resultado;
    }

    // Obtener los cinco productos más vendidos
    private List<Map<String, Object>> obtenerProductosMasVendidos(
            List<Venta> ventas) {

        Map<Long, Integer> cantidades = new HashMap<>();
        Map<Long, String> nombres = new HashMap<>();

        for (Venta venta : ventas) {

            if (venta.getDetalles() == null) {
                continue;
            }

            for (DetalleVenta detalle : venta.getDetalles()) {

                if (detalle.getProducto() == null
                        || detalle.getCantidad() == null) {
                    continue;
                }

                Producto producto = detalle.getProducto();
                Long id = producto.getId();

                cantidades.merge(
                        id,
                        detalle.getCantidad(),
                        Integer::sum
                );

                nombres.put(id, producto.getNombre());
            }
        }

        return cantidades.entrySet().stream()
                .sorted(
                        Map.Entry.<Long, Integer>comparingByValue(
                                Comparator.reverseOrder()
                        )
                )
                .limit(5)
                .map(entry -> {
                    Map<String, Object> dato = new LinkedHashMap<>();

                    dato.put("id", entry.getKey());
                    dato.put(
                            "nombre",
                            nombres.get(entry.getKey())
                    );
                    dato.put("unidades", entry.getValue());

                    return dato;
                })
                .toList();
    }

    // Obtener las cinco ventas más recientes
    private List<Map<String, Object>> obtenerVentasRecientes(
            List<Venta> ventas) {

        return ventas.stream()
                .limit(5)
                .map(venta -> {

                    Map<String, Object> dato = new LinkedHashMap<>();

                    dato.put("id", venta.getId());
                    dato.put("total", venta.getTotal());

                    dato.put(
                            "fecha",
                            venta.getFecha() == null
                                    ? null
                                    : venta.getFecha().format(FORMATO_FECHA)
                    );

                    return dato;
                })
                .toList();
    }

    // Obtener productos agotados o con stock bajo
    private List<Map<String, Object>> obtenerAlertasStock(
            List<Producto> productos) {

        return productos.stream()
                .filter(p -> obtenerStock(p) <= UMBRAL_STOCK_BAJO)
                .sorted(
                        Comparator.comparingInt(this::obtenerStock)
                )
                .limit(8)
                .map(producto -> {

                    Map<String, Object> dato = new LinkedHashMap<>();

                    dato.put("id", producto.getId());
                    dato.put("nombre", producto.getNombre());
                    dato.put("stock", obtenerStock(producto));

                    dato.put(
                            "agotado",
                            obtenerStock(producto) == 0
                    );

                    return dato;
                })
                .toList();
    }
}


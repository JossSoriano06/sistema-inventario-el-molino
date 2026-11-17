
package com.elmolino.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elmolino.demo.dto.DetalleVentaSolicitud;
import com.elmolino.demo.dto.SolicitudVenta;
import com.elmolino.demo.entity.DetalleVenta;
import com.elmolino.demo.entity.MovimientoInventario;
import com.elmolino.demo.entity.Producto;
import com.elmolino.demo.entity.Venta;
import com.elmolino.demo.repository.MovimientoInventarioRepository;
import com.elmolino.demo.repository.ProductoRepository;
import com.elmolino.demo.repository.VentaRepository;

@Service
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public VentaService(
            VentaRepository ventaRepository,
            ProductoRepository productoRepository,
            MovimientoInventarioRepository movimientoRepository) {

        this.ventaRepository = ventaRepository;
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional
    public Venta registrarVenta(SolicitudVenta solicitud) {

        if (solicitud == null
                || solicitud.getDetalles() == null
                || solicitud.getDetalles().isEmpty()) {

            throw new IllegalArgumentException(
                "La venta debe contener al menos un producto"
            );
        }

        Set<Long> productosRepetidos = new HashSet<>();

        Venta venta = new Venta();
        BigDecimal total = BigDecimal.ZERO;

        for (DetalleVentaSolicitud linea : solicitud.getDetalles()) {

            if (linea == null || linea.getProductoId() == null) {
                throw new IllegalArgumentException(
                    "Cada detalle debe indicar un producto"
                );
            }

            if (linea.getCantidad() == null
                    || linea.getCantidad() <= 0) {

                throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero"
                );
            }

            if (!productosRepetidos.add(linea.getProductoId())) {
                throw new IllegalArgumentException(
                    "No repitas un producto; actualiza su cantidad en una sola línea"
                );
            }

            Producto producto = productoRepository
                .findById(linea.getProductoId())
                .orElseThrow(() ->
                    new IllegalArgumentException(
                        "No existe el producto con ID "
                            + linea.getProductoId()
                    )
                );

            int stockAnterior = producto.getStock();

            if (linea.getCantidad() > stockAnterior) {
                throw new IllegalArgumentException(
                    "Stock insuficiente para "
                        + producto.getNombre()
                        + ". Disponible: "
                        + stockAnterior
                );
            }

            // Obtener el precio real del producto desde la base de datos.
            BigDecimal precio = producto.getPrecio();

            // Calcular el subtotal de esta línea.
            BigDecimal subtotal = precio.multiply(
                BigDecimal.valueOf(linea.getCantidad())
            );

            total = total.add(subtotal);

            // Crear el detalle de la venta.
            DetalleVenta detalle = new DetalleVenta();

            detalle.setProducto(producto);
            detalle.setCantidad(linea.getCantidad());
            detalle.setPrecioUnitario(precio);
            detalle.setSubtotal(subtotal);

            venta.agregarDetalle(detalle);

            // Descontar las unidades vendidas.
            producto.setStock(
                stockAnterior - linea.getCantidad()
            );

            productoRepository.save(producto);

            // Registrar la salida en el historial de inventario.
            MovimientoInventario movimiento =
                new MovimientoInventario();

            movimiento.setProducto(producto);
            movimiento.setTipo("SALIDA");
            movimiento.setCantidad(linea.getCantidad());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockNuevo(producto.getStock());
            movimiento.setMotivo("Venta registrada");
            movimiento.setFecha(LocalDateTime.now());

            movimientoRepository.save(movimiento);
        }

        // Guardar el total de la operación.
        venta.setTotal(total);

        // CascadeType.ALL guarda también los detalles.
        return ventaRepository.save(venta);
    }

    @Transactional(readOnly = true)
    public List<Venta> listarVentas() {
        return ventaRepository.findAllByOrderByFechaDesc();
    }

    @Transactional(readOnly = true)
    public Venta obtenerVenta(Long id) {
        return ventaRepository.findById(id)
            .orElseThrow(() ->
                new IllegalArgumentException(
                    "No existe la venta con ID " + id
                )
            );
    }
}

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
                "La venta debe contener al menos un producto."
            );
        }

        Venta venta = new Venta();
        BigDecimal total = BigDecimal.ZERO;
        Set<Long> productosIncluidos = new HashSet<>();

        for (DetalleVentaSolicitud item : solicitud.getDetalles()) {

            if (item.getProductoId() == null) {
                throw new IllegalArgumentException(
                    "Todos los productos deben tener un identificador."
                );
            }

            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero."
                );
            }

            if (!productosIncluidos.add(item.getProductoId())) {
                throw new IllegalArgumentException(
                    "No repitas un producto en la venta. "
                    + "Suma sus cantidades en un solo detalle."
                );
            }

            Producto producto = productoRepository
                .findById(item.getProductoId())
                .orElseThrow(() -> new IllegalArgumentException(
                    "No existe el producto con ID "
                    + item.getProductoId()
                ));

            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException(
                    "Stock insuficiente para el producto: "
                    + producto.getNombre()
                );
            }

            BigDecimal precio = producto.getPrecio();

            if (precio == null || precio.signum() <= 0) {
                throw new IllegalArgumentException(
                    "El producto tiene un precio no válido."
                );
            }

            BigDecimal subtotal = precio.multiply(
                BigDecimal.valueOf(item.getCantidad())
            );

            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(item.getCantidad());
            detalle.setPrecioUnitario(precio);
            detalle.setSubtotal(subtotal);

            venta.agregarDetalle(detalle);
            total = total.add(subtotal);
        }

        venta.setTotal(total);
        venta.setFecha(LocalDateTime.now());

        // Guarda la venta y sus detalles.
        Venta ventaGuardada = ventaRepository.save(venta);

        // Actualiza el inventario y registra cada salida.
        for (DetalleVenta detalle : ventaGuardada.getDetalles()) {

            Producto producto = detalle.getProducto();
            int stockAnterior = producto.getStock();
            int cantidadVendida = detalle.getCantidad();
            int stockNuevo = stockAnterior - cantidadVendida;

            producto.setStock(stockNuevo);
            productoRepository.save(producto);

            MovimientoInventario movimiento =
                new MovimientoInventario();

            movimiento.setProducto(producto);
            movimiento.setTipo("SALIDA");
            movimiento.setCantidad(cantidadVendida);
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockNuevo(stockNuevo);
            movimiento.setMotivo(
                "Venta #" + ventaGuardada.getId()
            );
            movimiento.setFecha(LocalDateTime.now());

            movimientoRepository.save(movimiento);
        }

        return ventaGuardada;
    }

    @Transactional(readOnly = true)
    public List<Venta> listarVentas() {
        return ventaRepository.findAllByOrderByFechaDesc();
    }

    @Transactional(readOnly = true)
    public Venta obtenerVenta(Long id) {
        return ventaRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException(
                "No existe la venta con ID " + id
            ));
    }
}
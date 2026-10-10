package com.elmolino.demo.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.elmolino.demo.entity.MovimientoInventario;
import com.elmolino.demo.entity.Producto;
import com.elmolino.demo.repository.MovimientoInventarioRepository;
import com.elmolino.demo.repository.ProductoRepository;

@Service
public class InventarioService {

    private final ProductoRepository productoRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    public InventarioService(
            ProductoRepository productoRepository,
            MovimientoInventarioRepository movimientoRepository) {
        this.productoRepository = productoRepository;
        this.movimientoRepository = movimientoRepository;
    }

    @Transactional
    public MovimientoInventario registrarMovimiento(
            Long productoId,
            String tipo,
            Integer cantidad,
            String motivo) {

        if (productoId == null) {
            throw new IllegalArgumentException("El producto es obligatorio");
        }

        if (cantidad == null || cantidad <= 0) {
            throw new IllegalArgumentException(
                    "La cantidad debe ser mayor que cero");
        }

        if (motivo == null || motivo.isBlank()) {
            throw new IllegalArgumentException("El motivo es obligatorio");
        }

        String tipoNormalizado = tipo == null
                ? ""
                : tipo.trim().toUpperCase();

        if (!tipoNormalizado.equals("ENTRADA")
                && !tipoNormalizado.equals("SALIDA")) {
            throw new IllegalArgumentException(
                    "El tipo debe ser ENTRADA o SALIDA");
        }

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "No existe el producto con ID " + productoId));

        int stockAnterior = producto.getStock();
        int stockNuevo;

        if (tipoNormalizado.equals("ENTRADA")) {
            stockNuevo = Math.addExact(stockAnterior, cantidad);
        } else {
            if (cantidad > stockAnterior) {
                throw new IllegalArgumentException(
                        "Stock insuficiente. Disponible: " + stockAnterior);
            }

            stockNuevo = stockAnterior - cantidad;
        }

        producto.setStock(stockNuevo);
        productoRepository.save(producto);

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setProducto(producto);
        movimiento.setTipo(tipoNormalizado);
        movimiento.setCantidad(cantidad);
        movimiento.setStockAnterior(stockAnterior);
        movimiento.setStockNuevo(stockNuevo);
        movimiento.setMotivo(motivo.trim());
        movimiento.setFecha(LocalDateTime.now());

        return movimientoRepository.save(movimiento);
    }

    @Transactional(readOnly = true)
    public List<MovimientoInventario> listarMovimientos() {
        return movimientoRepository.findAllByOrderByFechaDesc();
    }

    @Transactional(readOnly = true)
    public List<MovimientoInventario> listarPorProducto(Long productoId) {
        if (!productoRepository.existsById(productoId)) {
            throw new IllegalArgumentException(
                    "No existe el producto con ID " + productoId);
        }

        return movimientoRepository
                .findByProductoIdOrderByFechaDesc(productoId);
    }
}
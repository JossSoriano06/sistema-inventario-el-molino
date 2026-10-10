package com.elmolino.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elmolino.demo.dto.SolicitudMovimiento;
import com.elmolino.demo.entity.MovimientoInventario;
import com.elmolino.demo.service.InventarioService;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping
    public List<MovimientoInventario> listarMovimientos() {
        return inventarioService.listarMovimientos();
    }

    @GetMapping("/producto/{id}")
    public List<MovimientoInventario> listarPorProducto(
            @PathVariable Long id) {
        return inventarioService.listarPorProducto(id);
    }

    @PostMapping
    public ResponseEntity<?> registrarMovimiento(
            @RequestBody SolicitudMovimiento solicitud) {

        try {
            MovimientoInventario movimiento =
                    inventarioService.registrarMovimiento(
                            solicitud.getProductoId(),
                            solicitud.getTipo(),
                            solicitud.getCantidad(),
                            solicitud.getMotivo());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(movimiento);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("mensaje", e.getMessage()));
        } catch (ArithmeticException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "mensaje",
                            "La cantidad supera el límite permitido"));
        }
    }

   
}
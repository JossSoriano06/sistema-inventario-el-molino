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

import com.elmolino.demo.dto.SolicitudVenta;
import com.elmolino.demo.entity.Venta;
import com.elmolino.demo.service.VentaService;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @PostMapping
    public ResponseEntity<?> registrarVenta(
            @RequestBody SolicitudVenta solicitud) {

        try {
            Venta venta = ventaService.registrarVenta(solicitud);

            return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(venta);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                .badRequest()
                .body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping
    public List<Venta> listarVentas() {
        return ventaService.listarVentas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerVenta(@PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                ventaService.obtenerVenta(id)
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of("mensaje", e.getMessage()));
        }
    }
}
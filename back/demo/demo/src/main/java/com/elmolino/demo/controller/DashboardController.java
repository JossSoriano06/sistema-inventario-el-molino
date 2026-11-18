package com.elmolino.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.elmolino.demo.service.DashboardService;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(
            DashboardService dashboardService) {

        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumen(

            @RequestParam(defaultValue = "semana")
            String periodo) {

        if (!periodo.equalsIgnoreCase("dia")
                && !periodo.equalsIgnoreCase("semana")
                && !periodo.equalsIgnoreCase("mes")) {

            return ResponseEntity.badRequest().build();
        }

        Map<String, Object> resumen =
                dashboardService.obtenerResumen(periodo);

        return ResponseEntity.ok(resumen);
    }
}
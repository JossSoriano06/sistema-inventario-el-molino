
package com.elmolino.demo.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

public class SolicitudVenta {

    @Valid
    @NotEmpty(
        message = "La venta debe contener al menos un producto"
    )
    private List<DetalleVentaSolicitud> detalles;

    public List<DetalleVentaSolicitud> getDetalles() {
        return detalles;
    }

    public void setDetalles(
        List<DetalleVentaSolicitud> detalles
    ) {
        this.detalles = detalles;
    }
}

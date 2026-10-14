package com.elmolino.demo.dto;

import java.util.List;

public class SolicitudVenta {

    private List<DetalleVentaSolicitud> detalles;

    public SolicitudVenta() {
    }

    public List<DetalleVentaSolicitud> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleVentaSolicitud> detalles) {
        this.detalles = detalles;
    }
}


package com.elmolino.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elmolino.demo.entity.DetalleVenta;

public interface DetalleVentaRepository
        extends JpaRepository<DetalleVenta, Long> {
}


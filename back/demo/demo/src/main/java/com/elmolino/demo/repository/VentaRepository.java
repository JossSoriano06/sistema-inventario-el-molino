
package com.elmolino.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.elmolino.demo.entity.Venta;

public interface VentaRepository
        extends JpaRepository<Venta, Long> {

    List<Venta> findAllByOrderByFechaDesc();
}


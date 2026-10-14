package com.elmolino.demo.repository;

import java.util.Optional;
 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
 
import com.elmolino.demo.entity.Usuario;
 
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
 
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
 
    boolean existsByNombreUsuario(String nombreUsuario);
}
 
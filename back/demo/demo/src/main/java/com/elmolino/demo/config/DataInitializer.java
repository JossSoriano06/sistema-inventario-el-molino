package com.elmolino.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.elmolino.demo.entity.Rol;
import com.elmolino.demo.entity.Usuario;
import com.elmolino.demo.repository.UsuarioRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Solo crea el administrador si la tabla está vacía
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNombreUsuario("admin");
            admin.setContrasena(passwordEncoder.encode("Admin123*"));
            admin.setNombreCompleto("Administrador");
            admin.setRol(Rol.ADMIN);
            admin.setActivo(true);
            usuarioRepository.save(admin);
        }
    }
}

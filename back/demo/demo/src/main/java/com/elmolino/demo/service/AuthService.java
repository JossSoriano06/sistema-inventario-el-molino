package com.elmolino.demo.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.elmolino.demo.entity.Usuario;
import com.elmolino.demo.repository.UsuarioRepository;

@Service
public class AuthService {

    private static final String MENSAJE_ERROR =
            "Usuario o contraseña incorrectos";

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario autenticar(String nombreUsuario, String contrasena) {

        // Mismo mensaje para usuario inexistente, inactivo o clave incorrecta,
        // así no se revela qué usuarios existen
        Usuario usuario = usuarioRepository
                .findByNombreUsuario(nombreUsuario.trim())
                .orElseThrow(() -> new IllegalArgumentException(MENSAJE_ERROR));

        if (!usuario.getActivo()
                || !passwordEncoder.matches(contrasena, usuario.getContrasena())) {
            throw new IllegalArgumentException(MENSAJE_ERROR);
        }

        return usuario;
    }
}

package com.elmolino.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.elmolino.demo.dto.RespuestaLogin;
import com.elmolino.demo.dto.SolicitudLogin;
import com.elmolino.demo.entity.Usuario;
import com.elmolino.demo.service.AuthService;
import com.elmolino.demo.service.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody SolicitudLogin solicitud) {

        try {
            Usuario usuario = authService.autenticar(
                    solicitud.getNombreUsuario(),
                    solicitud.getContrasena());

            RespuestaLogin respuesta = new RespuestaLogin(
                    jwtService.generarToken(usuario),
                    usuario.getId(),
                    usuario.getNombreUsuario(),
                    usuario.getNombreCompleto(),
                    usuario.getRol().name());

            return ResponseEntity.ok(respuesta);

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", e.getMessage()));
        }
    }
}

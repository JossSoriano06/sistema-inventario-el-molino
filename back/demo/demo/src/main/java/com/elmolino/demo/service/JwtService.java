package com.elmolino.demo.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.elmolino.demo.entity.Usuario;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final long expiracionHoras;

    public JwtService(JwtEncoder jwtEncoder,
                      @Value("${jwt.expiracion-horas}") long expiracionHoras) {
        this.jwtEncoder = jwtEncoder;
        this.expiracionHoras = expiracionHoras;
    }

    public String generarToken(Usuario usuario) {
        Instant ahora = Instant.now();

        JwsHeader cabecera = JwsHeader.with(MacAlgorithm.HS256).build();

        JwtClaimsSet datos = JwtClaimsSet.builder()
                .subject(usuario.getNombreUsuario())
                .issuedAt(ahora)
                .expiresAt(ahora.plus(expiracionHoras, ChronoUnit.HOURS))
                .claim("rol", usuario.getRol().name())
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(cabecera, datos))
                .getTokenValue();
    }
}

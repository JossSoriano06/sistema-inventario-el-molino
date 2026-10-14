package com.elmolino.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
 
@Entity
@Table(name = "usuarios")
public class Usuario {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Column(name = "nombre_usuario", nullable = false, unique = true, length = 50)
    private String nombreUsuario;
 
    // Aquí se guarda el hash BCrypt
    @NotBlank(message = "La contraseña es obligatoria")
    @Column(nullable = false, length = 100)
    private String contrasena;
 
    @NotBlank(message = "El nombre completo es obligatorio")
    @Column(name = "nombre_completo", nullable = false, length = 100)
    private String nombreCompleto;
 
    @NotNull(message = "El rol es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;
 
    @Column(nullable = false)
    private Boolean activo = true;
 
    public Usuario() {
    }
 
    public Long getId() {
        return id;
    }
 
    public void setId(Long id) {
        this.id = id;
    }
 
    public String getNombreUsuario() {
        return nombreUsuario;
    }
 
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }
 
    public String getContrasena() {
        return contrasena;
    }
 
    public void setContrasena(String contrasena) {
        this.contrasena = contrasena;
    }
 
    public String getNombreCompleto() {
        return nombreCompleto;
    }
 
    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }
 
    public Rol getRol() {
        return rol;
    }
 
    public void setRol(Rol rol) {
        this.rol = rol;
    }
 
    public Boolean getActivo() {
        return activo;
    }
 
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}
 

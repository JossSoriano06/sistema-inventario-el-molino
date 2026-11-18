
package com.elmolino.demo.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoImagenService {

    private final Path directorioImagenes;

    public ProductoImagenService(
            @Value("${app.upload.dir:uploads/productos}")
            String directorio) {

        this.directorioImagenes = Paths.get(directorio)
                .toAbsolutePath()
                .normalize();
    }

    public String guardarImagen(MultipartFile archivo) {

        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes seleccionar una imagen."
            );
        }

        String tipo = archivo.getContentType();

        if (tipo == null ||
                !(tipo.equals("image/jpeg")
                || tipo.equals("image/png")
                || tipo.equals("image/webp"))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Solo se permiten imágenes JPG, PNG o WEBP."
            );
        }

        if (archivo.getSize() > 5 * 1024 * 1024) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La imagen no debe superar los 5 MB."
            );
        }

        String extension;

        switch (tipo) {
            case "image/jpeg":
                extension = ".jpg";
                break;
            case "image/png":
                extension = ".png";
                break;
            case "image/webp":
                extension = ".webp";
                break;
            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Formato de imagen no permitido."
                );
        }

        String nombreArchivo =
                UUID.randomUUID() + extension;

        try {

            Files.createDirectories(directorioImagenes);

            Path destino = directorioImagenes
                    .resolve(nombreArchivo)
                    .normalize();

            if (!destino.startsWith(directorioImagenes)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ruta de archivo no válida."
                );
            }

            Files.copy(
                    archivo.getInputStream(),
                    destino,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/uploads/productos/" + nombreArchivo;

        } catch (IOException e) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo guardar la imagen.",
                    e
            );
        }
    }

    public void eliminarImagen(String imagenUrl) {

        if (imagenUrl == null ||
                !imagenUrl.startsWith("/uploads/productos/")) {
            return;
        }

        String nombreArchivo = imagenUrl.substring(
                "/uploads/productos/".length()
        );

        // Evitar rutas manipuladas
        if (nombreArchivo.isBlank()
                || nombreArchivo.contains("/")
                || nombreArchivo.contains("\\")
                || nombreArchivo.equals(".")
                || nombreArchivo.equals("..")) {
            return;
        }

        try {

            Path archivo = directorioImagenes
                    .resolve(nombreArchivo)
                    .normalize();

            if (archivo.startsWith(directorioImagenes)) {
                Files.deleteIfExists(archivo);
            }

        } catch (IOException e) {

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "No se pudo eliminar la imagen anterior.",
                    e
            );
        }
    }
}

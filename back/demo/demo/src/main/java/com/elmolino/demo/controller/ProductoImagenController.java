
package com.elmolino.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.elmolino.demo.entity.Producto;
import com.elmolino.demo.repository.ProductoRepository;
import com.elmolino.demo.service.ProductoImagenService;

@RestController
@RequestMapping("/api/productos")
public class ProductoImagenController {

    private final ProductoRepository productoRepository;
    private final ProductoImagenService imagenService;

    public ProductoImagenController(
            ProductoRepository productoRepository,
            ProductoImagenService imagenService) {

        this.productoRepository = productoRepository;
        this.imagenService = imagenService;
    }

    @PostMapping(
        value = "/{id}/imagen",
        consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Transactional
    public ResponseEntity<?> subirImagen(
            @PathVariable Long id,
            @RequestParam("imagen") MultipartFile archivo) {

        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Producto no encontrado."
                ));

        // Guardar la nueva fotografía
        String nuevaImagen = imagenService.guardarImagen(archivo);

        // Conservar la ruta anterior para eliminarla después
        String imagenAnterior = producto.getImagenUrl();

        producto.setImagenUrl(nuevaImagen);

        Producto actualizado = productoRepository.save(producto);

        // Eliminar la imagen anterior si era local
        if (imagenAnterior != null &&
                !imagenAnterior.equals(nuevaImagen)) {
            imagenService.eliminarImagen(imagenAnterior);
        }

        return ResponseEntity.ok(Map.of(
                "mensaje", "Imagen actualizada correctamente.",
                "imagenUrl", actualizado.getImagenUrl(),
                "producto", actualizado
        ));
    }
}

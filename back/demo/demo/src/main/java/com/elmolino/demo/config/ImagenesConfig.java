
package com.elmolino.demo.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ImagenesConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        Path directorio = Paths.get("uploads/productos")
                .toAbsolutePath()
                .normalize();

        String ubicacion = directorio.toUri().toString();

        if (!ubicacion.endsWith("/")) {
            ubicacion += "/";
        }

        registry.addResourceHandler("/uploads/productos/**")
                .addResourceLocations(ubicacion);
    }
}

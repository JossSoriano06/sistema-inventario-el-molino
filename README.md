# Sistema de Inventario - Pastelería El Molino

Aplicación móvil para gestionar el inventario de una pastelería: catálogo de productos, control de stock e historial de movimientos, con inicio de sesión mediante JWT.
El proyecto está dividido en dos partes:
- Bakcend: API REST hecha con Java, Spring Boot, Spring Security, JPA/Hibernate y MySQL.
- front: app móvil (Android, iOS y Web) hecha con React Native, Expo y React Navigation.

## Funcionalidades

- Autenticación con usuario y contraseña, token JWT con vigencia de 8 horas y contraseñas cifradas con BCrypt.
- Sesión persistente: el token se guarda de forma segura con expo-secure-store y la app regresa al login si la sesión expira.
- Productos: listar, buscar por nombre o categoría, crear, editar y eliminar.
- Inventario: vista del stock actual con alerta de stock bajo.
- Movimientos de stock: registro de ENTRADA y SALIDA con motivo obligatorio. Se valida que no se retire más stock del disponible.
- Historial: registro de cada movimiento con filtro por tipo.
- Roles ADMIN y EMPLEADO incluidos en el token.

## Requisitos previos

- Java JDK 21
- MySQL 8 o superior
- Node.js (LTS) y npm
- Expo Go en el celular, o un emulador de Android / iOS
  
## Estructura del proyecto

sistema-inventario-el-molino/
├── back/demo/demo/                  Backend Spring Boot
│   └── src/elmolino/
│       ├── config/                  Seguridad, JWT y usuario inicial
│       ├── controller/              Auth, Productos, Inventario
│       ├── dto/                     Objetos de solicitud y respuesta
│       ├── entity/                  Producto, MovimientoInventario, Usuario, Rol
│       ├── repository/              Repositorios JPA
│       └── service/                 Lógica de negocio (Auth, Jwt, Inventario)
└── front/                           App Expo / React Native
    └── src/
        ├── components/
        ├── context/                 AuthContext (sesión)
        ├── navigation/              Stack y Tabs
        ├── screens/                 auth, productos, inventario
        └── services/                Cliente HTTP y servicios de la API

## Base de datos

Crea la base de datos en MySQL (las tablas las genera Hibernate automáticamente):

CREATE DATABASE pasteleria_el_molino


## Backend

Hay que editar el application.properties con los datos a usar osea cambiar la contraseña y la clave secreta, aunque al ser un proyecto educativo se mantendra:

spring.datasource.password=TU_CONTRASEÑA

jwt.secret=UNA_CLAVE_SECRETA_LARGA_Y_ALEATORIA

## API REST

Todas las rutas, excepto /api/auth/**, requieren el encabezado:

Authorization: Bearer <token>

### Autenticación

POST /api/auth/login: inicia sesión y devuelve el token JWT.

Solicitud:
{ "nombreUsuario": "admin", "contrasena": "Admin123*" }

Respuesta:
{ "token": "...", "id": 1, "nombreUsuario": "admin", "nombreCompleto": "Administrador", "rol": "ADMIN" }

### Productos

- GET /api/productos: lista todos los productos.
- GET /api/productos/{id}: obtiene un producto.
- POST /api/productos: crea un producto.
- PUT /api/productos/{id}: actualiza un producto.
- DELETE /api/productos/{id}: elimina un producto.

Validaciones: nombre y categoría obligatorios, precio mayor que 0 y stock no negativo.

### Inventario

- GET /api/inventario: historial completo, del más reciente al más antiguo.
- GET /api/inventario/producto/{id}: historial de un producto.
- POST /api/inventario: registra una entrada o salida de stock.

El campo tipo acepta ENTRADA o SALIDA. Si la salida supera el stock disponible, la API responde 400 con un mensaje de error.

## Modelo de datos

- usuarios: id, nombre_usuario (único), contrasena (BCrypt), nombre_completo, rol (ADMIN o EMPLEADO), activo.
- productos: id, nombre, categoria, precio, stock, imagen_url.
- movimientos_inventario: id, producto_id (clave foránea), tipo, cantidad, stock_anterior, stock_nuevo, motivo, fecha.

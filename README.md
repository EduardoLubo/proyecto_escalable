# Sistema de Gestión de Inventario

Este proyecto es una aplicación web para la gestión de inventarios que permite el control de materiales, movimientos entre ubicaciones, y el seguimiento de equipos serializados.

## Tecnologías utilizadas

- **Frontend**: React, HTML, CSS
- **Backend**: Node.js, Express
- **Base de datos**: MySQL
- **Autenticación**: JWT (JSON Web Tokens)

## Características

- Gestión de materiales con serialización opcional
- Control de stock por ubicación
- Movimientos de materiales entre almacenes
- Autenticación de usuarios con roles
- Seguimiento de equipos con número de serie
- Interfaz web intuitiva

## Instalación

1. Clonar el repositorio
2. Instalar dependencias del backend:
   ```bash
   npm install
   ```
3. Instalar dependencias del frontend (en la carpeta `frontend`):
   ```bash
   cd frontend && npm install
   ```
4. Configurar variables de entorno (crear archivo `.env`)
5. Iniciar el servidor backend:
   ```bash
   npm start
   ```
6. Iniciar el servidor frontend (en la carpeta `frontend`):
   ```bash
   npm run dev
   ```

## Variables de entorno

- `DB_HOST`: Host de la base de datos
- `DB_USER`: Usuario de la base de datos
- `DB_PASSWORD`: Contraseña de la base de datos
- `DB_NAME`: Nombre de la base de datos
- `JWT_SECRET`: Clave secreta para tokens JWT

## Estructura del proyecto

```
/workspace/
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   └── public/
└── README.md
```

## Rutas de la API

### Autenticación
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar nuevo usuario

### Materiales
- `GET /materiales` - Obtener todos los materiales
- `POST /materiales` - Crear un nuevo material
- `PUT /materiales/:id` - Actualizar un material
- `DELETE /materiales/:id` - Eliminar un material

### Stock
- `GET /stock` - Obtener stock por ubicación
- `POST /stock` - Agregar stock
- `PUT /stock/:id` - Actualizar stock
- `DELETE /stock/:id` - Eliminar stock

### Movimientos
- `GET /movimientos` - Obtener historial de movimientos
- `POST /movimientos` - Registrar nuevo movimiento
- `PUT /movimientos/:id` - Actualizar movimiento
- `DELETE /movimientos/:id` - Eliminar movimiento

### Almacenes
- `GET /almacenes` - Obtener todos los almacenes
- `POST /almacenes` - Crear un nuevo almacén
- `PUT /almacenes/:id` - Actualizar un almacén
- `DELETE /almacenes/:id` - Eliminar un almacén

### Usuarios
- `GET /usuarios` - Obtener todos los usuarios
- `POST /usuarios` - Crear un nuevo usuario
- `PUT /usuarios/:id` - Actualizar un usuario
- `DELETE /usuarios/:id` - Eliminar un usuario

### Equipos
- `GET /equipos` - Obtener todos los equipos
- `POST /equipos` - Crear un nuevo equipo
- `PUT /equipos/:id` - Actualizar un equipo
- `DELETE /equipos/:id` - Eliminar un equipo

## Modelo de base de datos

### Tablas principales

#### `materiales`
- `id_material` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `nombre` (VARCHAR(255))
- `descripcion` (TEXT)
- `categoria` (VARCHAR(100))
- `unidad_medida` (VARCHAR(50))
- `requiere_serial` (BOOLEAN)

#### `almacenes`
- `id_almacen` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `nombre` (VARCHAR(255))
- `ubicacion` (VARCHAR(255))
- `descripcion` (TEXT)

#### `stock`
- `id_stock` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `id_material` (INT, FOREIGN KEY -> materiales.id_material)
- `id_almacen` (INT, FOREIGN KEY -> almacenes.id_almacen)
- `cantidad` (INT)
- `fecha_actualizacion` (TIMESTAMP)

#### `movimientos`
- `id_movimiento` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `id_material` (INT, FOREIGN KEY -> materiales.id_material)
- `id_almacen_origen` (INT, FOREIGN KEY -> almacenes.id_almacen)
- `id_almacen_destino` (INT, FOREIGN KEY -> almacenes.id_almacen)
- `cantidad` (INT)
- `fecha_movimiento` (DATETIME)
- `id_usuario` (INT, FOREIGN KEY -> usuarios.id_usuario)

#### `usuarios`
- `id_usuario` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `nombre` (VARCHAR(255))
- `email` (VARCHAR(255), UNIQUE)
- `password` (VARCHAR(255))
- `rol` (VARCHAR(50))

#### `equipos`
- `id_equipo` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `id_material` (INT, FOREIGN KEY -> materiales.id_material)
- `numero_serie` (VARCHAR(255), UNIQUE)
- `id_almacen` (INT, FOREIGN KEY -> almacenes.id_almacen)
- `estado` (VARCHAR(50))
- `fecha_registro` (DATETIME)

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios antes de enviar un pull request.
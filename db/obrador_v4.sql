CREATE DATABASE obrador_v4;

USE obrador_v4;

-- Tablas

CREATE TABLE unidad_medida (
    unidad_medida_id INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(255) NOT NULL,
    simbolo VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE material (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    serializado BOOLEAN NOT NULL DEFAULT FALSE,
    unidad_medida_id INT,
    FOREIGN KEY (unidad_medida_id) REFERENCES unidad_medida(unidad_medida_id) ON DELETE SET NULL
);

CREATE TABLE tipo_usuario (
    tipo_usuario_id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('ADMINISTRADOR', 'USUARIO') NOT NULL
);

CREATE TABLE usuario (
    usuario_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,
    legajo VARCHAR(255) UNIQUE NOT NULL,
    tipo_usuario_id INT NOT NULL,
    FOREIGN KEY (tipo_usuario_id) REFERENCES tipo_usuario(tipo_usuario_id) ON DELETE CASCADE
);

CREATE TABLE cliente (
    cliente_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    exportado BOOLEAN NOT NULL DEFAULT FALSE,
    operarivo BOOLEAN NOT NULL DEFAULT FALSE,
);

CREATE TABLE usuario_cliente (
    usuario_cliente_id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    cliente_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE,
    UNIQUE (usuario_id, cliente_id)
);

CREATE TABLE proveedor (
    proveedor_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cliente_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE
);

CREATE TABLE deposito (
    deposito_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cliente_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE
);

CREATE TABLE obra (
    obra_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    pep VARCHAR(255),
    reserva VARCHAR(255),
    zona VARCHAR(255),
    cliente_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE
);

CREATE TABLE cuadrilla (
    cuadrilla_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo VARCHAR(255) UNIQUE NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    cliente_id INT NOT NULL,
    psmcuadrilla_id INT DEFAULT 0,
    exportado BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE
);

CREATE TABLE personal_cuadrilla (
    personal_cuadrilla_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    nombre VARCHAR(255) NOT NULL,
    legajo VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE cuadrilla_personal (
    cuadrilla_personal_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    rol ENUM('JEFE DE CUADRILLA', 'AYUDANTE') NOT NULL,
    cuadrilla_id INT NOT NULL,
    personal_cuadrilla_id INT,
    FOREIGN KEY (cuadrilla_id) REFERENCES cuadrilla(cuadrilla_id) ON DELETE CASCADE,
    FOREIGN KEY (personal_cuadrilla_id) REFERENCES personal_cuadrilla(personal_cuadrilla_id) ON DELETE SET NULL
);

CREATE TABLE ubicacion (
    ubicacion_id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('PROVEEDOR', 'DEPOSITO', 'OBRA') NOT NULL,
    proveedor_id INT NULL,
    deposito_id INT NULL,
    obra_id INT NULL,
    FOREIGN KEY (proveedor_id) REFERENCES proveedor(proveedor_id) ON DELETE CASCADE,
    FOREIGN KEY (deposito_id) REFERENCES deposito(deposito_id) ON DELETE CASCADE,
    FOREIGN KEY (obra_id) REFERENCES obra(obra_id) ON DELETE CASCADE
);

CREATE TABLE stock (
    stock_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT NOT NULL,
    cantidad DECIMAL(10, 2) NOT NULL,
    cuadrilla_id INT,
    ubicacion_id INT NOT NULL,
    cliente_id INT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES material(material_id) ON DELETE CASCADE,
    FOREIGN KEY (cuadrilla_id) REFERENCES cuadrilla(cuadrilla_id) ON DELETE SET NULL,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(ubicacion_id) ON DELETE CASCADE,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE,
    UNIQUE (material_id, ubicacion_id, cuadrilla_id)
);

CREATE TABLE tipo_movimiento (
    tipo_movimiento_id INT PRIMARY KEY AUTO_INCREMENT,
    tipo ENUM('ENTRADA', 'SALIDA', 'DEVOLUCION') NOT NULL,
    descripcion VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE movimiento (
    movimiento_id INT PRIMARY KEY AUTO_INCREMENT,
    descripcion VARCHAR(255),
    desde_ubicacion_id INT,
    hacia_ubicacion_id INT,
    reserva VARCHAR(255),
    desde_cuadrilla_id INT,
    hacia_cuadrilla_id INT,
    tipo_movimiento_id INT,
    cliente_id INT NOT NULL,
    auditoria_usuario_id INT,    
    auditoria_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exportado BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipo_movimiento(tipo_movimiento_id) ON DELETE SET NULL,
    FOREIGN KEY (auditoria_usuario_id) REFERENCES usuario(usuario_id) ON DELETE SET NULL,
    FOREIGN KEY (desde_ubicacion_id) REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    FOREIGN KEY (hacia_ubicacion_id) REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    FOREIGN KEY (desde_cuadrilla_id) REFERENCES cuadrilla(cuadrilla_id) ON DELETE SET NULL,
    FOREIGN KEY (hacia_cuadrilla_id) REFERENCES cuadrilla(cuadrilla_id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE
);

CREATE TABLE movimiento_detalle (
    movimiento_detalle_id INT PRIMARY KEY AUTO_INCREMENT,
    material_id INT,
    cantidad DECIMAL(10, 2) NOT NULL,
    movimiento_id INT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES material(material_id) ON DELETE SET NULL,
    FOREIGN KEY (movimiento_id) REFERENCES movimiento(movimiento_id) ON DELETE CASCADE
);

-- Serializados

CREATE TABLE material_serial (
    material_serial_id INT PRIMARY KEY AUTO_INCREMENT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    material_id INT NOT NULL,
    serie VARCHAR(255) NOT NULL,
    estado ENUM('DISPONIBLE','ASIGNADO', 'INSTALADO', 'BAJA') NOT NULL DEFAULT 'DISPONIBLE',
    ubicacion_id INT,
    cuadrilla_id INT,
    cliente_id INT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES material(material_id) ON DELETE CASCADE,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    FOREIGN KEY (cuadrilla_id) REFERENCES cuadrilla(cuadrilla_id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE,
    UNIQUE (material_id, serie, cliente_id)
);

CREATE TABLE movimiento_detalle_serial (
    movimiento_detalle_serial_id INT PRIMARY KEY AUTO_INCREMENT,
    movimiento_detalle_id INT NOT NULL,
    material_serial_id INT NOT NULL,
    FOREIGN KEY (movimiento_detalle_id) REFERENCES movimiento_detalle(movimiento_detalle_id) ON DELETE CASCADE,
    FOREIGN KEY (material_serial_id) REFERENCES material_serial(material_serial_id) ON DELETE CASCADE,
    UNIQUE (movimiento_detalle_id, material_serial_id)
);

CREATE TABLE material_serial_estado_historico (
    material_serial_estado_historico_id INT PRIMARY KEY AUTO_INCREMENT,
    material_serial_id INT NOT NULL,
    estado ENUM('DISPONIBLE','ASIGNADO', 'INSTALADO', 'BAJA') NOT NULL DEFAULT 'DISPONIBLE',
    ubicacion_id INT,
    cuadrilla_id INT,
    tipo_movimiento_id INT,
    cliente_id INT NOT NULL,
    auditoria_usuario_id INT,
    auditoria_alta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_serial_id) REFERENCES material_serial(material_serial_id) ON DELETE CASCADE,
    FOREIGN KEY (ubicacion_id) REFERENCES ubicacion(ubicacion_id) ON DELETE SET NULL,
    FOREIGN KEY (cuadrilla_id) REFERENCES cuadrilla(cuadrilla_id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_movimiento_id) REFERENCES tipo_movimiento(tipo_movimiento_id) ON DELETE SET NULL,
    FOREIGN KEY (auditoria_usuario_id) REFERENCES usuario(usuario_id) ON DELETE SET NULL,
    FOREIGN KEY (cliente_id) REFERENCES cliente(cliente_id) ON DELETE CASCADE
);

-- Indices

CREATE INDEX idx_material_codigo ON material (codigo);
CREATE INDEX idx_material_descripcion ON material (descripcion);
CREATE INDEX idx_movimiento_movimiento_id ON movimiento (movimiento_id);
CREATE INDEX idx_movimiento_usuario ON movimiento (auditoria_usuario_id);
CREATE INDEX idx_movimiento_reserva ON movimiento (reserva);
CREATE INDEX idx_movimiento_detalle_movimiento ON movimiento_detalle (movimiento_id);
CREATE INDEX idx_usuario_email ON usuario (email);
CREATE INDEX idx_ubicacion ON ubicacion (tipo, proveedor_id, deposito_id, obra_id);
CREATE INDEX idx_obra_pep ON obra (pep);
CREATE INDEX idx_obra_reserva ON obra (reserva);
CREATE INDEX idx_stock ON stock (material_id, ubicacion_id, cuadrilla_id);
CREATE INDEX idx_stock_cliente ON stock (cliente_id);
CREATE INDEX idx_movimiento_cliente ON movimiento (cliente_id);
CREATE INDEX idx_deposito_cliente ON deposito(cliente_id);
CREATE INDEX idx_proveedor_cliente ON proveedor (cliente_id);
CREATE INDEX idx_cuadrilla_cliente ON cuadrilla (cliente_id);
CREATE INDEX idx_material_serial_numero ON material_serial (serie);
CREATE INDEX idx_material_serial_estado ON material_serial (estado);
CREATE INDEX idx_material_serial_cliente ON material_serial (cliente_id);
CREATE INDEX idx_material_serial_historial ON material_serial_estado_historico (material_serial_id);

-- Incerts

INSERT INTO tipo_usuario (tipo) VALUES 
('ADMINISTRADOR'), 
('USUARIO');

INSERT INTO tipo_movimiento (tipo, descripcion) VALUES
('ENTRADA', 'INGRESO DE PROVEEDOR'),
('ENTRADA', 'DEVOLUCIONES DE OBRA'),
('SALIDA', 'ENVIOS A OBRA'),
('SALIDA', 'CONSUMO EN OBRA'),
('SALIDA', 'TRASLADO ENTRE OBRAS'),
('SALIDA', 'TRASLADO ENTRE DEPOSITOS'),
('SALIDA', 'TRASLADO ENTRE CUADRILLAS'),
('DEVOLUCION', 'DEVOLUCIONES A PROVEEDOR');
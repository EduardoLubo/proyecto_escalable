const db = require('../database/models/index');
const Usuario_cliente = db.usuario_cliente;

const customer_load_middleware = async (req, res, next) => {
    try {        
        const usuario = req.usuario;

        if (!usuario) {
            return res.status(401).json({
                status: "error",
                message: "Usuario no autenticado"
            });
        }

        // Si es ADMINISTRADOR → todos los clientes
        if (usuario.tipo_usuario === "ADMINISTRADOR") {
            req.clientesIds = null; // null significa sin restricción
            return next();
        }

        // Si es USUARIO → buscar clientes asociados
        const relaciones = await Usuario_cliente.findAll({
            where: { usuario_id: usuario.usuario_id },
            attributes: ['cliente_id']
        });

        req.clientesIds = relaciones.map(r => r.cliente_id);

        if (req.clientesIds.length === 0) {
            return res.status(403).json({
                status: "error",
                message: "No tienes clientes asignados."
            });
        }

        next();
        
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};

module.exports = customer_load_middleware;

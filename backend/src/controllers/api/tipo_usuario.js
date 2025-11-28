const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Tipo_usuario = db.tipo_usuario;

const api_tipo_usuario_controller = {

    get_all: async (req, res) => {
        try {
            const { count, rows: tipo_usuarios } = await Tipo_usuario.findAndCountAll({
                order: [['tipo', 'ASC']],
            });
            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron tipos de usuario.",
                total_count: count,
                data: tipo_usuarios
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};


module.exports = api_tipo_usuario_controller;
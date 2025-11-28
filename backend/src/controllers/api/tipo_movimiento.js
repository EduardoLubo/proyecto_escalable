const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Tipo_movimiento = db.tipo_movimiento;

const api_tipo_movimiento_controller = {

    get_all: async (req, res) => {
        try {

            let { tipo } = req.query;

            const tipo_movimiento_where_conditions = {};

            if (tipo) {
                tipo_movimiento_where_conditions.tipo = { [Op.like]: `%${tipo.trim().toUpperCase()}%` };
            }

            const { count, rows: tipo_movimientos } = await Tipo_movimiento.findAndCountAll({
                where: tipo_movimiento_where_conditions,
                order: [['tipo', 'ASC']],
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron tipos de movimiento.",
                total_count: count,
                data: tipo_movimientos
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};


module.exports = api_tipo_movimiento_controller;
const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Movimiento_detalle = db.movimiento_detalle;

const api_stock_control_controller = {

    get_all: async (req, res) => {
        try {
            let { codigo, cliente, fechaDesde, fechaHasta, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const stock_control_where_conditions = {};

            const offset = (page - 1) * limit;

            const fechaFiltro = {};

            if (fechaDesde) {
                const [year, month, day] = fechaDesde.split("-").map(Number);
                fechaFiltro[Op.gte] = new Date(year, month - 1, day);
            }

            if (fechaHasta) {
                const [year, month, day] = fechaHasta.split("-").map(Number);
                fechaFiltro[Op.lt] = new Date(year, month - 1, day + 1);
            }

            if (fechaDesde || fechaHasta) {
                stock_control_where_conditions.auditoria_alta = fechaFiltro;
            }

            if (req.clientesIds) {
                stock_control_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { rows: stocks, count } = await Movimiento_detalle.findAndCountAll({
                include: [
                    {
                        association: 'movimiento',
                        where: stock_control_where_conditions,
                        include: [
                            {
                                association: 'tipo_movimiento'
                            },
                            {
                                association: 'cliente',
                                attributes: ['codigo', 'descripcion'],
                                where: cliente ? { cliente_id: cliente } : undefined
                            },
                            {
                                association: 'usuario',
                                attributes: ['nombre', 'legajo']
                            },
                            {
                                association: 'desde_ubicacion'
                            },
                            {
                                association: 'desde_cuadrilla'
                            },
                            {
                                association: 'hacia_ubicacion'
                            },
                            {
                                association: 'hacia_cuadrilla'
                            }
                        ]
                    },
                    {
                        association: 'material',
                        where: codigo ? { codigo: codigo } : undefined
                    },
                    {
                        association: 'movimiento_detalle_serial',
                        include: [
                            {
                                association: 'material'
                            }
                        ]
                    }
                ],
                // order: [
                //     [{ model: db.movimiento, as: 'movimiento' }, 'auditoria_alta', 'DESC']
                // ],
                order: [['movimiento', 'auditoria_alta', 'DESC']],
                ...(getAll ? {} : { limit, offset })
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron movimientos.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: stocks
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};

module.exports = api_stock_control_controller;
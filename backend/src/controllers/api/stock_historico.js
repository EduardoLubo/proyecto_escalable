const db = require('../../database/models/index');
const { Op, where } = require('sequelize');
const Stock_historico = db.material_serial_estado_historico;

const api_stock_historical_controller = {

    get_all: async (req, res) => {
        try {
            let { serie, cliente, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const stock_historico_where_conditions = {};

            const offset = (page - 1) * limit;

            if (req.clientesIds) {
                stock_historico_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { rows: stocks, count } = await Stock_historico.findAndCountAll({
                where: stock_historico_where_conditions,
                include: [
                    {
                        association: 'material_serial',
                        attributes: ['serie', 'cliente_id'],
                        where: serie ? { serie: serie.trim().toUpperCase() } : undefined,
                        include: [
                            {
                                association: 'cliente',
                                attributes: ['cliente_id', 'descripcion'],
                                where: cliente ? { cliente_id: cliente } : undefined
                            },
                            {
                                association: 'material',
                                attributes: ['codigo', 'descripcion']
                            }
                        ]
                    },
                    {
                        association: 'usuario',
                        attributes: ['nombre']
                    },
                    {
                        association: 'ubicacion',
                        attributes: ['tipo']
                    },
                    {
                        association: 'cuadrilla',
                        attributes: ['descripcion']
                    },
                    {
                        association: 'tipo_movimiento',
                        attributes: ['descripcion']
                    }
                ],
                order: [['auditoria_alta', 'DESC']],
                ...(getAll ? {} : { limit, offset })
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron stocks historicos.",
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

module.exports = api_stock_historical_controller;
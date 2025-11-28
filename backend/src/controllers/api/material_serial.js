const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Material_serial = db.material_serial;

const api_material_serial_controller = {

    get_all: async (req, res) => {
        try {
            let { codigo, serie, descripcion, cliente, estado, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const material_serial_where_conditions = {};

            const material_serial_association_where_conditions = {};

            const offset = (page - 1) * limit;

            if (serie) {
                material_serial_where_conditions.serie = serie.trim().toUpperCase();
            }
            if (estado) {
                material_serial_where_conditions.estado = estado.trim().toUpperCase();
            }
            if (codigo) {
                material_serial_association_where_conditions.codigo = codigo.trim().toUpperCase();
            }
            if (descripcion) {
                material_serial_association_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (req.clientesIds) {
                material_serial_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: materials } = await Material_serial.findAndCountAll({
                where: material_serial_where_conditions,
                include: [
                    {
                        association: 'material',
                        attributes: ['codigo', 'descripcion'],
                        where: material_serial_association_where_conditions
                    },
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'codigo', 'descripcion'],
                        where: cliente ? { cliente_id: cliente } : undefined
                    },
                    {
                        association: 'ubicacion',
                        attributes: ['tipo', 'ubicacion_id']
                    }
                ],
                ...(getAll ? {} : { limit, offset })
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron materiales serializados.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: materials
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};

module.exports = api_material_serial_controller;
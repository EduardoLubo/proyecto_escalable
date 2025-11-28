const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Cliente = db.cliente;

//EJEMPLO DE SOLICITUD POST

/*{
    "codigo": "C-EDE",
    "descripcion": "EDENOR"
}*/

const api_cliente_controller = {

    get_all: async (req, res) => {
        try {

            let { codigo, descripcion, activo, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const cliente_where_conditions = {};

            const offset = (page - 1) * limit;

            if (codigo) {
                cliente_where_conditions.codigo = { [Op.like]: `%${codigo.trim().toUpperCase()}%` };
            }
            if (descripcion) {
                cliente_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (activo) {
                cliente_where_conditions.activo = true;
            }
            if (req.clientesIds) {
                cliente_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: clientes } = await Cliente.findAndCountAll({
                where: cliente_where_conditions,
                order: [['codigo', 'ASC']],
                ...(getAll ? {} : { limit, offset }),
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron clientes.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: clientes
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    get_by_id: async (req, res) => {
        try {
            const cliente = await Cliente.findByPk(req.params.id);
            if (cliente) {
                return res.status(200).json({
                    status: "success",
                    message: "Cliente encontrado.",
                    data: cliente
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Cliente no encontrado."
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    create: async (req, res) => {

        const codigo = req.body.codigo.toUpperCase();

        try {
            if (!codigo) {
                return res.status(400).json({
                    status: "error",
                    message: "El código es requerido."
                });
            }
            const check_cliente = await Cliente.findOne({
                where: { codigo: codigo }
            });
            if (check_cliente) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un cliente con el mismo codigo."
                });
            }
            await Cliente.create(req.body);
            return res.status(201).json({
                status: "success",
                message: "Cliente creado correctamente."
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    update: async (req, res) => {

        const codigo = req.body.codigo.toUpperCase();

        try {
            const cliente = await Cliente.findByPk(req.params.id);
            if (!cliente) {
                return res.status(404).json({
                    status: "error",
                    message: 'Cliente no encontrado.'
                });
            }

            const datos_actuales = cliente.toJSON();
            const datos_enviados = req.body;

            // Convertir a mayúsculas solo las propiedades que sean strings
            const datos_enviados_convierte_mayuscula_solo_stings = Object.fromEntries(
                Object.entries(datos_enviados).map(([key, value]) => [
                    key,
                    typeof value === "string" ? value.toUpperCase() : value
                ])
            );

            // Comparar ignorando diferencias de mayúsculas
            const cambios = Object.keys(datos_enviados_convierte_mayuscula_solo_stings).some(
                (key) => datos_actuales[key] !== datos_enviados_convierte_mayuscula_solo_stings[key]
            );

            if (!cambios) {
                return res.status(400).json({
                    status: "error",
                    message: "No se realizaron cambios en los registros."
                });
            }

            const check_cliente = await Cliente.findOne({
                where: {
                    codigo: codigo,
                    cliente_id: { [Op.ne]: cliente.cliente_id }
                }
            });

            if (check_cliente) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un cliente con el mismo codigo."
                });
            }

            cliente.set(req.body);
            await cliente.save();

            return res.status(200).json({
                status: "success",
                message: "Cliente actualizado correctamente."
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    delete: async (req, res) => {
        try {
            const deleted = await Cliente.destroy({
                where: { cliente_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Cliente no encontrado.'
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};


module.exports = api_cliente_controller;
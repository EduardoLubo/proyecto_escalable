const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Deposito = db.deposito;
const Ubicacion = db.ubicacion;

//EJEMPLO DE SOLICITUD POST

/*{
    "codigo": "EMA-01",
    "descripcion": "DEPOSITO CENTRAL"
}*/

const api_deposito_controller = {

    get_all: async (req, res) => {
        try {

            let { codigo, descripcion, activo, cliente, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const deposito_where_conditions = {};

            const offset = (page - 1) * limit;

            if (codigo) {
                deposito_where_conditions.codigo = { [Op.like]: `%${codigo.trim().toUpperCase()}%` };
            }
            if (descripcion) {
                deposito_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (activo) {
                deposito_where_conditions.activo = true;
            }
            if (req.clientesIds) {
                deposito_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: deposito } = await Deposito.findAndCountAll({
                where: deposito_where_conditions,
                include: [
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'descripcion'],
                        where: cliente ? { cliente_id: cliente } : undefined
                    },
                    {
                        association: 'ubicacion',
                        attributes: ['ubicacion_id', 'tipo', 'deposito_id'],
                    }
                ],
                order: [['codigo', 'ASC']],
                ...(getAll ? {} : { limit, offset }),
                distinct: true, // Asegura que se cuenten solo las filas de la tabla principal
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron depositos.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: deposito
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
            const deposito = await Deposito.findByPk(req.params.id, {
                include: [
                    {
                        association: 'ubicacion',
                        attributes: ['ubicacion_id', 'tipo', 'deposito_id'],
                    }
                ]
            });
            if (deposito) {
                return res.status(200).json({
                    status: "success",
                    message: "Deposito encontrado.",
                    data: deposito
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Deposito no encontrado."
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
            const check_deposito = await Deposito.findOne({
                where: { codigo: codigo }
            });
            if (check_deposito) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un deposito con el mismo codigo."
                });
            }

            const deposito = await Deposito.create(req.body);
            // Crear la ubicación asociada al depósito
            await Ubicacion.create({
                tipo: "DEPOSITO",
                deposito_id: deposito.deposito_id // Asociar la ubicación al depósito recién creado
            });

            return res.status(201).json({
                status: "success",
                message: "Deposito creado correctamente."
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
            const deposito = await Deposito.findByPk(req.params.id);
            if (!deposito) {
                return res.status(404).json({
                    status: "error",
                    message: 'Deposito no encontrado.'
                });
            }

            const datos_actuales = deposito.toJSON();
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

            const check_deposito = await Deposito.findOne({
                where: {
                    codigo: codigo,
                    deposito_id: { [Op.ne]: deposito.deposito_id }
                }
            });

            if (check_deposito) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un deposito con el mismo codigo."
                });
            }

            deposito.set(req.body);
            await deposito.save();

            return res.status(200).json({
                status: "success",
                message: "Deposito actualizado correctamente."
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
            const deleted = await Deposito.destroy({
                where: { deposito_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Deposito no encontrado.'
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


module.exports = api_deposito_controller;
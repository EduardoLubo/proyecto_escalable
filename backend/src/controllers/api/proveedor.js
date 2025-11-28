const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Proveedor = db.proveedor;
const Ubicacion = db.ubicacion;

//EJEMPLO DE SOLICITUD POST

/*{
    "codigo": "P-EDE",
    "descripcion": "EDENOR"
}*/

const api_proveedor_controller = {

    get_all: async (req, res) => {
        try {

            let { codigo, descripcion, activo, cliente, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const proveedor_where_conditions = {};

            const offset = (page - 1) * limit;

            if (codigo) {
                proveedor_where_conditions.codigo = { [Op.like]: `%${codigo.trim().toUpperCase()}%` };
            }
            if (descripcion) {
                proveedor_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (activo) {
                proveedor_where_conditions.activo = true;
            }
            if (req.clientesIds) {
                proveedor_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: proveedor } = await Proveedor.findAndCountAll({
                where: proveedor_where_conditions,
                include: [
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'descripcion'],
                        where: cliente ? { cliente_id: cliente } : undefined
                    },
                    {
                        association: 'ubicacion',
                        attributes: ['ubicacion_id', 'tipo', 'proveedor_id'],
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
                    : "No se encontraron proveedores.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: proveedor
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
            const proveedor = await Proveedor.findByPk(req.params.id, {
                include: [
                    {
                        association: 'ubicacion',
                        attributes: ['ubicacion_id', 'tipo', 'proveedor_id'],
                    }
                ]
            });
            if (proveedor) {
                return res.status(200).json({
                    status: "success",
                    message: "Proveedor encontrado.",
                    data: proveedor
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Proveedor no encontrado."
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
            const check_proveedor = await Proveedor.findOne({
                where: { codigo: codigo }
            });
            if (check_proveedor) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un proveedor con el mismo codigo."
                });
            }
            const proveedor = await Proveedor.create(req.body);
            // Crear la ubicación asociada al proveedor
            await Ubicacion.create({
                tipo: "PROVEEDOR",
                proveedor_id: proveedor.proveedor_id // Asociar la ubicación al proveedor recién creado
            });

            return res.status(201).json({
                status: "success",
                message: "Proveedor creado correctamente."
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
            const proveedor = await Proveedor.findByPk(req.params.id);
            if (!proveedor) {
                return res.status(404).json({
                    status: "error",
                    message: 'Proveedor no encontrado.'
                });
            }

            const datos_actuales = proveedor.toJSON();
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

            const check_proveedor = await Proveedor.findOne({
                where: {
                    codigo: codigo,
                    proveedor_id: { [Op.ne]: proveedor.proveedor_id }
                }
            });

            if (check_proveedor) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un proveedor con el mismo codigo."
                });
            }

            proveedor.set(req.body);
            await proveedor.save();

            return res.status(200).json({
                status: "success",
                message: "Proveedor actualizado correctamente."
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
            const deleted = await Proveedor.destroy({
                where: { proveedor_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Proveedor no encontrado.'
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


module.exports = api_proveedor_controller;
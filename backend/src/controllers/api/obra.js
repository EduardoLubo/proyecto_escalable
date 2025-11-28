const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Obra = db.obra;
const Ubicacion = db.ubicacion;

//EJEMPLO DE SOLICITUD POST

/*{
    "codigo": "O-001",
    "descripcion": "OBRA NORDELTA",
    "pep": "123456",
    "reserva": "123456",
    "zona": "ZONA NORTE",
    "cliente_id": 1
}*/

const api_obra_controller = {

    get_all: async (req, res) => {
        try {

            let { codigo, descripcion, pep, reserva, cliente, getAll, activo, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const obra_where_conditions = {};

            const offset = (page - 1) * limit;

            if (codigo) {
                obra_where_conditions.codigo = { [Op.like]: `%${codigo.trim().toUpperCase()}%` };
            }
            if (descripcion) {
                obra_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (pep) {
                obra_where_conditions.pep = { [Op.like]: `%${pep.trim().toUpperCase()}%` };
            }
            if (reserva) {
                obra_where_conditions.reserva = { [Op.like]: `%${reserva.trim().toUpperCase()}%` };
            }
            if (activo) {
                obra_where_conditions.activo = true;
            }
            if (req.clientesIds) {
                obra_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: obras } = await Obra.findAndCountAll({
                where: obra_where_conditions,
                include: [
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'descripcion'],
                        where: cliente ? { cliente_id: cliente } : undefined
                    },
                    {
                        association: 'ubicacion',
                        attributes: ['ubicacion_id', 'tipo', 'obra_id'],
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
                    : "No se encontraron obras.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: obras
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
            const obra = await Obra.findByPk(req.params.id, {
                include: [
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'descripcion']
                    },
                    {
                        association: 'ubicacion',
                        attributes: ['ubicacion_id', 'tipo', 'obra_id'],
                    }
                ]
            });
            if (obra) {
                return res.status(200).json({
                    status: "success",
                    message: "Obra encontrada.",
                    data: obra
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Obra no encontrada."
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
            const check_obra = await Obra.findOne({
                where: { codigo: codigo }
            });
            if (check_obra) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe una obra con el mismo codigo."
                });
            }
            const obra = await Obra.create(req.body);
            // Crear la ubicación asociada a la obra
            await Ubicacion.create({
                tipo: "OBRA",
                obra_id: obra.obra_id // Asociar la ubicación a la obra recién creada
            });
            return res.status(201).json({
                status: "success",
                message: "Obra creada correctamente."
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
            const obra = await Obra.findByPk(req.params.id);
            if (!obra) {
                return res.status(404).json({
                    status: "error",
                    message: 'Obra no encontrada.'
                });
            }
            const datos_actuales = obra.toJSON();
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

            const check_obra = await Obra.findOne({
                where: {
                    codigo: codigo,
                    obra_id: { [Op.ne]: obra.obra_id }
                }
            });

            if (check_obra) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe una obra con el mismo codigo."
                });
            }

            obra.set(req.body);
            await obra.save();

            return res.status(200).json({
                status: "success",
                message: "Obra actualizada correctamente."
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
            const deleted = await Obra.destroy({
                where: { obra_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Obra no encontrada.'
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


module.exports = api_obra_controller;
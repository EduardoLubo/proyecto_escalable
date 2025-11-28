const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Material = db.material;
const Material_serial = db.material_serial;
const Stock = db.stock;

//EJEMPLO DE SOLICITUD POST

/*{
    "codigo": "2001",
    "descripcion": "medidor 3000kw",
    "unidad_medida_id": 1
}*/

const api_material_controller = {

    get_all: async (req, res) => {
        try {

            let { codigo, descripcion, activo, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const material_where_conditions = {};

            if (codigo) {
                material_where_conditions.codigo = codigo.trim().toUpperCase();
            }
            if (descripcion) {
                material_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (activo) {
                material_where_conditions.activo = true;
            }

            const offset = (page - 1) * limit;

            const { count, rows: materiales } = await Material.findAndCountAll({
                where: material_where_conditions,
                include: [
                    {
                        association: 'unidad_medida',
                        attributes: ['descripcion', 'simbolo']
                    }
                ],
                order: [['codigo', 'ASC']],
                limit,
                offset,
                distinct: true, // Asegura que se cuenten solo las filas de la tabla principal
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron materiales.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: materiales
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
            const material = await Material.findByPk(req.params.id, {
                include: [
                    {
                        association: 'unidad_medida',
                        attributes: ['descripcion', 'simbolo']
                    }
                ]
            });
            if (material) {
                return res.status(200).json({
                    status: "success",
                    message: "Material encontrado.",
                    data: material
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Material no encontrado."
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

        try {
            const check_codigo = await Material.findOne({ where: { codigo: req.body.codigo } });
            if (check_codigo) {
                return res.status(400).json({
                    status: "error",
                    message: "El codigo ya está registrado."
                });
            };

            await Material.create(req.body);

            return res.status(201).json({
                status: "success",
                message: "Material creado correctamente."
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
            const material = await Material.findByPk(req.params.id);
            if (!material) {
                return res.status(404).json({
                    status: "error",
                    message: 'Material no encontrado.'
                });
            }

            const datos_actuales = material.toJSON();
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


            // De no serializado a serializado si hay stock no se peude
            if (!material.serializado && req.body.serializado) {
                const stockExistente = await Stock.findOne({
                    where: {
                        material_id: material.material_id,
                        cantidad: { [Op.gt]: 0 }
                    }
                });
                if (stockExistente) {
                    return res.status(400).json({
                        status: "error",
                        message: "No se puede serializar un material con stock existente."
                    });
                }
            }

            // De serializado a no serializado se borran todos los registros asociados
            if (material.serializado && !req.body.serializado) {
                // Eliminar registros relacionados
                await Material_serial.destroy({
                    where: {
                        material_id: material.material_id
                    }
                });
            }

            const check_material = await Material.findOne({
                where: {
                    codigo: codigo,
                    material_id: { [Op.ne]: material.material_id }
                }
            });

            if (check_material) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe un material con el mismo codigo."
                });
            }

            material.set(req.body);
            await material.save();

            return res.status(200).json({
                status: "success",
                message: "Material actualizado correctamente."
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
            const deleted = await Material.destroy({
                where: { material_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Material no encontrado.'
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

module.exports = api_material_controller;
const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Unidad_medida = db.unidad_medida;

const api_unidad_medida_controller = {

    get_all: async (req, res) => {
        try {

            let { simbolo, descripcion, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const unidad_medida_where_conditions = {};

            const offset = (page - 1) * limit;

            if (simbolo) {
                unidad_medida_where_conditions.simbolo = { [Op.like]: `%${simbolo.trim().toUpperCase()}%` };
            }

            if (descripcion) {
                unidad_medida_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }

            const { count, rows: unidades } = await Unidad_medida.findAndCountAll({
                where: unidad_medida_where_conditions,
                order: [['descripcion', 'ASC']],
                ...(getAll ? {} : { limit, offset })
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron unidades de medida.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: unidades
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
            const unidad = await Unidad_medida.findByPk(req.params.id);
            if (unidad) {
                return res.status(200).json({
                    status: "success",
                    message: "Unidad de medida encontrada.",
                    data: unidad
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Unidad de medida no encontrada."
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

        const simbolo = req.body.simbolo.toUpperCase();

        try {
            if (!simbolo) {
                return res.status(400).json({
                    status: "error",
                    message: "El simbolo es requerido."
                });
            }
            const check_unidad = await Unidad_medida.findOne({
                where: { simbolo: simbolo }
            });
            if (check_unidad) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe unidad de medida con el mismo simbolo."
                });
            }
            await Unidad_medida.create(req.body);
            return res.status(201).json({
                status: "success",
                message: "Unidad de medida creada correctamente."
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    update: async (req, res) => {

        const simbolo = req.body.simbolo.toUpperCase();

        try {
            const unidad = await Unidad_medida.findByPk(req.params.id);
            if (!unidad) {
                return res.status(404).json({
                    status: "error",
                    message: 'Unidad de medida no encontrada.'
                });
            }

            const datos_actuales = unidad.toJSON();
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

            const check_unidad = await Unidad_medida.findOne({
                where: {
                    simbolo: simbolo,
                    unidad_medida_id: { [Op.ne]: unidad.unidad_medida_id }
                }
            });

            if (check_unidad) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe unidad de medida con el mismo simbolo."
                });
            }

            unidad.set(req.body);
            await unidad.save();

            return res.status(200).json({
                status: "success",
                message: "Unidad de medida actualizada correctamente."
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
            const deleted = await Unidad_medida.destroy({
                where: { unidad_medida_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Unidad de medida no encontrada.'
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


module.exports = api_unidad_medida_controller;
const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Personal_cuadrilla = db.personal_cuadrilla;

//EJEMPLO DE SOLICITUD POST

/*{
    "nombre": "PEREZ. Juan",
    "legajo": "1111"
}*/

const api_personal_cuadrilla_controller = {

    get_all: async (req, res) => {
        try {
            let { nombre, legajo, getAll, activo, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const personal_cuadrilla_where_conditions = {};

            const offset = (page - 1) * limit;

            if (nombre) {
                personal_cuadrilla_where_conditions.nombre = { [Op.like]: `%${nombre.trim().toUpperCase()}%` };
            }
            if (legajo) {
                personal_cuadrilla_where_conditions.legajo = { [Op.like]: `%${legajo.trim().toUpperCase()}%` };
            }
            if (activo) {
                personal_cuadrilla_where_conditions.activo = true;
            }

            const { count, rows: personal } = await Personal_cuadrilla.findAndCountAll({
                where: personal_cuadrilla_where_conditions,
                order: [['nombre', 'ASC']],
                ...(getAll ? {} : { limit, offset }),
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron cuadrilleros.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: personal
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
            const personal = await Personal_cuadrilla.findByPk(req.params.id);
            if (personal) {
                return res.status(200).json({
                    status: "success",
                    message: "Cuadrillero encontrado.",
                    data: personal
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Cuadrillero no encontrado."
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

        const legajo = req.body.legajo.toUpperCase();

        try {
            if (!legajo) {
                return res.status(400).json({
                    status: "error",
                    message: "El legajo es requerido."
                });
            }
            const check_personal = await Personal_cuadrilla.findOne({
                where: { legajo: legajo }
            });
            if (check_personal) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe cuadrillero con el mismo legajo."
                });
            }
            await Personal_cuadrilla.create(req.body);
            return res.status(201).json({
                status: "success",
                message: "Cuadrillero creado correctamente."
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    update: async (req, res) => {

        const legajo = req.body.legajo.toUpperCase();

        try {
            const personal = await Personal_cuadrilla.findByPk(req.params.id);
            if (!personal) {
                return res.status(404).json({
                    status: "error",
                    message: 'Cuadrillero no encontrado.'
                });
            }

            const datos_actuales = personal.toJSON();
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

            const check_personal = await Personal_cuadrilla.findOne({
                where: {
                    legajo: legajo,
                    personal_cuadrilla_id: { [Op.ne]: personal.personal_cuadrilla_id }
                }
            });

            if (check_personal) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe cuadrillero con el mismo legajo."
                });
            }

            personal.set(req.body);
            await personal.save();

            return res.status(200).json({
                status: "success",
                message: "Cuadrillero actualizado correctamente."
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
            const deleted = await Personal_cuadrilla.destroy({
                where: { personal_cuadrilla_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Cuadrillero no encontrado.'
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

module.exports = api_personal_cuadrilla_controller;
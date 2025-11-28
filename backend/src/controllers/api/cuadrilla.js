const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Cuadrilla = db.cuadrilla;
const Cuadrilla_personal = db.cuadrilla_personal;

//EJEMPLO DE SOLICITUD POST

/*{
    "codigo": "C02",
    "descripcion": "CUADRILLA OBRA SAN MARTIN",
    "cuadrilla_personal": [
        {
            "rol": "JEFE DE CUADRILLA",
            "personal_cuadrilla_id": 2
        },
        {
            "rol": "AYUDANTE",
            "personal_cuadrilla_id": 1
        }
    ]
}*/

const api_cuadrilla_controller = {

    get_all: async (req, res) => {
        try {

            let { descripcion, codigo, cliente, getAll, activo, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const cuadrilla_where_conditions = {};

            const offset = (page - 1) * limit;

            if (descripcion) {
                cuadrilla_where_conditions.descripcion = { [Op.like]: `%${descripcion.trim().toUpperCase()}%` };
            }
            if (codigo) {
                cuadrilla_where_conditions.codigo = { [Op.like]: `%${codigo.trim().toUpperCase()}%` };
            }

            if (activo) {
                cuadrilla_where_conditions.activo = true;
            }

            if (req.clientesIds) {
                cuadrilla_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: cuadrillas } = await Cuadrilla.findAndCountAll({
                where: cuadrilla_where_conditions,
                include: [
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'descripcion'],
                        where: cliente ? { cliente_id: cliente } : undefined
                    },
                    {
                        association: 'cuadrilla_personal',
                        attributes: ['rol'],
                        include: [
                            {
                                association: 'personal_cuadrilla',
                                attributes: ['personal_cuadrilla_id', 'nombre']
                            }
                        ]
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
                    : "No se encontraron cuadrillas.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: cuadrillas
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
            const cuadrilla = await Cuadrilla.findByPk(req.params.id, {
                include: [
                    {
                        association: 'cuadrilla_personal',
                        attributes: ['rol'],
                        include: [
                            {
                                association: 'personal_cuadrilla',
                                attributes: ['personal_cuadrilla_id', 'nombre']
                            }
                        ]
                    }
                ],
            });
            if (cuadrilla) {
                return res.status(200).json({
                    status: "success",
                    message: "Cuadrilla encontrada.",
                    data: cuadrilla
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Cuadrilla no encontrada."
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

        const { cuadrilla_personal } = req.body;
        const codigo = req.body.codigo.toUpperCase();
        const t = await db.sequelize.transaction(); // Transacción para asegurar atomicidad

        try {

            if (cuadrilla_personal) {
                // Validar que no haya más de un JEFE DE CUADRILLA
                const jefes = cuadrilla_personal.filter(p => p.rol.toUpperCase() === "JEFE DE CUADRILLA");
                if (jefes.length !== 1) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "Debe haber solo un JEFE DE CUADRILLA."
                    });
                }

                // Validar que no se repita el mismo personal
                const personalIds = cuadrilla_personal.map(p => p.personal_cuadrilla_id);
                const uniqueIds = new Set(personalIds);
                if (uniqueIds.size !== personalIds.length) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "El personal no puede repetirse."
                    });
                }
            }

            // Verificar si ya existe una cuadrilla con el mismo codigo
            const check_cuadrilla = await Cuadrilla.findOne({
                where: { codigo: codigo },
                transaction: t
            });

            if (check_cuadrilla) {
                await t.rollback();
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe una cuadrilla con el mismo codigo."
                });
            }

            // Crear la cuadrilla
            delete req.body.cuadrilla_personal;
            const nueva_cuadrilla = await Cuadrilla.create(req.body, { transaction: t });

            let nuevo_cuadrilla_personal = [];
            if (cuadrilla_personal && cuadrilla_personal.length > 0) {
                const cuadrilla_personal_data = cuadrilla_personal.map(personal => ({
                    ...personal,
                    cuadrilla_id: nueva_cuadrilla.cuadrilla_id  // Asociar la cuadrilla creada
                }));
                // Crear la cuadrilla_personal
                nuevo_cuadrilla_personal = await Cuadrilla_personal.bulkCreate(cuadrilla_personal_data, { transaction: t });
            }

            await t.commit(); // Confirmar la transacción

            return res.status(201).json({
                status: "success",
                message: "Cuadrilla creada correctamente."
            });

        } catch (error) {
            await t.rollback(); // Deshacer cambios si hubo error
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    update: async (req, res) => {

        const codigo = req.body.codigo.toUpperCase();

        try {
            const cuadrilla = await Cuadrilla.findByPk(req.params.id);
            if (!cuadrilla) {
                return res.status(404).json({
                    status: "error",
                    message: 'Cuadrilla no encontrada.'
                });
            }

            const check_cuadrilla = await Cuadrilla.findOne({
                where: {
                    codigo: codigo,
                    cuadrilla_id: { [Op.ne]: cuadrilla.cuadrilla_id }
                }
            });

            if (check_cuadrilla) {
                return res.status(400).json({
                    status: "error",
                    message: "Ya existe una cuadrilla con el mismo codigo."
                });
            }

            cuadrilla.activo = req.body.activo;
            cuadrilla.codigo = req.body.codigo;
            cuadrilla.descripcion = req.body.descripcion;
            cuadrilla.cliente_id = req.body.cliente_id;
            await cuadrilla.save();

            return res.status(200).json({
                status: "success",
                message: "Cuadrilla actualizada correctamente."
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
            const deleted = await Cuadrilla.destroy({
                where: { cuadrilla_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Cuadrilla no encontrada.'
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


module.exports = api_cuadrilla_controller;
const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Tipo_movimiento = db.tipo_movimiento;
const Movimiento = db.movimiento;
const Movimiento_detalle = db.movimiento_detalle;
const Ubicacion = db.ubicacion;
const Stock = db.stock;
const Material = db.material;
const Cuadrilla = db.cuadrilla;
const Material_serial = db.material_serial;
const Movimiento_detalle_serial = db.movimiento_detalle_serial;
const Material_serial_estado_historico = db.material_serial_estado_historico;

//EJEMPLO DE SOLICITUD POST

/*{
    "cliente_id": 1,
    "descripcion": "Ingreso de material",
    "reserva": "2564",
    "desde_cuadrilla_id": 1,
    "hacia_cuadrilla_id": 1,
    "desde_ubicacion_id": 1,
    "hacia_ubicacion_id": 2,    
    "tipo_movimiento_id": 1,
    "movimiento_detalle": [
        {
            "material_id": 1,
            "cantidad": 30
        },
        {
            "material_id": 2,
            "cantidad": 1,
            "serie": "S001"
        }
    ]
}*/

const api_movimiento_controller = {

    get_all: async (req, res) => {
        try {

            let { fecha, tipo, remito, descripcion, usuario, cliente, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const movimiento_where_conditions = {};

            const offset = (page - 1) * limit;

            if (fecha) {
                const [year, month, day] = fecha.split("-").map(Number);
                const fechaInicio = new Date(year, month - 1, day);
                const fechaFin = new Date(year, month - 1, day + 1);
                movimiento_where_conditions.auditoria_alta = {
                    [Op.gte]: fechaInicio,
                    [Op.lt]: fechaFin,
                };
            }

            if (remito) {
                movimiento_where_conditions.movimiento_id = remito.trim().toUpperCase();
            }

            if (req.clientesIds) {
                movimiento_where_conditions.cliente_id = { [Op.in]: req.clientesIds };
            }

            const { count, rows: movimientos } = await Movimiento.findAndCountAll({
                where: movimiento_where_conditions,
                include: [
                    {
                        association: 'cliente',
                        attributes: ['cliente_id', 'codigo', 'descripcion'],
                        where: cliente ? { cliente_id: cliente } : undefined
                    },
                    {
                        association: 'usuario',
                        attributes: ['usuario_id', 'nombre', 'email'],
                        where: usuario ? { nombre: { [Op.like]: `%${usuario.trim().toUpperCase()}%` } } : undefined
                    },
                    {
                        association: 'tipo_movimiento',
                        attributes: ['tipo_movimiento_id', 'tipo', 'descripcion'],
                        where: {
                            ...(tipo && { tipo: { [Op.like]: `%${tipo.trim()}%` } }),
                            ...(descripcion && { descripcion: { [Op.like]: `%${descripcion.trim()}%` } }),
                        }
                    },
                    {
                        association: 'desde_cuadrilla',
                        attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                        include: [
                            {
                                association: 'cuadrilla_personal',
                                attributes: ['rol'],
                                include: [
                                    {
                                        association: 'personal_cuadrilla',
                                        attributes: ['nombre']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        association: 'hacia_cuadrilla',
                        attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                        include: [
                            {
                                association: 'cuadrilla_personal',
                                attributes: ['rol'],
                                include: [
                                    {
                                        association: 'personal_cuadrilla',
                                        attributes: ['nombre']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        association: 'desde_ubicacion',
                        attributes: ['ubicacion_id', 'tipo'],
                        include: [
                            {
                                association: 'proveedor',
                                attributes: ['proveedor_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'deposito',
                                attributes: ['deposito_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'obra',
                                attributes: ['obra_id', 'codigo', 'descripcion']
                            },
                        ]
                    },
                    {
                        association: 'hacia_ubicacion',
                        attributes: ['ubicacion_id', 'tipo'],
                        include: [
                            {
                                association: 'proveedor',
                                attributes: ['proveedor_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'deposito',
                                attributes: ['deposito_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'obra',
                                attributes: ['obra_id', 'codigo', 'descripcion']
                            },
                        ]
                    },
                    {
                        association: 'movimiento_detalles',
                        attributes: ['material_id', 'cantidad'],
                        include: [
                            {
                                association: 'material',
                                attributes: ['codigo', 'descripcion'],
                                include: [
                                    {
                                        association: 'unidad_medida',
                                        attributes: ['simbolo']
                                    }
                                ]
                            },
                            {
                                association: 'movimiento_detalle_serial',
                                attributes: ['movimiento_detalle_serial_id'],
                                include: [
                                    {
                                        association: 'material',
                                        attributes: ['serie']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                order: [
                    ['auditoria_alta', 'DESC']
                ],
                limit,
                offset,
                distinct: true // Asegura que se cuenten solo las filas de la tabla principal,
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron movimientos.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: movimientos
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
            const movimiento = await Movimiento.findByPk(req.params.id, {
                include: [
                    {
                        association: 'usuario',
                        attributes: ['usuario_id', 'nombre', 'email']
                    },
                    {
                        association: 'tipo_movimiento',
                        attributes: ['tipo_movimiento_id', 'tipo', 'descripcion']
                    },
                    {
                        association: 'desde_cuadrilla',
                        attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                        include: [
                            {
                                association: 'cuadrilla_personal',
                                attributes: ['rol'],
                                include: [
                                    {
                                        association: 'personal_cuadrilla',
                                        attributes: ['nombre']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        association: 'hacia_cuadrilla',
                        attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                        include: [
                            {
                                association: 'cuadrilla_personal',
                                attributes: ['rol'],
                                include: [
                                    {
                                        association: 'personal_cuadrilla',
                                        attributes: ['nombre']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        association: 'desde_ubicacion',
                        attributes: ['ubicacion_id', 'tipo'],
                        include: [
                            {
                                association: 'proveedor',
                                attributes: ['proveedor_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'deposito',
                                attributes: ['deposito_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'obra',
                                attributes: ['obra_id', 'codigo', 'descripcion']
                            },
                        ]
                    },
                    {
                        association: 'hacia_ubicacion',
                        attributes: ['ubicacion_id', 'tipo'],
                        include: [
                            {
                                association: 'proveedor',
                                attributes: ['proveedor_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'deposito',
                                attributes: ['deposito_id', 'codigo', 'descripcion']
                            },
                            {
                                association: 'obra',
                                attributes: ['obra_id', 'codigo', 'descripcion']
                            },
                        ]
                    },
                    {
                        association: 'movimiento_detalles',
                        attributes: ['material_id', 'cantidad'],
                        include: [
                            {
                                association: 'material',
                                attributes: ['codigo', 'descripcion'],
                                include: [
                                    {
                                        association: 'unidad_medida',
                                        attributes: ['simbolo']
                                    }
                                ]
                            },
                            {
                                association: 'movimiento_detalle_serial',
                                attributes: ['movimiento_detalle_serial_id'],
                                include: [
                                    {
                                        association: 'material',
                                        attributes: ['serie']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
            if (movimiento) {
                return res.status(200).json({
                    status: "success",
                    message: "Movimiento encontrado.",
                    data: movimiento
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Movimiento no encontrado.'
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

        // Usuario autenticado
        const usuario_autenticado = req.usuario;
        const { movimiento_detalle, desde_ubicacion_id, hacia_ubicacion_id, tipo_movimiento_id, desde_cuadrilla_id, hacia_cuadrilla_id, cliente_id } = req.body;

        // Iniciar transacción
        const t = await db.sequelize.transaction(); // Transacción para asegurar atomicidad

        try {

            // Verificar el tipo de movimiento
            const tipo_movimiento = await Tipo_movimiento.findOne({
                where: { tipo_movimiento_id: tipo_movimiento_id },
                transaction: t
            });
            const consumo_en_obra = tipo_movimiento?.descripcion === "CONSUMO EN OBRA";
            const devoluciones = tipo_movimiento?.descripcion === "DEVOLUCIONES A PROVEEDOR";

            // Verificar la ubicación de origen y si es un PROVEEDOR
            const ubicacion_salida = await Ubicacion.findOne({
                where: { ubicacion_id: desde_ubicacion_id },
                transaction: t
            });
            if (!ubicacion_salida) {
                await t.rollback(); // Deshacer si no existe
                return res.status(400).json({
                    status: "error",
                    message: "La UBICACION de origen no existe."
                });
            }
            const desde_es_proveedor = ubicacion_salida?.tipo === "PROVEEDOR";

            // Verificar la ubicación de destino
            let ubicacion_entrada = null;
            if (hacia_ubicacion_id) {
                ubicacion_entrada = await Ubicacion.findOne({
                    where: { ubicacion_id: hacia_ubicacion_id },
                    transaction: t
                });
                if (!ubicacion_entrada) {
                    await t.rollback(); // Deshacer si no existe
                    return res.status(400).json({
                        status: "error",
                        message: "La UBICACION de destino no existe."
                    });
                }
            }

            // Verificar si la cantidad del material es igual a 0
            if (movimiento_detalle.some(item => item.cantidad === 0)) {
                await t.rollback(); // Deshacer si es true
                return res.status(400).json({
                    status: "error",
                    message: "La cantidad de los materiales debe ser mayor a 0."
                });
            }

            // **CONTROL DE ERRORES*
            let error = null;

            switch (tipo_movimiento.descripcion) {
                case "INGRESO DE PROVEEDOR":
                    if (ubicacion_salida?.tipo !== "PROVEEDOR") {
                        error = ("La ubicación de origen debe ser un PROVEEDOR.");
                        break;
                    }
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_entrada?.tipo !== "DEPOSITO") {
                        error = ("La ubicación de destino debe ser un DEPOSITO.");
                        break;
                    }
                    if (desde_cuadrilla_id || hacia_cuadrilla_id) {
                        error = ("El movimiento NO requiere indicar CUADRILLAS.");
                        break;
                    }
                    break;

                case "DEVOLUCIONES DE OBRA":
                    if (ubicacion_salida?.tipo !== "OBRA") {
                        error = ("La ubicación de origen debe ser una OBRA.");
                        break;
                    }
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_entrada?.tipo !== "DEPOSITO") {
                        error = ("La ubicación de destino debe ser un DEPOSITO.");
                        break;
                    }
                    if (!desde_cuadrilla_id) {
                        error = ("El ID de la CUADRILLA de origen es requerido.");
                        break;
                    }
                    break;

                case "ENVIOS A OBRA":
                    if (ubicacion_salida?.tipo !== "DEPOSITO") {
                        error = ("La ubicación de origen debe ser un DEPOSITO.");
                        break;
                    }
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_entrada?.tipo !== "OBRA") {
                        error = ("La ubicación de destino debe ser una OBRA.");
                        break;
                    }
                    if (!hacia_cuadrilla_id) {
                        error = ("El ID de la CUADRILLA de destino es requerido.");
                        break;
                    }
                    break;

                case "CONSUMO EN OBRA":
                    if (ubicacion_salida?.tipo !== "OBRA") {
                        error = ("La ubicación de origen debe ser una OBRA.");
                        break;
                    }
                    if (hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino NO es requerido.");
                        break;
                    }
                    if (!desde_cuadrilla_id) {
                        error = ("El ID de la CUADRILLA de origen es requerido.");
                        break;
                    }
                    break;

                case "TRASLADO ENTRE OBRAS":
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_salida?.tipo !== "OBRA" || ubicacion_entrada?.tipo !== "OBRA") {
                        error = ("El origen y el destino deben ser OBRAS.");
                        break;
                    }
                    if (ubicacion_salida?.ubicacion_id === ubicacion_entrada?.ubicacion_id) {
                        error = ("La OBRA de origen y destino NO pueden ser la misma.");
                        break;
                    }
                    if (!desde_cuadrilla_id || !hacia_cuadrilla_id) {
                        error = ("El movimiento requiere indicar CUADRILLA de origen y destino.");
                        break;
                    }
                    // if (desde_cuadrilla_id !== hacia_cuadrilla_id) {
                    //     error = ("La CUADRILLA de origen y destino deben ser la misma.");
                    //     break;
                    // }
                    break;

                case "TRASLADO ENTRE DEPOSITOS":
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_salida?.tipo !== "DEPOSITO" || ubicacion_entrada?.tipo !== "DEPOSITO") {
                        error = ("El origen y el destino deben ser DEPOSITOS.");
                        break;
                    }
                    if (ubicacion_salida?.ubicacion_id === ubicacion_entrada?.ubicacion_id) {
                        error = ("El deposito de origen y destino NO pueden ser el mismo.");
                        break;
                    }
                    if (desde_cuadrilla_id || hacia_cuadrilla_id) {
                        error = ("El movimiento NO requiere indicar CUADRILLAS.");
                        break;
                    }
                    break;

                case "TRASLADO ENTRE CUADRILLAS":
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_salida?.tipo !== "OBRA" || ubicacion_entrada?.tipo !== "OBRA") {
                        error = ("El origen y el destino deben ser OBRAS.");
                        break;
                    }
                    if (!desde_cuadrilla_id || !hacia_cuadrilla_id) {
                        error = ("El movimiento requiere indicar CUADRILLA de origen y destino.");
                        break;
                    }
                    if (desde_cuadrilla_id === hacia_cuadrilla_id) {
                        error = ("La CUADRILLA de origen y destino NO pueden ser la misma.");
                        break;
                    }
                    // if (ubicacion_salida?.ubicacion_id !== ubicacion_entrada?.ubicacion_id) {
                    //     error = ("La OBRA de origen y destino deben ser la misma.");
                    //     break;
                    // }
                    break;

                case "DEVOLUCIONES A PROVEEDOR":
                    if (ubicacion_salida?.tipo !== "DEPOSITO") {
                        error = ("La ubicación de origen debe ser un DEPOSITO.");
                        break;
                    }
                    if (!hacia_ubicacion_id) {
                        error = ("El ID de la ubicacion de destino es requerido.");
                        break;
                    }
                    if (ubicacion_entrada?.tipo !== "PROVEEDOR") {
                        error = ("La ubicación de destino debe ser un PROVEEDOR.");
                        break;
                    }
                    if (desde_cuadrilla_id || hacia_cuadrilla_id) {
                        error = ("El movimiento NO requiere indicar CUADRILLAS");
                        break;
                    }
                    break;

                default:
                    error = ("Tipo de movimiento no reconocido.");
            }

            // Si hay errores, devolverlos
            if (error) {
                await t.rollback();
                return res.status(400).json({
                    status: "error",
                    message: error
                });
            }

            // Verificacion de cuadrillas
            let check_desde_cuadrilla = null;
            if (desde_cuadrilla_id) {
                check_desde_cuadrilla = await Cuadrilla.findOne({
                    where: { cuadrilla_id: desde_cuadrilla_id },
                    transaction: t
                });
                if (!check_desde_cuadrilla) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "La CUADRILLA de origen no existe."
                    });
                }
            }

            let check_hacia_cuadrilla = null;
            if (hacia_cuadrilla_id) {
                check_hacia_cuadrilla = await Cuadrilla.findOne({
                    where: { cuadrilla_id: hacia_cuadrilla_id },
                    transaction: t
                });
                if (!check_hacia_cuadrilla) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "La CUADRILLA de destino no existe."
                    });
                }
            }

            // **VERIFICAR EL STOCK**
            // Determinar cuadrilla de la ubicación de entrada y salida. Si es deposito null, sino cuadrilla_id
            const cuadrilla_id_salida = ["DEPOSITO", "PROVEEDOR"].includes(ubicacion_salida?.tipo) ? { [Op.is]: null } : check_desde_cuadrilla?.cuadrilla_id;
            const cuadrilla_id_entrada = ["DEPOSITO", "PROVEEDOR"].includes(ubicacion_entrada?.tipo) ? { [Op.is]: null } : check_hacia_cuadrilla?.cuadrilla_id;
            const cuadrilla_id_entrada_create = ["DEPOSITO", "PROVEEDOR"].includes(ubicacion_entrada?.tipo) ? null : check_hacia_cuadrilla?.cuadrilla_id;
            // Crear un map con todos los id de los materiales
            const materiales_ids = movimiento_detalle.map(detalle => detalle.material_id);
            // Series exceptuadas para actualizar stock (instalados + devolución de obra)
            const seriesExceptuadas = new Set();
            // Caso que el origen no es proveedor y el movimiento no es traslado entre cuadrillas
            if (!desde_es_proveedor) {

                let errores_stock = [];

                const stock_disponible = await Stock.findAll({
                    where: {
                        material_id: { [Op.in]: materiales_ids },
                        ubicacion_id: ubicacion_salida.ubicacion_id,
                        cuadrilla_id: cuadrilla_id_salida,
                        cliente_id: cliente_id
                    },
                    include: [
                        {
                            association: "material",
                            attributes: ["codigo"]
                        }
                    ],
                    transaction: t
                });

                // Convertir stock_disponible a un map para acceso rápido
                const stock_map = new Map(stock_disponible.map(item => [item.material_id, item]));

                // Obtener los códigos de todos los materiales para mostrar aunque no haya stock
                const materiales_info = await Material.findAll({
                    where: { material_id: { [Op.in]: materiales_ids } },
                    attributes: ["material_id", "codigo"],
                    transaction: t
                });

                const codigo_material_map = new Map(materiales_info.map(m => [m.material_id, m.codigo]));

                for (const detalle of movimiento_detalle) {
                    // CHEQUEO STOCK DE MATERIALES SERIADOS
                    if (detalle.serie) {
                        // Buscar la serie solo por material + serie + cliente
                        const serialEncontrado = await Material_serial.findOne({
                            where: {
                                material_id: detalle.material_id,
                                serie: detalle.serie,
                                cliente_id: cliente_id
                            },
                            transaction: t
                        });

                        // Validar existencia en el sistema
                        if (!serialEncontrado) {
                            await t.rollback();
                            return res.status(400).json({
                                status: "error",
                                message: `Serie '${detalle.serie.toUpperCase()}' no existe en el sistema.`
                            });
                        }

                        // Validar ubicación de origen
                        const mismaUbicacion = serialEncontrado.ubicacion_id === ubicacion_salida.ubicacion_id;
                        if (!mismaUbicacion) {
                            await t.rollback();
                            return res.status(400).json({
                                status: "error",
                                message: `Serie '${detalle.serie.toUpperCase()}' no disponible en la ubicación de origen.`
                            });
                        }

                        // Validación de cuadrilla según tipo y estado
                        const mismaCuadrilla = (serialEncontrado.cuadrilla_id || null) === (check_desde_cuadrilla?.cuadrilla_id || null);
                        const esDevolucionObra = tipo_movimiento.descripcion === 'DEVOLUCIONES DE OBRA';
                        const estaInstalado = serialEncontrado.estado === 'INSTALADO';

                        if (!esDevolucionObra) {
                            // Movimientos normales → debe coincidir cuadrilla
                            if (!mismaCuadrilla) {
                                await t.rollback();
                                return res.status(400).json({
                                    status: "error",
                                    message: `Serie '${detalle.serie.toUpperCase()}' no disponible en la cuadrilla de origen.`
                                });
                            }
                        } else {
                            // DEVOLUCIONES DE OBRA
                            // Si NO está instalado → validar cuadrilla normalmente
                            if (!estaInstalado && !mismaCuadrilla) {
                                await t.rollback();
                                return res.status(400).json({
                                    status: "error",
                                    message: `Serie '${detalle.serie.toUpperCase()}' no disponible en la cuadrilla de origen.`
                                });
                            }
                            // Si está instalado, permitir que otra cuadrilla lo retire
                            if (estaInstalado) {
                                seriesExceptuadas.add(detalle.serie); // Se guardan series exeptuadas para actualizar stock de origen
                                continue;
                            }
                        }
                    }

                    // --- CHEQUEO STOCK GENERAL ---
                    let cantidad_disponible = stock_map.get(detalle.material_id)?.cantidad || 0;
                    let codigo_material = codigo_material_map.get(detalle.material_id) || "Desconocido";

                    if (cantidad_disponible < detalle.cantidad) {
                        errores_stock.push(`Material '${codigo_material}': (Disponible: ${cantidad_disponible}, Solicitado: ${detalle.cantidad.toFixed(2)}).`);
                    }
                }

                if (errores_stock.length > 0) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "Stock insuficiente para los siguientes materiales:",
                        data: errores_stock
                    });
                }
            }

            // **CREAR MOVIMIENTO**
            // Borrar del body movimiento_detalle para que no falle el create de Movimiento
            delete req.body.movimiento_detalle;
            // Agregar usuario autenticado (requerido) al body previo al create de Movimiento
            req.body.auditoria_usuario_id = usuario_autenticado.usuario_id;

            const nuevo_movimiento = await Movimiento.create(req.body, { transaction: t });

            // **CREAR MOVIMIENTO_DETALLE**            
            if (movimiento_detalle?.length) {

                const seriesSet = new Set();

                // Agregar movimiento_id y validar series duplicadas
                for (let detalle of movimiento_detalle) {

                    detalle.movimiento_id = nuevo_movimiento.movimiento_id;

                    if (detalle.serie) {
                        const serieNormalized = String(detalle.serie).trim().toUpperCase();
                        if (seriesSet.has(serieNormalized)) {
                            await t.rollback();
                            return res.status(400).json({
                                status: "error",
                                message: `Material '${detalle.codigo.toUpperCase()}' Serie '${detalle.serie.toUpperCase()}' duplicado en el movimiento.`
                            });
                        }
                        seriesSet.add(serieNormalized);
                    }
                }

                const detalles_creados = await Movimiento_detalle.bulkCreate(movimiento_detalle, { transaction: t });

                // ---- BLOQUE PARA MATERIALES SERIADOS ----
                for (let i = 0; i < detalles_creados.length; i++) {

                    const detalle_creado = detalles_creados[i];
                    const detalle_original = movimiento_detalle[i];

                    // Obtener info del material
                    const material_info = await Material.findByPk(detalle_original.material_id, { transaction: t });

                    // Si no es serializado, saltar
                    if (!material_info.serializado) continue;

                    // Validar que exista serie
                    if (!detalle_original.serie) {
                        await t.rollback();
                        return res.status(400).json({
                            status: "error",
                            message: `Material '${material_info.codigo}' requiere indicar el numero de serie.`
                        });
                    }

                    // Validar que sea cantidad 1
                    if (detalle_original.cantidad !== 1) {
                        await t.rollback();
                        return res.status(400).json({
                            status: "error",
                            message: `Material '${material_info.codigo}' requiere indicar cantidad igual a 1.`
                        });
                    }

                    // Determinar el estado según el tipo de movimiento
                    let estado_serial;
                    switch (tipo_movimiento.descripcion) {
                        case 'INGRESO DE PROVEEDOR':
                        case 'DEVOLUCIONES DE OBRA':
                        case 'TRASLADO ENTRE DEPOSITOS':
                            estado_serial = 'DISPONIBLE';
                            break;
                        case 'ENVIOS A OBRA':
                        case 'TRASLADO ENTRE OBRAS':
                        case 'TRASLADO ENTRE CUADRILLAS':
                            estado_serial = 'ASIGNADO';
                            break;
                        case 'CONSUMO EN OBRA':
                            estado_serial = 'INSTALADO';
                            break;
                        case 'DEVOLUCIONES A PROVEEDOR':
                            estado_serial = 'BAJA';
                            break;
                        default:
                            estado_serial = 'DISPONIBLE';
                            break;
                    }

                    // Busqueda de material seriado
                    let serial = await Material_serial.findOne({
                        where: { material_id: detalle_original.material_id, serie: detalle_original.serie, cliente_id: cliente_id },
                        transaction: t
                    });

                    if (serial) {

                        // Validar ubicación de origen
                        if (serial.ubicacion_id !== Number(nuevo_movimiento.desde_ubicacion_id)) {
                            await t.rollback();
                            return res.status(400).json({
                                status: "error",
                                message: `Serie '${detalle_original.serie.toUpperCase()}' no disponible en la ubicación de origen.`
                            });
                        }

                        // Determinar si es devolución de obra
                        const esDevolucionObra = tipo_movimiento.descripcion === 'DEVOLUCIONES DE OBRA';

                        // Actualizar ubicación, cuadrilla y estado
                        await serial.update({
                            estado: estado_serial,
                            activo: estado_serial !== 'BAJA' && estado_serial !== 'INSTALADO',
                            ubicacion_id: nuevo_movimiento.hacia_ubicacion_id ?? serial.ubicacion_id,
                            cuadrilla_id: esDevolucionObra ? null : (nuevo_movimiento.hacia_cuadrilla_id ?? serial.cuadrilla_id)
                        }, { transaction: t });

                    } else if (tipo_movimiento.descripcion === 'INGRESO DE PROVEEDOR') {

                        // Crear si es ingreso de proveedor
                        serial = await Material_serial.create({
                            material_id: detalle_original.material_id,
                            serie: detalle_original.serie,
                            estado: estado_serial,
                            activo: estado_serial !== 'BAJA',
                            ubicacion_id: nuevo_movimiento.hacia_ubicacion_id || null,
                            cuadrilla_id: nuevo_movimiento.hacia_cuadrilla_id || null,
                            cliente_id: cliente_id
                        }, { transaction: t });

                    } else {
                        // Si no existe y no es ingreso de proveedor
                        await t.rollback();
                        return res.status(400).json({
                            status: "error",
                            message: `Serie '${detalle_original.serie.toUpperCase()}' no existe en el sistema.`
                        });
                    }

                    // Crear registros de detalle y histórico
                    await Movimiento_detalle_serial.create({
                        movimiento_detalle_id: detalle_creado.movimiento_detalle_id,
                        material_serial_id: serial.material_serial_id
                    }, { transaction: t });

                    await Material_serial_estado_historico.create({
                        material_serial_id: serial.material_serial_id,
                        estado: serial.estado,
                        ubicacion_id: serial.ubicacion_id,
                        cuadrilla_id: serial.cuadrilla_id,
                        tipo_movimiento_id: tipo_movimiento.tipo_movimiento_id,
                        auditoria_usuario_id: usuario_autenticado.usuario_id,
                        cliente_id: cliente_id
                    }, { transaction: t });

                }
                // ---- FIN BLOQUE SERIADOS ----
            }

            // **ACTUALIZAR EL STOCK**
            // Agrupar cantidades por material_id
            const cantidadesPorMaterial = movimiento_detalle.reduce((acc, detalle) => {
                acc[detalle.material_id] = (acc[detalle.material_id] || 0) + detalle.cantidad;
                return acc;
            }, {});

            // Obtener stocks en una sola consulta
            const stock_origen = await Stock.findAll({
                where: {
                    material_id: { [Op.in]: materiales_ids },
                    ubicacion_id: desde_ubicacion_id,
                    cuadrilla_id: cuadrilla_id_salida,
                    cliente_id: cliente_id
                },
                transaction: t
            });

            let stock_destino = [];
            if (hacia_ubicacion_id) {
                stock_destino = await Stock.findAll({
                    where: {
                        material_id: { [Op.in]: materiales_ids },
                        ubicacion_id: hacia_ubicacion_id,
                        cuadrilla_id: cuadrilla_id_entrada,
                        cliente_id: cliente_id
                    },
                    transaction: t
                });
            }

            // Crear mapas para acceso rápido
            const stock_map_origen = new Map(stock_origen.map(item => [item.material_id, item]));
            const stock_map_destino = new Map(stock_destino.map(item => [item.material_id, item]));

            // Procesar por material_id (ya agrupado)
            for (const [material_id, cantidadTotal] of Object.entries(cantidadesPorMaterial)) {

                // Calcular cuántas unidades están exceptuadas para este material
                const cantidadExceptuada = movimiento_detalle.filter(d => d.material_id === Number(material_id) && seriesExceptuadas.has(d.serie)).length;

                const cantidadReal = cantidadTotal - cantidadExceptuada;

                if (!desde_es_proveedor && cantidadReal > 0) {
                    let stock = stock_map_origen.get(Number(material_id));
                    if (stock) {
                        await stock.decrement("cantidad", { by: cantidadReal, transaction: t });
                    }
                }

                // Si no es consumo en obra o devolución, actualizar el destino
                if (!(consumo_en_obra || devoluciones)) {
                    let stock = stock_map_destino.get(Number(material_id));
                    if (stock) {
                        await stock.increment("cantidad", { by: cantidadTotal, transaction: t });
                    } else {
                        await Stock.create({
                            material_id: Number(material_id),
                            ubicacion_id: hacia_ubicacion_id,
                            cantidad: cantidadTotal,
                            cuadrilla_id: cuadrilla_id_entrada_create,
                            cliente_id: cliente_id
                        }, { transaction: t });
                    }
                }
            }

            await t.commit(); // Confirmar la transacción

            return res.status(201).json({
                status: "success",
                message: "Movimiento creado correctamente."
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};


module.exports = api_movimiento_controller;
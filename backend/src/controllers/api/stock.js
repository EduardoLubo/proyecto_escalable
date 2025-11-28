const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Stock = db.stock;
const MaterialSerial = db.material_serial;

const api_stock_controller = {

    get_all: async (req, res) => {

        try {

            let { cuadrilla, codigo, serie, ubicacion, cliente, getAll, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);
            const offset = (page - 1) * limit;
            const wantAll = String(getAll) === 'true';

            // ----------- FILTROS ------------
            const filterCodigo = codigo ? codigo.trim().toUpperCase() : null;
            const filterSerie = serie ? serie.trim().toUpperCase() : null;
            const filterUbicacion = !isNaN(parseInt(ubicacion)) ? parseInt(ubicacion) : null;
            const filterCuadrilla = cuadrilla ? cuadrilla.trim().toUpperCase() : null;
            const filterClientes = req.clientesIds?.length ? req.clientesIds : null;

            // helper para armar where dinámico con cliente_id
            const buildWhere = (base = {}) => {
                if (filterClientes) {
                    return { ...base, cliente_id: { [Op.in]: filterClientes } };
                }
                return base;
            };

            let merged = [];

            // ----------- CASO 1: HAY SERIE → SOLO SERIALIZADOS ------------
            if (filterSerie) {
                const serialesRaw = await MaterialSerial.findAll({
                    where: buildWhere({
                        activo: true,
                        serie: filterSerie
                    }),
                    include: [
                        {
                            association: 'cliente',
                            attributes: ['cliente_id', 'codigo', 'descripcion'],
                            where: cliente ? { cliente_id: cliente } : undefined
                        },
                        {
                            association: 'material',
                            attributes: ['material_id', 'codigo', 'descripcion', 'serializado', 'unidad_medida_id'],
                            where: filterCodigo ? { codigo: filterCodigo } : undefined,
                            include: [
                                { association: 'unidad_medida', attributes: ['simbolo'] }
                            ]
                        },
                        {
                            association: 'cuadrilla',
                            attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                            where: filterCuadrilla ? { codigo: filterCuadrilla } : undefined
                        },
                        {
                            association: 'ubicacion',
                            attributes: ['ubicacion_id', 'tipo'],
                            where: filterUbicacion ? { ubicacion_id: filterUbicacion } : undefined
                        }
                    ]
                });

                merged = serialesRaw.map(s => ({
                    cantidad: (1.00).toFixed(2),
                    serie: s.serie,
                    estado: s.estado,
                    material: s.material,
                    cuadrilla: s.cuadrilla,
                    ubicacion: s.ubicacion,
                    cliente: s.cliente.descripcion,
                    es_serial: true
                }));
            }

            // ----------- CASO 2: NO HAY SERIE → STOCKS + SERIALIZADOS ------------
            else {
                const stocksRaw = await Stock.findAll({
                    where: buildWhere({ cantidad: { [Op.gt]: 0 } }),
                    include: [
                        {
                            association: 'cliente',
                            attributes: ['cliente_id', 'codigo', 'descripcion'],
                            where: cliente ? { cliente_id: cliente } : undefined
                        },
                        {
                            association: 'material',
                            attributes: ['material_id', 'codigo', 'descripcion', 'serializado', 'unidad_medida_id'],
                            where: filterCodigo ? { codigo: filterCodigo } : undefined,
                            include: [
                                { association: 'unidad_medida', attributes: ['simbolo'] }
                            ]
                        },
                        {
                            association: 'cuadrilla',
                            attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                            where: filterCuadrilla ? { codigo: filterCuadrilla } : undefined
                        },
                        {
                            association: 'ubicacion',
                            attributes: ['ubicacion_id', 'tipo'],
                            where: filterUbicacion ? { ubicacion_id: filterUbicacion } : undefined
                        }
                    ]
                });

                const stocks = stocksRaw
                    .map(s => s.get({ plain: true }))
                    .filter(s => !s.material.serializado)
                    .map(s => ({
                        cantidad: s.cantidad,
                        material: s.material,
                        cuadrilla: s.cuadrilla,
                        ubicacion: s.ubicacion,
                        cliente: s.cliente.descripcion,
                        es_serial: false,
                        
                    }));

                const serialesRaw = await MaterialSerial.findAll({
                    where: buildWhere({ activo: true  }),
                    include: [
                        {
                            association: 'cliente',
                            attributes: ['cliente_id', 'codigo', 'descripcion'],
                            where: cliente ? { cliente_id: cliente } : undefined
                        },
                        {
                            association: 'material',
                            attributes: ['material_id', 'codigo', 'descripcion', 'serializado', 'unidad_medida_id'],
                            where: filterCodigo ? { codigo: filterCodigo } : undefined,
                            include: [
                                { association: 'unidad_medida', attributes: ['simbolo'] }
                            ]
                        },
                        {
                            association: 'cuadrilla',
                            attributes: ['cuadrilla_id', 'codigo', 'descripcion'],
                            where: filterCuadrilla ? { codigo: filterCuadrilla } : undefined
                        },
                        {
                            association: 'ubicacion',
                            attributes: ['ubicacion_id', 'tipo'],
                            where: filterUbicacion ? { ubicacion_id: filterUbicacion } : undefined
                        }
                    ]
                });

                const seriales = serialesRaw.map(s => ({
                    cantidad: (1.00).toFixed(2),
                    serie: s.serie,
                    estado: s.estado,
                    material: s.material,
                    cuadrilla: s.cuadrilla,
                    ubicacion: s.ubicacion,
                    cliente: s.cliente.descripcion,
                    es_serial: true
                }));

                merged = [...stocks, ...seriales];
            }

            // ----------- ORDEN + PAGINADO ------------
            merged.sort((a, b) => (b.cantidad || 0) - (a.cantidad || 0));

            const total_count = merged.length;
            const paginated = wantAll ? merged : merged.slice(offset, offset + limit);

            return res.status(200).json({
                status: "success",
                message: total_count > 0
                    ? `Se encontraron ${total_count} items.`
                    : "No se encontraron stocks.",
                total_pages: limit > 0 ? Math.ceil(total_count / limit) : 1,
                current_page: page,
                total_count,
                data: paginated
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};

module.exports = api_stock_controller;
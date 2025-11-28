const express = require('express');
const router = express.Router();


const api_login_router = require("./login");
const api_unidad_medida_router = require("./unidad_medida");
const api_material_router = require("./material");
const api_tipo_usuario_router = require("./tipo_usuario");
const api_usuario_router = require("./usuario");
const api_tipo_movimiento_router = require("./tipo_movimiento");
const api_cliente_router = require("./cliente");
const api_personal_cuadrilla_router = require("./personal_cuadrilla");
const api_obra_router = require("./obra");
const api_cuadrilla_router = require("./cuadrilla");
const api_deposito_router = require("./deposito");
const api_proveedor_router = require("./proveedor");
const api_movimiento_router = require("./movimiento");
const api_stock_router = require("./stock");
const api_stock_historico_router = require("./stock_historico");
const api_material_serial_router = require("./material_serial");
const api_stock_control_router = require("./stock_control");

router.use('/login', api_login_router);
router.use('/unidad_medida', api_unidad_medida_router);
router.use('/material', api_material_router);
router.use('/tipo_usuario', api_tipo_usuario_router);
router.use('/usuario', api_usuario_router);
router.use('/tipo_movimiento', api_tipo_movimiento_router);
router.use('/cliente', api_cliente_router);
router.use('/personal_cuadrilla', api_personal_cuadrilla_router);
router.use('/obra', api_obra_router);
router.use('/cuadrilla', api_cuadrilla_router);
router.use('/deposito', api_deposito_router);
router.use('/proveedor', api_proveedor_router);
router.use('/movimiento', api_movimiento_router);
router.use('/stock', api_stock_router);
router.use('/stock_historico', api_stock_historico_router);
router.use('/material_serial', api_material_serial_router);
router.use('/stock_control', api_stock_control_router);



module.exports = router;
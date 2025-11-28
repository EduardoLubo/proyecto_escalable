const express = require('express');
const router = express.Router();
const api_material_serial_controller = require('../../controllers/api/material_serial');
const api_token_middleware = require('../../middlewares/token_authorization');
const customer_load_middleware = require('../../middlewares/customer_load');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), customer_load_middleware, api_material_serial_controller.get_all);


module.exports = router;
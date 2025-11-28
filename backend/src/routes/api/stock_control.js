const express = require('express');
const router = express.Router();
const api_stock_control_controller = require('../../controllers/api/stock_control');
const api_token_middleware = require('../../middlewares/token_authorization');
const customer_load_middleware = require('../../middlewares/customer_load');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), customer_load_middleware, api_stock_control_controller.get_all);


module.exports = router;
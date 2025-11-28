const express = require('express');
const router = express.Router();
const api_movimiento_controller = require('../../controllers/api/movimiento');
const api_token_middleware = require('../../middlewares/token_authorization');
const customer_load_middleware = require('../../middlewares/customer_load');
const validate_movimiento = require('../../middlewares/validations/movimiento');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), customer_load_middleware, api_movimiento_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_movimiento_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), validate_movimiento, api_movimiento_controller.create);


module.exports = router;
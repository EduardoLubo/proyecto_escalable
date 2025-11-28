const express = require('express');
const router = express.Router();
const api_cliente_controller = require('../../controllers/api/cliente');
const api_token_middleware = require('../../middlewares/token_authorization');
const customer_load_middleware = require('../../middlewares/customer_load');
const validate_cliente = require('../../middlewares/validations/cliente');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), customer_load_middleware, api_cliente_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_cliente_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_cliente, api_cliente_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_cliente, api_cliente_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_cliente_controller.delete);


module.exports = router;
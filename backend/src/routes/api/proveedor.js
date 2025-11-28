const express = require('express');
const router = express.Router();
const api_proveedor_controller = require('../../controllers/api/proveedor');
const api_token_middleware = require('../../middlewares/token_authorization');
const customer_load_middleware = require('../../middlewares/customer_load');
const validate_proveedor = require('../../middlewares/validations/proveedor');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), customer_load_middleware, api_proveedor_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_proveedor_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_proveedor, api_proveedor_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_proveedor, api_proveedor_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_proveedor_controller.delete);


module.exports = router;
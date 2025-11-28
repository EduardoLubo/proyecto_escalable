const express = require('express');
const router = express.Router();
const api_obra_controller = require('../../controllers/api/obra');
const api_token_middleware = require('../../middlewares/token_authorization');
const customer_load_middleware = require('../../middlewares/customer_load');
const validate_obra = require('../../middlewares/validations/obra');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), customer_load_middleware, api_obra_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_obra_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_obra, api_obra_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_obra, api_obra_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_obra_controller.delete);


module.exports = router;
const express = require('express');
const router = express.Router();
const api_unidad_medida_controller = require('../../controllers/api/unidad_medida');
const api_token_middleware = require('../../middlewares/token_authorization');
const validate_unidad_medida = require('../../middlewares/validations/unidad_medida');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_unidad_medida_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_unidad_medida_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_unidad_medida, api_unidad_medida_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_unidad_medida, api_unidad_medida_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_unidad_medida_controller.delete);


module.exports = router;
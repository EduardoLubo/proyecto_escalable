const express = require('express');
const router = express.Router();
const api_material_controller = require('../../controllers/api/material');
const api_token_middleware = require('../../middlewares/token_authorization');
const validate_material = require('../../middlewares/validations/material');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_material_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_material_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), validate_material, api_material_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), validate_material, api_material_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_material_controller.delete);


module.exports = router;
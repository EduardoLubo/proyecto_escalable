const express = require('express');
const router = express.Router();
const api_personal_cuadrilla_controller = require('../../controllers/api/personal_cuadrilla');
const api_token_middleware = require('../../middlewares/token_authorization');
const validate_personal_cuadrilla = require('../../middlewares/validations/personal_cuadrilla');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_personal_cuadrilla_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_personal_cuadrilla_controller.get_by_id);
router.post('/', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_personal_cuadrilla, api_personal_cuadrilla_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR', 'USUARIO']), validate_personal_cuadrilla, api_personal_cuadrilla_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_personal_cuadrilla_controller.delete);


module.exports = router;
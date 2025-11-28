const express = require('express');
const router = express.Router();
const api_usuario_controller = require('../../controllers/api/usuario');
const api_token_middleware = require('../../middlewares/token_authorization');
const { validate_usuario_POST, validate_usuario_PUT }  = require('../../middlewares/validations/usuario');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_usuario_controller.get_all);
router.get('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_usuario_controller.get_by_id);
router.post('/', validate_usuario_POST, api_usuario_controller.create);
router.put('/:id', api_token_middleware(['ADMINISTRADOR','USUARIO']), validate_usuario_PUT, api_usuario_controller.update);
router.delete('/:id', api_token_middleware(['ADMINISTRADOR']), api_usuario_controller.delete);
router.post("/:id/restore", api_token_middleware(['ADMINISTRADOR']), api_usuario_controller.restore);


module.exports = router;
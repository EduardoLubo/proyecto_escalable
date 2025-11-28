const express = require('express');
const router = express.Router();
const api_tipo_usuario_controller = require('../../controllers/api/tipo_usuario');
const api_token_middleware = require('../../middlewares/token_authorization');

router.get('/', api_token_middleware(['ADMINISTRADOR','USUARIO']), api_tipo_usuario_controller.get_all);


module.exports = router;
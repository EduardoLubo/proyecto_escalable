const express = require('express');
const router = express.Router();
const api_login_controller = require('../../controllers/api/login');
const validate_login = require('../../middlewares/validations/login');

router.post('/', validate_login, api_login_controller.login);


module.exports = router;
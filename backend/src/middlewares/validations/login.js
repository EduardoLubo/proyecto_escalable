const { body, validationResult } = require('express-validator');

const validate_login = [

    body("email")
        .notEmpty().withMessage("El email es requerido.").bail()
        .isEmail().withMessage("El email debe ser un formato válido."),

    body("pass")
        .notEmpty().withMessage("La contraseña es requerida.").bail()
        .isLength({ min: 6 }).withMessage("Contraseña min. 6 caracteres."),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                status: "error",
                message: errors.array()[0].msg
            });
        }
        next();
    }
];

module.exports = validate_login;
const { body, validationResult } = require('express-validator');

const validate_usuario_POST = [

    body('nombre')
        .notEmpty().withMessage('El nombre es requerido.').bail()
        .isString().withMessage("El nombre debe ser un string.").bail()
        .isLength({ max: 35 }).withMessage("Nombre max. 35 caracteres."),

    body('email')
        .notEmpty().withMessage("El email es requerido.").bail()
        .isEmail().withMessage("Email debe ser un formato válido."),

    body('pass')
        .optional()
        .isLength({ min: 6 }).withMessage("Contraseña min. 6 caracteres."),

    body('legajo')
        .notEmpty().withMessage("El legajo es requerido.").bail()
        .isString().withMessage("El legajo debe ser un string.").bail()
        .isLength({ max: 10 }).withMessage("Legajo max. 10 caracteres."),

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

const validate_usuario_PUT = [

    body('nombre')
        .notEmpty().withMessage('El nombre es requerido.').bail()
        .isString().withMessage("El nombre debe ser un string.").bail()
        .isLength({ max: 35 }).withMessage("Nombre max. 35 caracteres."),

    body('email')
        .notEmpty().withMessage("El email es requerido.").bail()
        .isEmail().withMessage("Email debe ser un formato válido."),

    body('pass')
        .optional()
        .isLength({ min: 6 }).withMessage("Contraseña min. 6 caracteres."),

    body('legajo')
        .notEmpty().withMessage("El legajo es requerido.").bail()
        .isString().withMessage("El legajo debe ser un string.").bail()
        .isLength({ max: 10 }).withMessage("Legajo max. 10 caracteres."),

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

module.exports = {
    validate_usuario_POST,
    validate_usuario_PUT
};
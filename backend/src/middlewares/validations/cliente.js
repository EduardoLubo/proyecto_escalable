const { body, validationResult } = require('express-validator');

const validate_cliente = [

    body('codigo')
        .notEmpty().withMessage('El codigo es requerido.').bail()     
        .isString().withMessage("El codigo debe ser un string.").bail()
        .isLength({ max: 10 }).withMessage("Código max. 10 caracteres."),

    body('descripcion')
        .notEmpty().withMessage('La descripcion es requerida.').bail()
        .isString().withMessage("La descripcion debe ser un string.").bail()
        .isLength({ max: 40 }).withMessage("Descripción max. 40 caracteres."),

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

module.exports = validate_cliente;
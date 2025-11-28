const { body, validationResult } = require('express-validator');

const validate_unidad_medida = [

    body('descripcion')
        .notEmpty().withMessage('La descripcion es requerida.').bail()     
        .isString().withMessage("La descripcion debe ser un string.").bail()
        .isLength({ max: 15 }).withMessage("Descripcion max. 15 caracteres."),

    body('simbolo')
        .notEmpty().withMessage('El simbolo es requerido.').bail()
        .isString().withMessage("El simbolo debe ser un string.").bail()
        .isLength({ max: 10 }).withMessage("Simbolo max. 10 caracteres."),

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

module.exports = validate_unidad_medida;
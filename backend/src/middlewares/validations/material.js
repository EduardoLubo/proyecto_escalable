const { body, validationResult } = require('express-validator');

const validate_material = [

    body('codigo')
        .notEmpty().withMessage('El codigo es requerido.').bail()
        .isString().withMessage('El código debe ser string.').bail()
        .isLength({ max: 15 }).withMessage("Código max. 15 caracteres."),

    body('descripcion')
        .notEmpty().withMessage('La descripción es requerida.').bail()
        .isString().withMessage('La descripción debe ser string.').bail()
        .isLength({ max: 50 }).withMessage("Descripción max. 50 caracteres."),

    body('unidad_medida_id')
        .notEmpty().withMessage('ID de la U. de medida es requerido.').bail()
        .isInt().withMessage("ID de la unidad de medida debe ser un entero positivo."),

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

module.exports = validate_material;
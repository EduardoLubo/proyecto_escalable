const { body, validationResult } = require('express-validator');

const validate_obra = [

    body('codigo')
        .notEmpty().withMessage('El codigo es requerido.').bail()
        .isString().withMessage("El codigo debe ser un string.").bail()
        .isLength({ max: 10 }).withMessage("Código max. 10 caracteres."),

    body('descripcion')
        .notEmpty().withMessage('La descripcion es requerida.').bail()
        .isString().withMessage("La descripcion debe ser un string.").bail()
        .isLength({ max: 40 }).withMessage("Descripción max. 40 caracteres."),

    body('pep')
        .optional()
        .isString().withMessage("El pep debe ser un string.").bail()
        .isLength({ max: 20 }).withMessage("Pep max. 20 caracteres."),

    body('reserva')
        .optional()
        .isString().withMessage("La reserva debe ser un string.").bail()
        .isLength({ max: 20 }).withMessage("Reserva max. 20 caracteres."),

    body('zona')
        .optional()
        .isString().withMessage("La zona debe ser un string.").bail()
        .isLength({ max: 20 }).withMessage("Zona max. 20 caracteres."),

    body('cliente_id')
        .notEmpty().withMessage('ID del cliente es requerido.').bail()
        .isInt().withMessage("ID del cliente debe ser un entero positivo."),

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

module.exports = validate_obra;
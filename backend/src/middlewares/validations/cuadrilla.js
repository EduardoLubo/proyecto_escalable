const { body, validationResult } = require('express-validator');

const validate_cuadrilla_POST = [

    body('codigo')
        .notEmpty().withMessage('El codigo es requerido.').bail()
        .isString().withMessage("El codigo debe ser un string.").bail()
        .isLength({ max: 10 }).withMessage("Código max. 10 caracteres."),

    body('descripcion')
        .notEmpty().withMessage('La descripcion es requerida.').bail()
        .isString().withMessage("La descripcion debe ser un string.").bail()
        .isLength({ max: 40 }).withMessage("Descripción max. 40 caracteres."),

    body('cuadrilla_personal')
        .notEmpty().withMessage('Indicar personal de cuadrilla.').bail()
        .isArray().withMessage("cuadrilla_personal debe ser un array."),

    body('cuadrilla_personal.*.rol')
        .notEmpty().withMessage('Indicar personal de cuadrilla.').bail()
        .isString().withMessage("El rol debe ser un string.").bail()
        .isIn(["JEFE DE CUADRILLA", "AYUDANTE"]).withMessage("El rol es 'JEFE DE CUADRILLA' o 'AYUDANTE'."),    

    body('cuadrilla_personal.*.personal_cuadrilla_id')
        .notEmpty().withMessage('El ID de personal es requerido.').bail()
        .isInt().withMessage("El ID de personal debe ser un número entero."),

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

const validate_cuadrilla_PUT = [

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

module.exports = {
    validate_cuadrilla_POST,
    validate_cuadrilla_PUT
};
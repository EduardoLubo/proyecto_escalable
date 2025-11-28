const { body, validationResult } = require('express-validator');

const validate_movimiento = [

    body('cliente_id')
        .notEmpty().withMessage('El ID del cliente es requerido.').bail()
        .isInt().withMessage("El ID de cliente debe ser un número entero."),

    body('descripcion')
        .optional()
        .isString().withMessage('La descripción debe ser string.').bail()
        .isLength({ max: 20 }).withMessage("Descripción max. 20 caracteres."),

    body('desde_ubicacion_id')
        .notEmpty().withMessage('El ID de la ubicacion de origen es requerido.').bail()
        .isInt({ gt: 0 }).withMessage('ID de la ubicacion de origen debe ser un entero positivo.'),

    body('hacia_ubicacion_id')
        .optional()
        .isInt({ gt: 0 }).withMessage('ID de la ubicacion de destino debe ser un entero positivo.'),

    body('reserva')
        .optional()
        .isString().withMessage('La reserva debe ser string.').bail()
        .isLength({ max: 20 }).withMessage("Reserva max. 20 caracteres."),

    body('desde_cuadrilla_id')
        .optional()
        .isInt({ gt: 0 }).withMessage('El ID de la cuadrilla de salida debe ser un entero positivo.'),

    body('hacia_cuadrilla_id')
        .optional()
        .isInt({ gt: 0 }).withMessage('El ID de la cuadrilla de destino debe ser un entero positivo.'),

    body('tipo_movimiento_id')
        .notEmpty().withMessage('El ID del tipo de movimiento es requerido.').bail()
        .isInt({ gt: 0 }).withMessage('El ID del tipo de movimiento debe ser un entero positivo.'),

    body('movimiento_detalle')
        .isArray({ min: 1 }).withMessage("Se requiere min. 1 material en el movimiento."),

    body('movimiento_detalle.*.material_id')
        .notEmpty().withMessage('El ID del material es requerido.').bail()
        .isInt().withMessage("El ID de personal debe ser un número entero."),

    body('movimiento_detalle.*.cantidad')
        .notEmpty().withMessage('La cantidad es requerida.').bail()
        .isFloat({ min: 0 }).withMessage('La cantidad debe ser un número positivo.').bail()
        .isDecimal({ decimal_digits: '0,2' }).withMessage('Cantidad max. 2 decimales.'),

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

module.exports = validate_movimiento;
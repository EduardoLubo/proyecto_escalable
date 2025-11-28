const jwt = require('jsonwebtoken');

const api_token_middleware = (roles_permitidos = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({
                status: "error",
                message: 'Token requerido.'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.usuario = decoded;

            if (roles_permitidos.length > 0 && !roles_permitidos.includes(decoded.tipo_usuario)) {
                return res.status(403).json({
                    status: "error",
                    message: 'No tienes permisos para la solicitud.'
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                status: "error",
                message: 'Token inválido o expirado.'
            });
        }
    };
};

module.exports = api_token_middleware;
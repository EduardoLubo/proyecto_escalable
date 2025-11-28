const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../../database/models/index');
const Usuario = db.usuario;

//EJEMPLO DE SOLICITUD POST

/*{
    "email": "test@test.com",
    "pass": "123456"
}*/

const api_login_controller = {
    login: async (req, res) => {
        try {
            const { email, pass } = req.body;
            const usuario = await Usuario.findOne({
                where: { email },
                include: [
                    {
                        association: 'tipo_usuario',
                        attributes: ['tipo']
                    }
                ]
            });

            if (!usuario) {
                return res.status(404).json({
                    status: "error",
                    message: 'Cuenta inexistente.'
                });
            }
            
            if (!usuario.activo) {
                return res.status(403).json({
                    status: "error",
                    message: 'Cuenta deshabilitada.'
                });
            }

            const isPasswordValid = await bcrypt.compare(pass, usuario.pass);
            if (!isPasswordValid) {
                return res.status(401).json({
                    status: "error",
                    message: 'Credenciales inválidas.'
                });
            }

            const token = jwt.sign(
                { usuario_id: usuario.usuario_id, usuario_nombre: usuario.nombre, usuario_email: usuario.email, tipo_usuario: usuario.tipo_usuario.tipo },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                status: "success",
                token: token
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};


module.exports = api_login_controller;
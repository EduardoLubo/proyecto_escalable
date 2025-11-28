const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../../database/models/index');
const { Op } = require('sequelize');
const Usuario = db.usuario;
const Tipo_usuario = db.tipo_usuario;
const Usuario_cliente = db.usuario_cliente;
const nodemailer = require("nodemailer");

//TRANSPORTER DE EMAIL

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true para 465, false para 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

//EJEMPLO DE SOLICITUD POST

/*{
    "nombre": "test",
    "email": "test@test.com",
    "pass": "123456",
    "legajo": "l001"
}*/

//FUNCION PASS RANDOM

const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 5) + 6; // entre 6 y 10 caracteres
    let pass = '';
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
};

const api_usuario_controller = {

    get_all: async (req, res) => {
        try {

            let { nombre, email, legajo, tipo_usuario, page, limit } = req.query;

            page = isNaN(parseInt(page)) || parseInt(page) < 1 ? 1 : parseInt(page);
            limit = isNaN(parseInt(limit)) || parseInt(limit) < 1 ? 20 : parseInt(limit);

            const usuario_where_conditions = {};

            const offset = (page - 1) * limit;

            if (nombre) {
                usuario_where_conditions.nombre = { [Op.like]: `%${nombre.trim().toUpperCase()}%` };
            }
            if (email) {
                usuario_where_conditions.email = { [Op.like]: `%${email.trim().toUpperCase()}%` };
            }
            if (legajo) {
                usuario_where_conditions.legajo = { [Op.like]: `%${legajo.trim().toUpperCase()}%` };
            }

            const { count, rows: usuarios } = await Usuario.findAndCountAll({
                where: usuario_where_conditions,
                include: [
                    {
                        association: 'clientes',
                        attributes: ['usuario_cliente_id'],
                        include: [
                            {
                                association: 'cliente',
                                attributes: ['cliente_id', 'codigo', 'descripcion'],
                            }
                        ],
                    },
                    {
                        association: 'tipo_usuario',
                        attributes: ['tipo'],
                        where: tipo_usuario ? { tipo: { [Op.like]: `%${tipo_usuario.trim().toUpperCase()}%` } } : undefined
                    }
                ],
                order: [['tipo_usuario', 'tipo', 'ASC']], // Puede fallar en sql server
                limit,
                offset,
                distinct: true, // Asegura que se cuenten solo las filas de la tabla principal
            });

            return res.status(200).json({
                status: "success",
                message: count > 0
                    ? `Se encontraron ${count} items.`
                    : "No se encontraron usuarios.",
                total_pages: limit > 0 ? Math.ceil(count / limit) : 1,
                current_page: page,
                total_count: count,
                data: usuarios
            });

        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    get_by_id: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.params.id, {
                include: [
                    {
                        association: 'tipo_usuario',
                        attributes: ['tipo']
                    }
                ]
            });
            if (usuario) {
                return res.status(200).json({
                    status: "success",
                    message: "Usuario encontrado.",
                    data: usuario
                });
            } else {
                return res.status(404).json({
                    status: "error",
                    message: "Usuario no encontrado."
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    create: async (req, res) => {

        const t = await db.sequelize.transaction(); // iniciar transacción

        try {
            // Validar email duplicado
            const check_usuario_email = await Usuario.findOne(
                { where: { email: req.body.email } },
                { transaction: t }
            );
            if (check_usuario_email) {
                await t.rollback();
                return res.status(400).json({
                    status: "error",
                    message: "El email ya está registrado."
                });
            }

            // Validar legajo duplicado
            const check_usuario_legajo = await Usuario.findOne(
                { where: { legajo: req.body.legajo } },
                { transaction: t }
            );
            if (check_usuario_legajo) {
                await t.rollback();
                return res.status(400).json({
                    status: "error",
                    message: "El legajo ya está registrado."
                });
            }

            // Verificar si hay usuarios existentes
            const usuarios_existentes = await Usuario.count({ transaction: t });

            let tipo_usuario_id;
            let tipo_valido;

            if (usuarios_existentes === 0) {
                // Primer usuario -> ADMINISTRADOR
                tipo_valido = await Tipo_usuario.findOne(
                    { where: { tipo: 'ADMINISTRADOR' } },
                    { transaction: t }
                );
                if (!tipo_valido) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "No se encontró el tipo ADMINISTRADOR."
                    });
                }
                tipo_usuario_id = tipo_valido.tipo_usuario_id;
            } else {
                // Validar token del usuario autenticado
                const token = req.headers['authorization']?.split(' ')[1];
                if (!token) {
                    await t.rollback();
                    return res.status(403).json({
                        status: "error",
                        message: 'Token requerido.'
                    });
                }

                let usuario_autenticado;
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    usuario_autenticado = await Usuario.findByPk(decoded.usuario_id, {
                        include: ['tipo_usuario'],
                        transaction: t
                    });

                    if (!usuario_autenticado || usuario_autenticado.tipo_usuario.tipo !== "ADMINISTRADOR") {
                        await t.rollback();
                        return res.status(403).json({
                            status: "error",
                            message: 'No tienes permisos para la solicitud.'
                        });
                    }
                } catch (error) {
                    await t.rollback();
                    return res.status(401).json({
                        status: "error",
                        message: error.message
                    });
                }

                // Validar tipo_usuario_id enviado
                tipo_usuario_id = req.body.tipo_usuario_id;
                tipo_valido = await Tipo_usuario.findByPk(tipo_usuario_id, { transaction: t });
                if (!tipo_valido) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: 'Tipo de usuario no válido.'
                    });
                }
            }

            // Generar y hashear contraseña
            const generatedPass = req.body.pass || generateRandomPassword();
            const hashedPassword = await bcrypt.hash(generatedPass, 10);

            // Crear usuario
            const usuario = await Usuario.create(
                { ...req.body, pass: hashedPassword, tipo_usuario_id },
                { transaction: t }
            );

            // Asociar clientes si es usuario
            if (tipo_valido.tipo === "USUARIO" && Array.isArray(req.body.clientes)) {
                const relaciones = req.body.clientes.map(cliente_id => ({
                    usuario_id: usuario.usuario_id,
                    cliente_id
                }));
                await Usuario_cliente.bulkCreate(relaciones, { transaction: t });
            }

            await t.commit(); // confirmar transacción

            // Enviar email
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: usuario.email,
                subject: "Tus credenciales de Obrador WEB",
                html: `
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e9eff6; padding: 30px 15px;">
                    <tr>
                        <td align="center">
                            <table width="615" cellpadding="0" cellspacing="0" style="background-color: #ffffff; font-family: Arial, sans-serif; border-radius: 10px; color: #282964; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 30px 40px;">
                                        <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">¡Hola ${usuario.nombre}!</h2>
                                        <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                                            Te compartimos tus datos de acceso a <strong>Obrador WEB</strong>:
                                        </p>
                                        <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #76C6E2; border-radius: 5px; color: #ffffff; font-size: 15px;">
                                            <tr>
                                                <td>Email: ${usuario.email.toLowerCase()}</td>
                                            </tr>
                                            <tr>
                                                <td>Contraseña: ${generatedPass}</td>
                                            </tr>
                                        </table>
                                        <p style="font-size: 15px; line-height: 1.5; margin: 25px 0 20px;">
                                            Ingresá desde este enlace: <a href="${process.env.APP_URL}" style="color: #76C6E2; text-decoration: none; font-weight: bold;">${process.env.APP_URL}</a>
                                        </p>
                                        <p style="font-size: 13px; color: #555555;">
                                            Recordá cambiar tu contraseña desde la opción <strong>“Mi cuenta”</strong> una vez que inicies sesión.
                                        </p>
                                        <p style="text-align: center; font-size: 12px; color: #999999; margin-top: 40px;">
                                            Obrador WEB © 2025. Todos los derechos reservados.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            `
            };

            await transporter.sendMail(mailOptions);

            return res.status(201).json({
                status: "success",
                message: "Usuario creado correctamente."
            });

        } catch (error) {
            await t.rollback();
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },


    update: async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const usuario = await Usuario.findByPk(req.params.id, { transaction: t });
            if (!usuario) {
                await t.rollback();
                return res.status(404).json({
                    status: "error",
                    message: "Usuario no encontrado."
                });
            }

            const usuario_autenticado = req.usuario;
            const es_admin = usuario_autenticado.tipo_usuario === "ADMINISTRADOR";

            // Validar permisos
            if (!es_admin && usuario_autenticado.usuario_id !== usuario.usuario_id) {
                await t.rollback();
                return res.status(403).json({
                    status: "error",
                    message: "No tienes permiso para modificar este usuario."
                });
            }

            // Validar cambios
            const cambios = Object.keys(req.body).some(key => {
                const actual = typeof usuario[key] === "string" ? usuario[key].toUpperCase() : usuario[key];
                const nuevo = typeof req.body[key] === "string" ? req.body[key].toUpperCase() : req.body[key];
                return actual !== nuevo;
            });

            if (!cambios && !req.body.pass) {
                await t.rollback();
                return res.status(400).json({
                    status: "error",
                    message: "No se realizaron cambios."
                });
            }

            // Validar email y legajo únicos
            if (req.body.email && req.body.email.toUpperCase() !== usuario.email.toUpperCase()) {
                const emailExiste = await Usuario.findOne({ where: { email: req.body.email.toUpperCase() }, transaction: t });
                if (emailExiste) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "El email ya está registrado."
                    });
                }
            }

            if (req.body.legajo && req.body.legajo.toUpperCase() !== usuario.legajo.toUpperCase()) {
                const legajoExiste = await Usuario.findOne({ where: { legajo: req.body.legajo.toUpperCase() }, transaction: t });
                if (legajoExiste) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "El legajo ya está registrado."
                    });
                }
            }

            // Hashear contraseña si viene
            if (req.body.pass) {
                const misma = await bcrypt.compare(req.body.pass, usuario.pass);
                if (misma) {
                    await t.rollback();
                    return res.status(400).json({
                        status: "error",
                        message: "La contraseña es igual a la actual."
                    });
                }
                req.body.pass = await bcrypt.hash(req.body.pass, 10);
            }

            // Actualizar usuario
            await usuario.update(req.body, { transaction: t });

            // Actualizar clientes si es USUARIO
            if (req.body.tipo_usuario_id) {
                const tipo = await Tipo_usuario.findByPk(req.body.tipo_usuario_id, { transaction: t });
                if (tipo.tipo === "USUARIO") {
                    if (Array.isArray(req.body.clientes)) {
                        await Usuario_cliente.destroy({ where: { usuario_id: usuario.usuario_id }, transaction: t });
                        const relaciones = req.body.clientes.map(cliente_id => ({
                            usuario_id: usuario.usuario_id,
                            cliente_id
                        }));
                        await Usuario_cliente.bulkCreate(relaciones, { transaction: t });
                    }
                } else {
                    // Si cambió a ADMIN o SUPERVISOR, eliminar relaciones con clientes
                    await Usuario_cliente.destroy({ where: { usuario_id: usuario.usuario_id }, transaction: t });
                }
            }

            await t.commit();
            return res.status(200).json({
                status: "success",
                message: "Usuario actualizado correctamente."
            });

        } catch (error) {
            await t.rollback();
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    delete: async (req, res) => {
        try {
            const deleted = await Usuario.destroy({
                where: { usuario_id: req.params.id },
            });
            if (deleted) {
                return res.status(204).send();
            } else {
                return res.status(404).json({
                    status: "error",
                    message: 'Usuario no encontrado.'
                });
            }
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    restore: async (req, res) => {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).json({ message: "Usuario no encontrado." });
            }

            const generatedPass = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(generatedPass, 10);

            // Asignar nueva contraseña al usuario
            usuario.pass = hashedPassword;
            await usuario.save();

            // Formato email hecho con tablas para que sea compatible con Outlook
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: usuario.email,
                subject: "Tus credenciales de Obrador WEB",
                html:
                    `
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e9eff6; padding: 30px 15px;">
                        <tr>
                        <td align="center">
                            <table width="615" cellpadding="0" cellspacing="0" style="background-color: #ffffff; font-family: Arial, sans-serif; border-radius: 10px; color: #282964; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 30px 40px;">

                                    <h2 style="margin: 0 0 20px 0; font-size: 24px; font-weight: bold;">¡Hola ${usuario.nombre}!</h2>

                                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
                                        Te compartimos tus datos de acceso a <strong>Obrador WEB</strong>:
                                    </p>

                                    <table width="100%" cellpadding="10" cellspacing="0" style="background-color: #76C6E2; border-radius: 5px; color: #ffffff; font-size: 15px;">
                                        <tr>
                                            <td>Email: ${usuario.email.toLowerCase()}</td>
                                        </tr>
                                        <tr>
                                            <td>Contraseña: ${generatedPass}</td>
                                        </tr>
                                    </table>

                                    <p style="font-size: 15px; line-height: 1.5; margin: 25px 0 20px;">
                                        Ingresá desde este enlace: <a href="${process.env.APP_URL}" style="color: #76C6E2; text-decoration: none; font-weight: bold;">${process.env.APP_URL}</a>
                                    </p>

                                    <p style="font-size: 13px; color: #555555;">
                                        Recordá cambiar tu contraseña desde la opción <strong>“Mi cuenta”</strong> una vez que inicies sesión.
                                    </p>

                                    <p style="text-align: center; font-size: 12px; color: #999999; margin-top: 40px;">
                                        Obrador WEB © 2025. Todos los derechos reservados.
                                    </p>

                                </td>
                            </tr>
                            </table>
                        </td>
                        </tr>
                    </table>
                 `
            };

            await transporter.sendMail(mailOptions);

            return res.status(200).json({
                status: "success",
                message: "Contraseña restaurada correctamente."
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
};


module.exports = api_usuario_controller;
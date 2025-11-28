module.exports = (sequelize, DataTypes) => {

    let alias = 'usuario';
    let cols = {
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        activo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        pass: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        legajo: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        tipo_usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 2
        }
    };
    let config = {
        tableName: "usuario",
        timestamps: false,
        indexes: [
            {
                name: 'idx_usuario_email',
                fields: ['email']
            }
        ]
    }

    const usuario = sequelize.define(alias, cols, config);

    usuario.addHook('beforeCreate', (usuario_instance) => {
        usuario_instance.nombre = usuario_instance.nombre.toUpperCase();
        usuario_instance.email = usuario_instance.email.toUpperCase();
        usuario_instance.legajo = usuario_instance.legajo.toUpperCase();
    });

    usuario.addHook('beforeUpdate', (usuario_instance, options) => {
        if (options.fields.includes('nombre')) {
            usuario_instance.nombre = usuario_instance.nombre.toUpperCase();
        }
        if (options.fields.includes('email')) {
            usuario_instance.email = usuario_instance.email.toUpperCase();
        }
        if (options.fields.includes('legajo')) {
            usuario_instance.legajo = usuario_instance.legajo.toUpperCase();
        }
    });

    usuario.associate = (models) => {
        usuario.belongsTo(models.tipo_usuario, {
            foreignKey: 'tipo_usuario_id',
            as: 'tipo_usuario',
            onDelete: 'CASCADE'
        });
        usuario.hasMany(models.usuario_cliente, {
            foreignKey: 'usuario_id',
            as: 'clientes'
        });
    };

    return usuario;
};
module.exports = (sequelize, DataTypes) => {
    
    let alias = 'tipo_usuario';
    let cols = {
        tipo_usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tipo: {
            type: DataTypes.ENUM('ADMINISTRADOR', 'USUARIO'),
            allowNull: false
        }
    };
    let config = {
        tableName: "tipo_usuario",
        timestamps: false
    }

    const tipo_usuario = sequelize.define(alias, cols, config);

    tipo_usuario.addHook('beforeCreate', (tipo_usuario_instance) => {
        tipo_usuario_instance.tipo = tipo_usuario_instance.tipo.toUpperCase();
    });

    tipo_usuario.addHook('beforeUpdate', (tipo_usuario_instance, options) => {
        if (options.fields.includes('tipo')) {
            tipo_usuario_instance.tipo = tipo_usuario_instance.tipo.toUpperCase();
        }
    });
    
    return tipo_usuario;
};
module.exports = (sequelize, DataTypes) => {

    let alias = 'cliente';
    let cols = {
        cliente_id: {
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
        codigo: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false,
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        exportado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        operativo: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    };
    let config = {
        tableName: "cliente",
        timestamps: false
    }

    const cliente = sequelize.define(alias, cols, config);

    cliente.addHook('beforeCreate', (cliente_instance) => {
        cliente_instance.descripcion = cliente_instance.descripcion.toUpperCase();
        if (cliente_instance.codigo) {
            cliente_instance.codigo = cliente_instance.codigo.toUpperCase();
        }
    });

    cliente.addHook('beforeUpdate', (cliente_instance, options) => {
        if (options.fields.includes('descripcion')) {
            cliente_instance.descripcion = cliente_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('codigo')) {
            cliente_instance.codigo = cliente_instance.codigo.toUpperCase();
        }
    });

    cliente.associate = (models) => {
        cliente.hasMany(models.usuario_cliente, {
            foreignKey: 'cliente_id',
            as: 'usuarios'
        });
    };

    return cliente;
};
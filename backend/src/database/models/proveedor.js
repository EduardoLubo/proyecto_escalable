module.exports = (sequelize, DataTypes) => {

    let alias = 'proveedor';
    let cols = {
        proveedor_id: {
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
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    let config = {
        tableName: "proveedor",
        timestamps: false,
        indexes: [
            {
                name: 'idx_proveedor_cliente',
                fields: ['cliente_id']
            }
        ]
    }

    const proveedor = sequelize.define(alias, cols, config);

    proveedor.addHook('beforeCreate', (proveedor_instance) => {
        proveedor_instance.descripcion = proveedor_instance.descripcion.toUpperCase();
        if (proveedor_instance.codigo) {
            proveedor_instance.codigo = proveedor_instance.codigo.toUpperCase();
        }
    });

    proveedor.addHook('beforeUpdate', (proveedor_instance, options) => {
        if (options.fields.includes('descripcion')) {
            proveedor_instance.descripcion = proveedor_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('codigo')) {
            proveedor_instance.codigo = proveedor_instance.codigo.toUpperCase();
        }
    });

    proveedor.associate = (models) => {
        proveedor.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
        proveedor.hasOne(models.ubicacion, {
            foreignKey: 'proveedor_id',
            as: 'ubicacion'
        });
    };

    return proveedor;
};
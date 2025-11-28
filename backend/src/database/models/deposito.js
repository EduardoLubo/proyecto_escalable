module.exports = (sequelize, DataTypes) => {

    let alias = 'deposito';
    let cols = {
        deposito_id: {
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
        tableName: "deposito",
        timestamps: false,
        indexes: [
            {
                name: 'idx_deposito_cliente',
                fields: ['cliente_id']
            }
        ]
    }

    const deposito = sequelize.define(alias, cols, config);

    deposito.addHook('beforeCreate', (deposito_instance) => {
        deposito_instance.descripcion = deposito_instance.descripcion.toUpperCase();
        if (deposito_instance.codigo) {
            deposito_instance.codigo = deposito_instance.codigo.toUpperCase();
        }
    });

    deposito.addHook('beforeUpdate', (deposito_instance, options) => {
        if (options.fields.includes('descripcion')) {
            deposito_instance.descripcion = deposito_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('codigo')) {
            deposito_instance.codigo = deposito_instance.codigo.toUpperCase();
        }
    });

    deposito.associate = (models) => {
        deposito.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
        deposito.hasOne(models.ubicacion, {
            foreignKey: 'deposito_id',
            as: 'ubicacion'
        });
    };

    return deposito;
};
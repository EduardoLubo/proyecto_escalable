module.exports = (sequelize, DataTypes) => {
    
    let alias = 'ubicacion';
    let cols = {
        ubicacion_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tipo: {
            type: DataTypes.ENUM('PROVEEDOR', 'DEPOSITO', 'OBRA'),
            allowNull: false
        },
        proveedor_id: {
            type: DataTypes.INTEGER
        },
        deposito_id: {
            type: DataTypes.INTEGER
        },
        obra_id: {
            type: DataTypes.INTEGER
        },
    };
    let config = {
        tableName: "ubicacion",
        timestamps: false,
        indexes: [
            {
                name: 'idx_ubicacion',
                fields: ['tipo','proveedor_id','deposito_id','obra_id']
            }
        ]
    }

    const ubicacion = sequelize.define(alias, cols, config);

    ubicacion.addHook('beforeCreate', (ubicacion_instance) => {
        ubicacion_instance.tipo = ubicacion_instance.tipo.toUpperCase();
    });

    ubicacion.addHook('beforeUpdate', (ubicacion_instance, options) => {
        if (options.fields.includes('tipo')) {
            ubicacion_instance.tipo = ubicacion_instance.tipo.toUpperCase();
        }
    });

    ubicacion.associate = (models) => {
        ubicacion.belongsTo(models.proveedor, {
            foreignKey: 'proveedor_id',
            as: 'proveedor',
            onDelete: 'CASCADE'
        });
        ubicacion.belongsTo(models.deposito, {
            foreignKey: 'deposito_id',
            as: 'deposito',
            onDelete: 'CASCADE'
        });
        ubicacion.belongsTo(models.obra, {
            foreignKey: 'obra_id',
            as: 'obra',
            onDelete: 'CASCADE'
        });
    };
    
    return ubicacion;
};
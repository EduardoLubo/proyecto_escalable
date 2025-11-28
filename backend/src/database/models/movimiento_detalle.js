module.exports = (sequelize, DataTypes) => {

    let alias = 'movimiento_detalle';
    let cols = {
        movimiento_detalle_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        material_id: {
            type: DataTypes.INTEGER
        },
        cantidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        movimiento_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    let config = {
        tableName: "movimiento_detalle",
        timestamps: false,
        indexes: [
            {
                name: 'idx_movimiento_detalle_movimiento',
                fields: ['movimiento_id']
            }
        ]
    }

    const movimiento_detalle = sequelize.define(alias, cols, config);

    movimiento_detalle.associate = (models) => {
        movimiento_detalle.belongsTo(models.material, {
            foreignKey: 'material_id',
            as: 'material',
            onDelete: 'SET NULL'
        });
        movimiento_detalle.belongsTo(models.movimiento, {
            foreignKey: 'movimiento_id',
            as: 'movimiento',
            onDelete: 'CASCADE'
        });
        movimiento_detalle.hasOne(models.movimiento_detalle_serial, {
            foreignKey: 'movimiento_detalle_id',
            as: 'movimiento_detalle_serial'
        });
    };

    return movimiento_detalle;
};
module.exports = (sequelize, DataTypes) => {

    let alias = 'movimiento_detalle_serial';
    let cols = {
        movimiento_detalle_serial_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        movimiento_detalle_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        material_serial_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    };
    let config = {
        tableName: "movimiento_detalle_serial",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['movimiento_detalle_id', 'material_serial_id']
            }
        ]
    }

    const movimiento_detalle_serial = sequelize.define(alias, cols, config);

    movimiento_detalle_serial.associate = (models) => {
        movimiento_detalle_serial.belongsTo(models.movimiento_detalle, {
            foreignKey: 'movimiento_detalle_id',
            as: 'movimiento_detalle',
            onDelete: 'CASCADE'
        });
        movimiento_detalle_serial.belongsTo(models.material_serial, {
            foreignKey: 'material_serial_id',
            as: 'material',
            onDelete: 'CASCADE'
        });
    };

    return movimiento_detalle_serial;
};
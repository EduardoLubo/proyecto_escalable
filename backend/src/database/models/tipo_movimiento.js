module.exports = (sequelize, DataTypes) => {
    
    let alias = 'tipo_movimiento';
    let cols = {
        tipo_movimiento_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        tipo: {
            type: DataTypes.ENUM('ENTRADA', 'SALIDA'),
            allowNull: false
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        }
    };
    let config = {
        tableName: "tipo_movimiento",
        timestamps: false
    }

    const tipo_movimiento = sequelize.define(alias, cols, config);

    tipo_movimiento.addHook('beforeCreate', (tipo_movimiento_instance) => {
        tipo_movimiento_instance.descripcion = tipo_movimiento_instance.descripcion.toUpperCase();
    });

    tipo_movimiento.addHook('beforeUpdate', (tipo_movimiento_instance, options) => {
        if (options.fields.includes('descripcion')) {
            tipo_movimiento_instance.descripcion = tipo_movimiento_instance.descripcion.toUpperCase();
        }
    });
    
    return tipo_movimiento;
};
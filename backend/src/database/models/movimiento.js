module.exports = (sequelize, DataTypes) => {

    let alias = 'movimiento';
    let cols = {
        movimiento_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        descripcion: {
            type: DataTypes.STRING(255),
        },
        desde_ubicacion_id: {
            type: DataTypes.INTEGER
        },
        hacia_ubicacion_id: {
            type: DataTypes.INTEGER
        },
        reserva: {
            type: DataTypes.STRING(255),
        },
        desde_cuadrilla_id: {
            type: DataTypes.INTEGER
        },
        hacia_cuadrilla_id: {
            type: DataTypes.INTEGER
        },
        tipo_movimiento_id: {
            type: DataTypes.INTEGER
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        auditoria_usuario_id: {
            type: DataTypes.INTEGER
        }
    };
    let config = {
        tableName: "movimiento",
        timestamps: true,
        createdAt: 'auditoria_alta',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_movimiento_movimiento_id',
                fields: ['movimiento_id']
            },
            {
                name: 'idx_movimiento_usuario',
                fields: ['auditoria_usuario_id']
            },
            {
                name: 'idx_movimiento_reserva',
                fields: ['reserva']
            },
            {
                name: 'idx_movimiento_cliente',
                fields: ['cliente_id']
            },
        ]
    }

    const movimiento = sequelize.define(alias, cols, config);

    movimiento.addHook('beforeCreate', (movimiento_instance) => {
        if (movimiento_instance.descripcion) {
            movimiento_instance.descripcion = movimiento_instance.descripcion.toUpperCase();
        }
        if (movimiento_instance.reserva) {
            movimiento_instance.reserva = movimiento_instance.reserva.toUpperCase();
        }
    });

    movimiento.addHook('beforeUpdate', (movimiento_instance, options) => {
        if (options.fields.includes('descripcion')) {
            movimiento_instance.descripcion = movimiento_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('reserva')) {
            movimiento_instance.reserva = movimiento_instance.reserva.toUpperCase();
        }
    });

    movimiento.associate = (models) => {
        movimiento.belongsTo(models.tipo_movimiento, {
            foreignKey: 'tipo_movimiento_id',
            as: 'tipo_movimiento',
            onDelete: 'SET NULL'
        });
        movimiento.belongsTo(models.cuadrilla, {
            foreignKey: 'desde_cuadrilla_id',
            as: 'desde_cuadrilla',
            onDelete: 'SET NULL'
        });
        movimiento.belongsTo(models.cuadrilla, {
            foreignKey: 'hacia_cuadrilla_id',
            as: 'hacia_cuadrilla',
            onDelete: 'SET NULL'
        });
        movimiento.belongsTo(models.usuario, {
            foreignKey: 'auditoria_usuario_id',
            as: 'usuario',
            onDelete: 'SET NULL'
        });
        movimiento.belongsTo(models.ubicacion, {
            foreignKey: 'desde_ubicacion_id',
            as: 'desde_ubicacion',
            onDelete: 'SET NULL'
        });
        movimiento.belongsTo(models.ubicacion, {
            foreignKey: 'hacia_ubicacion_id',
            as: 'hacia_ubicacion',
            onDelete: 'SET NULL'
        });
        movimiento.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
        movimiento.hasMany(models.movimiento_detalle, {
            foreignKey: 'movimiento_id',
            as: 'movimiento_detalles'
        });
    };

    return movimiento;
};
module.exports = (sequelize, DataTypes) => {

    let alias = 'material_serial_estado_historico';
    let cols = {
        material_serial_estado_historico_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        material_serial_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        estado: {
            type: DataTypes.ENUM('DISPONIBLE', 'ASIGNADO', 'INSTALADO', 'BAJA'),
            allowNull: false,
            defaultValue: 'DISPONIBLE'
        },
        ubicacion_id: {
            type: DataTypes.INTEGER
        },
        cuadrilla_id: {
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
        tableName: "material_serial_estado_historico",
        timestamps: true,
        createdAt: 'auditoria_alta',
        updatedAt: false,
        indexes: [
            {
                name: 'idx_material_serial_historial',
                fields: ['material_serial_id']
            }
        ]
    }

    const material_serial_estado_historico = sequelize.define(alias, cols, config);

    material_serial_estado_historico.associate = (models) => {
        material_serial_estado_historico.belongsTo(models.material_serial, {
            foreignKey: 'material_serial_id',
            as: 'material_serial',
            onDelete: 'CASCADE'
        });
        material_serial_estado_historico.belongsTo(models.usuario, {
            foreignKey: 'auditoria_usuario_id',
            as: 'usuario',
            onDelete: 'SET NULL'
        });
        material_serial_estado_historico.belongsTo(models.ubicacion, {
            foreignKey: 'ubicacion_id',
            as: 'ubicacion'
        });
        material_serial_estado_historico.belongsTo(models.cuadrilla, {
            foreignKey: 'cuadrilla_id',
            as: 'cuadrilla'
        });
        material_serial_estado_historico.belongsTo(models.tipo_movimiento, {
            foreignKey: 'tipo_movimiento_id',
            as: 'tipo_movimiento'
        });
        material_serial_estado_historico.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
    };

    return material_serial_estado_historico;
};
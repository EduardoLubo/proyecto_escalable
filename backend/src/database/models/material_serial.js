module.exports = (sequelize, DataTypes) => {

    let alias = 'material_serial';
    let cols = {
        material_serial_id: {
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
        material_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        serie: {
            type: DataTypes.STRING(255),
            allowNull: false
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
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    let config = {
        tableName: "material_serial",
        timestamps: false,
        indexes: [
            {
                name: 'idx_material_serial_numero',
                fields: ['serie']
            },
            {
                name: 'idx_material_serial_estado',
                fields: ['estado']
            },
            {
                name: 'idx_material_serial_cliente',
                fields: ['cliente_id']
            },
            {
                unique: true,
                fields: ['material_id', 'serie', 'cliente_id']
            }
        ]
    }

    const material_serial = sequelize.define(alias, cols, config);

    material_serial.addHook('beforeCreate', (material_serial_instance) => {
        material_serial_instance.serie = material_serial_instance.serie.toUpperCase();
    });

    material_serial.addHook('beforeUpdate', (material_serial_instance, options) => {
        if (options.fields.includes('serie')) {
            material_serial_instance.serie = material_serial_instance.serie.toUpperCase();
        }
    });

    material_serial.associate = (models) => {
        material_serial.belongsTo(models.material, {
            foreignKey: 'material_id',
            as: 'material',
            onDelete: 'CASCADE'
        });
        material_serial.belongsTo(models.ubicacion, {
            foreignKey: 'ubicacion_id',
            as: 'ubicacion'
        });
        material_serial.belongsTo(models.cuadrilla, {
            foreignKey: 'cuadrilla_id',
            as: 'cuadrilla'
        });
        material_serial.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
    };

    return material_serial;
};
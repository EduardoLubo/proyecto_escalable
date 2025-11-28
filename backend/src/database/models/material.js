module.exports = (sequelize, DataTypes) => {

    let alias = 'material';
    let cols = {
        material_id: {
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
            allowNull: false,
            unique: true
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        serializado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        unidad_medida_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    let config = {
        tableName: "material",
        timestamps: false,
        indexes: [
            {
                name: 'idx_material_codigo',
                fields: ['codigo']
            },
            {
                name: 'idx_material_descripcion',
                fields: ['descripcion']
            }
        ]
    }

    const material = sequelize.define(alias, cols, config);

    material.addHook('beforeCreate', (material_instance) => {
        material_instance.descripcion = material_instance.descripcion.toUpperCase();
        if (material_instance.codigo) {
            material_instance.codigo = material_instance.codigo.toUpperCase();
        }
    });

    material.addHook('beforeUpdate', (material_instance, options) => {
        if (options.fields.includes('descripcion')) {
            material_instance.descripcion = material_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('codigo')) {
            material_instance.codigo = material_instance.codigo.toUpperCase();
        }
    });

    material.associate = (models) => {
        material.belongsTo(models.unidad_medida, {
            foreignKey: 'unidad_medida_id',
            as: 'unidad_medida',
            onDelete: 'SET NULL'
        });
    };

    return material;
};
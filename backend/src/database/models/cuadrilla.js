module.exports = (sequelize, DataTypes) => {

    let alias = 'cuadrilla';
    let cols = {
        cuadrilla_id: {
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
        },
        psmcuadrilla_id: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        exportado: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    };
    let config = {
        tableName: "cuadrilla",
        timestamps: false,
        indexes: [
            {
                name: 'idx_cuadrilla_cliente',
                fields: ['cliente_id']
            }
        ]
    }

    const cuadrilla = sequelize.define(alias, cols, config);

    cuadrilla.addHook('beforeCreate', (cuadrilla_instance) => {
        cuadrilla_instance.descripcion = cuadrilla_instance.descripcion.toUpperCase();
        if (cuadrilla_instance.codigo) {
            cuadrilla_instance.codigo = cuadrilla_instance.codigo.toUpperCase();
        }
    });

    cuadrilla.addHook('beforeUpdate', (cuadrilla_instance, options) => {
        if (options.fields.includes('descripcion')) {
            cuadrilla_instance.descripcion = cuadrilla_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('codigo')) {
            cuadrilla_instance.codigo = cuadrilla_instance.codigo.toUpperCase();
        }
    });

    cuadrilla.associate = (models) => {
        cuadrilla.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
        cuadrilla.hasMany(models.cuadrilla_personal, {
            foreignKey: 'cuadrilla_id',
            as: 'cuadrilla_personal'
        });
    };

    return cuadrilla;
};
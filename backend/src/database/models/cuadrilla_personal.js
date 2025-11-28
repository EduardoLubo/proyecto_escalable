module.exports = (sequelize, DataTypes) => {
    
    let alias = 'cuadrilla_personal';
    let cols = {
        cuadrilla_personal_id: {
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
        rol: {
            type: DataTypes.ENUM('JEFE DE CUADRILLA', 'AYUDANTE'),
            allowNull: false
        },
        cuadrilla_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        personal_cuadrilla_id: {
            type: DataTypes.INTEGER
        }
    };
    let config = {
        tableName: "cuadrilla_personal",
        timestamps: false
    }

    const cuadrilla_personal = sequelize.define(alias, cols, config);

    cuadrilla_personal.addHook('beforeCreate', (cuadrilla_personal_instance) => {
        cuadrilla_personal_instance.rol = cuadrilla_personal_instance.rol.toUpperCase();
    });

    cuadrilla_personal.addHook('beforeUpdate', (cuadrilla_personal_instance, options) => {
        if (options.fields.includes('rol')) {
            cuadrilla_personal_instance.rol = cuadrilla_personal_instance.rol.toUpperCase();
        }
    });

    cuadrilla_personal.associate = (models) => {
        cuadrilla_personal.belongsTo(models.cuadrilla, {
            foreignKey: 'cuadrilla_id',
            as: 'cuadrilla',
            onDelete: 'CASCADE'
        });
        cuadrilla_personal.belongsTo(models.personal_cuadrilla, {
            foreignKey: 'personal_cuadrilla_id',
            as: 'personal_cuadrilla',
            onDelete: 'SET NULL'
        });
    };
    
    return cuadrilla_personal;
};
module.exports = (sequelize, DataTypes) => {
    
    let alias = 'personal_cuadrilla';
    let cols = {
        personal_cuadrilla_id: {
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
        nombre: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        legajo: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false
        }
    };
    let config = {
        tableName: "personal_cuadrilla",
        timestamps: false
    }

    const personal_cuadrilla = sequelize.define(alias, cols, config);

    personal_cuadrilla.addHook('beforeCreate', (personal_cuadrilla_instance) => {
        personal_cuadrilla_instance.nombre = personal_cuadrilla_instance.nombre.toUpperCase();
        personal_cuadrilla_instance.legajo = personal_cuadrilla_instance.legajo.toUpperCase();
    });

    personal_cuadrilla.addHook('beforeUpdate', (personal_cuadrilla_instance, options) => {
        if (options.fields.includes('nombre')) {
            personal_cuadrilla_instance.nombre = personal_cuadrilla_instance.nombre.toUpperCase();
        }
        if (options.fields.includes('legajo')) {
            personal_cuadrilla_instance.legajo = personal_cuadrilla_instance.legajo.toUpperCase();
        }
    });
    
    return personal_cuadrilla;
};
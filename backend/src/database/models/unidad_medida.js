module.exports = (sequelize, DataTypes) => {
    
    let alias = 'unidad_medida';
    let cols = {
        unidad_medida_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        descripcion: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        simbolo: {
            type: DataTypes.STRING(255),
            unique: true,
            allowNull: false
        }
    };
    let config = {
        tableName: "unidad_medida",
        timestamps: false
    }

    const unidad_medida = sequelize.define(alias, cols, config);

    unidad_medida.addHook('beforeCreate', (unidad_medida_instance) => {
        unidad_medida_instance.descripcion = unidad_medida_instance.descripcion.toUpperCase();
        if (unidad_medida_instance.simbolo) {
            unidad_medida_instance.simbolo = unidad_medida_instance.simbolo.toUpperCase();
        }
    });

    unidad_medida.addHook('beforeUpdate', (unidad_medida_instance, options) => {
        if (options.fields.includes('descripcion')) {
            unidad_medida_instance.descripcion = unidad_medida_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('simbolo')) {
            unidad_medida_instance.simbolo = unidad_medida_instance.simbolo.toUpperCase();
        }
    });
    
    return unidad_medida;
};
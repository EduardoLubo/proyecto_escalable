module.exports = (sequelize, DataTypes) => {

    let alias = 'obra';
    let cols = {
        obra_id: {
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
        pep: {
            type: DataTypes.STRING(255)
        },
        reserva: {
            type: DataTypes.STRING(255)
        },
        zona: {
            type: DataTypes.STRING(255)
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    let config = {
        tableName: "obra",
        timestamps: false,
        indexes: [
            {
                name: 'idx_obra_pep',
                fields: ['pep']
            },
            {
                name: 'idx_obra_reserva',
                fields: ['reserva']
            }
        ]
    }

    const obra = sequelize.define(alias, cols, config);

    obra.addHook('beforeCreate', (obra_instance) => {
        obra_instance.descripcion = obra_instance.descripcion.toUpperCase();
        if (obra_instance.codigo) {
            obra_instance.codigo = obra_instance.codigo.toUpperCase();
        }
        if (obra_instance.pep) {
            obra_instance.pep = obra_instance.pep.toUpperCase();
        }
        if (obra_instance.reserva) {
            obra_instance.reserva = obra_instance.reserva.toUpperCase();
        }
        if (obra_instance.zona) {
            obra_instance.zona = obra_instance.zona.toUpperCase();
        }
    });

    obra.addHook('beforeUpdate', (obra_instance, options) => {
        if (options.fields.includes('descripcion')) {
            obra_instance.descripcion = obra_instance.descripcion.toUpperCase();
        }
        if (options.fields.includes('codigo')) {
            obra_instance.codigo = obra_instance.codigo.toUpperCase();
        }
        if (options.fields.includes('pep')) {
            obra_instance.pep = obra_instance.pep.toUpperCase();
        }
        if (options.fields.includes('reserva')) {
            obra_instance.reserva = obra_instance.reserva.toUpperCase();
        }
        if (options.fields.includes('zona')) {
            obra_instance.zona = obra_instance.zona.toUpperCase();
        }
    });

    obra.associate = (models) => {
        obra.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
        obra.hasOne(models.ubicacion, {
            foreignKey: 'obra_id',
            as: 'ubicacion'
        });
    };

    return obra;
};
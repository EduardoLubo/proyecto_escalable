module.exports = (sequelize, DataTypes) => {

    let alias = 'stock';
    let cols = {
        stock_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        material_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cantidad: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        cuadrilla_id: {
            type: DataTypes.INTEGER
        },
        ubicacion_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };
    let config = {
        tableName: "stock",
        timestamps: false,
        indexes: [
            {
                name: 'idx_stock',
                fields: ['material_id', 'ubicacion_id', 'cuadrilla_id']
            },
            {
                name: 'idx_stock_cliente',
                fields: ['cliente_id']
            },
            {
                unique: true,
                fields: ['material_id', 'ubicacion_id', 'cuadrilla_id']
            }
        ]
    }

    const stock = sequelize.define(alias, cols, config);

    stock.associate = (models) => {
        stock.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
        stock.belongsTo(models.material, {
            foreignKey: 'material_id',
            as: 'material',
            onDelete: 'CASCADE'
        });
        stock.belongsTo(models.cuadrilla, {
            foreignKey: 'cuadrilla_id',
            as: 'cuadrilla',
            onDelete: 'SET NULL'
        });
        stock.belongsTo(models.ubicacion, {
            foreignKey: 'ubicacion_id',
            as: 'ubicacion',
            onDelete: 'CASCADE'
        });
    };

    return stock;
};
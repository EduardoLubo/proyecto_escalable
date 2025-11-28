module.exports = (sequelize, DataTypes) => {

    let alias = 'usuario_cliente';
    let cols = {
        usuario_cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        usuario_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        cliente_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    };
    let config = {
        tableName: "usuario_cliente",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['usuario_id', 'cliente_id']
            }
        ]
    }

    const usuario_cliente = sequelize.define(alias, cols, config);

    usuario_cliente.associate = (models) => {
        usuario_cliente.belongsTo(models.usuario, {
            foreignKey: 'usuario_id',
            as: 'usuario',
            onDelete: 'CASCADE'
        });
        usuario_cliente.belongsTo(models.cliente, {
            foreignKey: 'cliente_id',
            as: 'cliente',
            onDelete: 'CASCADE'
        });
    };

    return usuario_cliente;
};
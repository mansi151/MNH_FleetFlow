const { DataTypes } = require("sequelize");
const { sequelize } = require("../sequelize");

const MaintenanceLog = sequelize.define(
    "MaintenanceLog",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        vehicleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "vehicles", key: "id" },
        },
        serviceDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        cost: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("New", "In Progress", "Completed"),
            allowNull: false,
            defaultValue: "New",
        },
    },
    {
        tableName: "maintenance_logs",
        timestamps: true,
    }
);

module.exports = MaintenanceLog;

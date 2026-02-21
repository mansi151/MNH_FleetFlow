const { DataTypes } = require("sequelize");
const { sequelize } = require("../sequelize");

const Trip = sequelize.define(
    "Trip",
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
        driverId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "drivers", key: "id" },
        },
        cargoWeight: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("Draft", "Dispatched", "Completed", "Cancelled"),
            allowNull: false,
            defaultValue: "Draft",
        },
        startLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endLocation: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dispatchDate: {
            type: DataTypes.DATE,
        },
        completionDate: {
            type: DataTypes.DATE,
        },
        startOdometer: {
            type: DataTypes.FLOAT,
        },
        endOdometer: {
            type: DataTypes.FLOAT,
        },
    },
    {
        tableName: "trips",
        timestamps: true,
    }
);

module.exports = Trip;

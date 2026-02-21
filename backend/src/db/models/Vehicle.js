const { DataTypes } = require("sequelize");
const { sequelize } = require("../sequelize");

const Vehicle = sequelize.define(
    "Vehicle",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        model: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        licensePlate: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(val) { this.setDataValue("licensePlate", val.toUpperCase().trim()); },
        },
        maxLoadCapacity: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        odometer: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM("Available", "On Trip", "In Shop", "Retired"),
            allowNull: false,
            defaultValue: "Available",
        },
        vehicleType: {
            type: DataTypes.ENUM("Truck", "Van", "Bike"),
            allowNull: false,
            defaultValue: "Van",
        },
    },
    {
        tableName: "vehicles",
        timestamps: true,
    }
);

module.exports = Vehicle;

const { DataTypes } = require("sequelize");
const { sequelize } = require("../sequelize");

const Driver = sequelize.define(
    "Driver",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // ── Driver identity — standalone, no user account required ──────────
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        licenseNumber: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        licenseExpiry: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        // Array of vehicle types this driver is licensed for: ["Van","Truck","Bike"]
        licenseCategory: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
        safetyScore: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
        },
        completionRate: {
            type: DataTypes.INTEGER,
            defaultValue: 100,
        },
        complaints: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        driverStatus: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Off Duty",
            validate: { isIn: [["On Duty", "Off Duty", "Suspended", "On Trip"]] },
        },
    },
    {
        tableName: "drivers",
        timestamps: true,
    }
);

module.exports = Driver;

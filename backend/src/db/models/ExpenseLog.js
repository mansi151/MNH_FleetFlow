const { DataTypes } = require("sequelize");
const { sequelize } = require("../sequelize");

const ExpenseLog = sequelize.define(
    "ExpenseLog",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        vehicleId: {
            type: DataTypes.INTEGER,
            references: { model: "vehicles", key: "id" },
        },
        tripId: {
            type: DataTypes.INTEGER,
            references: { model: "trips", key: "id" },
        },
        expenseType: {
            type: DataTypes.ENUM("Fuel", "Maintenance", "Toll", "Other"),
            allowNull: false,
        },
        amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        miscAmount: {
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
        distance: {
            type: DataTypes.FLOAT,
        },
        driverName: {
            type: DataTypes.STRING,
        },
        liters: {
            type: DataTypes.FLOAT,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM("Done", "Pending", "Cancelled"),
            defaultValue: "Done",
        },
    },
    {
        tableName: "expense_logs",
        timestamps: true,
    }
);

module.exports = ExpenseLog;

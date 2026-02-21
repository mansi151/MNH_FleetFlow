const { DataTypes } = require("sequelize");
const { sequelize } = require("../sequelize");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            set(val) { this.setDataValue("email", val.toLowerCase().trim()); },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("manager", "dispatcher", "safety_officer", "financial_analyst"),
            allowNull: false,
            defaultValue: "manager",
        },
        // tokens stored as JSONB array: [{token: "..."}]
        tokens: {
            type: DataTypes.JSONB,
            defaultValue: [],
        },
    },
    {
        tableName: "users",
        timestamps: true,
    }
);

module.exports = User;

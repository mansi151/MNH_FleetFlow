const { Sequelize } = require("sequelize");
const chalk = require("chalk");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME || "FleetFlow",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS || "root",
    {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        dialect: "postgres",
        logging: false,   // set to console.log to debug SQL
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

/**
 * Initialise connection + sync all models (creates tables if missing).
 * The callback is called once the DB is ready – same interface as the old mongoose.js.
 */
const initConnection = async (callback) => {
    try {
        await sequelize.authenticate();
        console.log(chalk.blue.bold("Database Connection Established ✅"));

        // Import models so their associations are registered before sync
        require("./models/User");
        require("./models/Vehicle");
        require("./models/Driver");
        require("./models/Trip");
        require("./models/MaintenanceLog");
        require("./models/ExpenseLog");

        await sequelize.sync({ alter: true });   // creates / alters tables safely
        console.log(chalk.blue("Tables synced ✅"));

        callback();
    } catch (err) {
        console.log(chalk.bgRed.bold("⚠️  [Database ERROR]") + chalk.red(err));
        process.exit(1);
    }
};

module.exports = { sequelize, initConnection };

const ExpenseLog = require("../models/ExpenseLog");
const Vehicle = require("../models/Vehicle");
const Trip = require("../models/Trip");
const { TableFields } = require("../../utils/constants");
const { sequelize } = require("../sequelize");
const { QueryTypes } = require("sequelize");

// Associations
ExpenseLog.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });
ExpenseLog.belongsTo(Trip, { foreignKey: "tripId", as: "trip" });

class ExpenseService {
    static logExpense = async (data) => {
        return await ExpenseLog.create(data);
    };

    static getExpensesByVehicle = (vehicleId) =>
        new ProjectionBuilder(async () => {
            return await ExpenseLog.findAll({
                where: { vehicleId },
                include: [
                    { model: Vehicle, as: "vehicle" },
                    { model: Trip, as: "trip" },
                ],
                order: [["date", "DESC"]],
            });
        });

    static getAllExpenses = () =>
        new ProjectionBuilder(async () => {
            return await ExpenseLog.findAll({
                include: [
                    { model: Vehicle, as: "vehicle" },
                    { model: Trip, as: "trip" },
                ],
                order: [["date", "DESC"]],
            });
        });

    static getTotalOperationalCost = async (vehicleId) => {
        const [row] = await sequelize.query(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM expense_logs WHERE "vehicleId" = :vehicleId`,
            { replacements: { vehicleId }, type: QueryTypes.SELECT }
        );
        return parseFloat(row.total) || 0;
    };

    static getFuelSummaryByVehicle = async () => {
        return await sequelize.query(
            `SELECT "vehicleId",
                    SUM(amount)  AS "totalFuelCost",
                    SUM(liters)  AS "totalLiters",
                    COUNT(*)     AS "tripCount"
             FROM expense_logs
             WHERE "expenseType" = 'Fuel'
             GROUP BY "vehicleId"`,
            { type: QueryTypes.SELECT }
        );
    };
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        this.withBasicInfo = () => this;
        this.execute = async () => {
            const result = await methodToExecute();
            if (!result) return result;
            if (Array.isArray(result)) {
                return result.map(e => {
                    const obj = e.toJSON ? e.toJSON() : { ...e };
                    // Map associations to field names frontend expects
                    if (obj.vehicle) { obj.vehicleId = obj.vehicle; delete obj.vehicle; }
                    if (obj.trip) { obj.tripId = obj.trip; delete obj.trip; }
                    return obj;
                });
            }
            const obj = result.toJSON ? result.toJSON() : { ...result };
            if (obj.vehicle) { obj.vehicleId = obj.vehicle; delete obj.vehicle; }
            if (obj.trip) { obj.tripId = obj.trip; delete obj.trip; }
            return obj;
        };
    }
};

module.exports = ExpenseService;

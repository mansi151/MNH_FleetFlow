const ExpenseService = require("../../db/services/ExpenseService");

exports.logExpense = async (req, res) => {
    return await ExpenseService.logExpense(req.body);
};

exports.getVehicleExpenses = async (req, res) => {
    return await ExpenseService.getExpensesByVehicle(req.params.vehicleId).withBasicInfo().execute();
};

exports.getAllExpenses = async (req, res) => {
    return await ExpenseService.getAllExpenses().withBasicInfo().execute();
};

exports.getTotalCost = async (req, res) => {
    const total = await ExpenseService.getTotalOperationalCost(req.params.vehicleId);
    return { total_operational_cost: total };
};

exports.getFuelSummary = async (req, res) => {
    return await ExpenseService.getFuelSummaryByVehicle();
};

const MaintenanceService = require("../../db/services/MaintenanceService");

exports.logMaintenance = async (req, res) => {
    return await MaintenanceService.logMaintenance(req.body);
};

exports.completeMaintenance = async (req, res) => {
    return await MaintenanceService.completeMaintenance(req.params.id);
};

exports.getAllLogs = async (req, res) => {
    return await MaintenanceService.getAllLogs().withBasicInfo().execute();
};

exports.getVehicleLogs = async (req, res) => {
    return await MaintenanceService.getLogsForVehicle(req.params.vehicleId).withBasicInfo().execute();
};

const MaintenanceLog = require("../models/MaintenanceLog");
const Vehicle = require("../models/Vehicle");
const { TableFields } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");

// Associations
Vehicle.hasMany(MaintenanceLog, { foreignKey: "vehicleId", as: "maintenanceLogs" });
MaintenanceLog.belongsTo(Vehicle, { foreignKey: "vehicleId", as: "vehicle" });

class MaintenanceService {
    static logMaintenance = async (data) => {
        const vehicle = await Vehicle.findByPk(data[TableFields.maintenanceVehicleId] || data.vehicleId);
        if (!vehicle) throw new ValidationError("Vehicle not found");

        const log = await MaintenanceLog.create(data);

        await vehicle.update({ status: "In Shop" });

        return log;
    };

    static completeMaintenance = async (logId) => {
        const log = await MaintenanceLog.findByPk(logId);
        if (!log) throw new ValidationError("Log not found");

        await log.update({ status: "Completed" });

        const vehicle = await Vehicle.findByPk(log.vehicleId);
        if (vehicle) {
            await vehicle.update({ status: "Available" });
        }

        return log;
    };

    static getLogsForVehicle = (vehicleId) =>
        new ProjectionBuilder(async () => {
            return await MaintenanceLog.findAll({
                where: { vehicleId },
                order: [["serviceDate", "DESC"]],
            });
        });

    static getAllLogs = () =>
        new ProjectionBuilder(async () => {
            return await MaintenanceLog.findAll({
                include: [{ model: Vehicle, as: "vehicle" }],
                order: [["serviceDate", "DESC"]],
            });
        });
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        this.withBasicInfo = () => this;
        this.execute = async () => {
            const result = await methodToExecute();
            if (!result) return result;
            if (Array.isArray(result)) return result.map(l => {
                const obj = l.toJSON ? l.toJSON() : { ...l };
                // normalise: expose vehicle object as "vehicleId" for frontend compatibility
                if (obj.vehicle) { obj.vehicleId = obj.vehicle; delete obj.vehicle; }
                return obj;
            });
            const obj = result.toJSON ? result.toJSON() : { ...result };
            if (obj.vehicle) { obj.vehicleId = obj.vehicle; delete obj.vehicle; }
            return obj;
        };
    }
};

module.exports = MaintenanceService;

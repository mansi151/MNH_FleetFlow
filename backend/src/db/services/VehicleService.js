const Vehicle = require("../models/Vehicle");
const { TableFields } = require("../../utils/constants");
const ValidationError = require("../../utils/ValidationError");
const { Op } = require("sequelize");

class VehicleService {
    static createVehicle = async (data) => {
        const existing = await Vehicle.findOne({
            where: { licensePlate: (data[TableFields.licensePlate] || "").toUpperCase() }
        });
        if (existing) throw new ValidationError("Vehicle with this license plate already exists");

        return await Vehicle.create(data);
    };

    static getAllVehicles = (filters = {}) =>
        new ProjectionBuilder(async () => {
            const where = {};
            if (filters.status) where.status = filters.status;
            if (filters.vehicleType) where.vehicleType = filters.vehicleType;
            return await Vehicle.findAll({ where });
        });

    static getVehicleById = (id) =>
        new ProjectionBuilder(async () => {
            const vehicle = await Vehicle.findByPk(id);
            if (!vehicle) throw new ValidationError("Vehicle not found");
            return vehicle;
        });

    static updateVehicle = async (id, updates) => {
        const vehicle = await Vehicle.findByPk(id);
        if (!vehicle) throw new ValidationError("Vehicle not found");

        // Prevent accidental PK updates
        const cleanUpdates = { ...updates };
        delete cleanUpdates.id;
        delete cleanUpdates._id;

        return await vehicle.update(cleanUpdates);
    };

    static deleteVehicle = async (id) => {
        const vehicle = await Vehicle.findByPk(id);
        if (!vehicle) throw new ValidationError("Vehicle not found");
        await vehicle.destroy();
        return vehicle;
    };
}

const ProjectionBuilder = class {
    constructor(methodToExecute) {
        this.withBasicInfo = () => this;
        this.execute = async () => {
            const result = await methodToExecute();
            if (!result) return result;
            if (Array.isArray(result)) return result.map(v => v.toJSON ? v.toJSON() : v);
            return result.toJSON ? result.toJSON() : result;
        };
    }
};

module.exports = VehicleService;

const VehicleService = require("../../db/services/VehicleService");

exports.create = async (req, res) => {
    return await VehicleService.createVehicle(req.body);
};

exports.getAll = async (req, res) => {
    return await VehicleService.getAllVehicles(req.query).withBasicInfo().execute();
};

exports.getById = async (req, res) => {
    return await VehicleService.getVehicleById(req.params.id).withBasicInfo().execute();
};

exports.update = async (req, res) => {
    return await VehicleService.updateVehicle(req.params.id, req.body);
};

exports.delete = async (req, res) => {
    return await VehicleService.deleteVehicle(req.params.id);
};

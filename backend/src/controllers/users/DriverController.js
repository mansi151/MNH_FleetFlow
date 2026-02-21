const DriverService = require("../../db/services/DriverService");

exports.createProfile = async (req, res) => {
    return await DriverService.createProfile(req.body);
};

exports.getAll = async (req, res) => {
    return await DriverService.getAllProfiles().withBasicInfo().execute();
};

exports.getById = async (req, res) => {
    return await DriverService.getProfileById(req.params.id).withBasicInfo().execute();
};

exports.update = async (req, res) => {
    return await DriverService.updateProfile(req.params.id, req.body);
};

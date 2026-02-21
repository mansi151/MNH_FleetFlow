const TripService = require("../../db/services/TripService");

exports.create = async (req, res) => {
    return await TripService.createTrip(req.body);
};

exports.getAll = async (req, res) => {
    return await TripService.getAllTrips(req.query).withBasicInfo().execute();
};

exports.complete = async (req, res) => {
    return await TripService.completeTrip(req.params.id, req.body.odometer);
};

exports.cancel = async (req, res) => {
    return await TripService.cancelTrip(req.params.id);
};

const UserService = require("../../db/services/UserService");
const ValidationError = require("../../utils/ValidationError");
const { ValidationMsgs } = require("../../utils/constants");

exports.register = async (req, res) => {
    try {
        const user = await UserService.insertUserRecord(req.body);
        const token = await UserService.authToken(user);
        return { user, token };
    } catch (e) {
        throw e;
    }
};

exports.login = async (req, res) => {
    try {
        const user = await UserService.findByCredentials(req.body.email, req.body.password)
            .withBasicInfo()
            .execute();
        // findByCredentials returns a sanitised plain object; we need the Sequelize instance to save tokens
        const userInstance = await require("../../db/models/User").findByPk(user.id);
        const token = await UserService.authToken(userInstance);
        return { user, token };
    } catch (e) {
        throw new ValidationError(ValidationMsgs.UnableToLogin);
    }
};

exports.logout = async (req, res) => {
    try {
        const tokens = Array.isArray(req.user.tokens) ? req.user.tokens : [];
        req.user.tokens = tokens.filter(t => t.token !== req.token);
        await req.user.save();
        return { message: "Logged out successfully" };
    } catch (e) {
        throw e;
    }
};

exports.getProfile = async (req, res) => {
    const obj = req.user.toJSON();
    delete obj.password;
    delete obj.tokens;
    return obj;
};

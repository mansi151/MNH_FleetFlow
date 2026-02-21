const User = require("../models/User");
const ValidationError = require("../../utils/ValidationError");
const { TableFields } = require("../../utils/constants");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserService {
    static insertUserRecord = async (data) => {
        const existing = await User.findOne({ where: { email: data[TableFields.email].toLowerCase() } });
        if (existing) throw new ValidationError("Email already in use");

        if (data[TableFields.password].length < 7)
            throw new ValidationError("Password too short");

        if (data[TableFields.password].toLowerCase().includes("password"))
            throw new ValidationError('Password cannot contain "password"');

        const hashedPassword = await bcrypt.hash(data[TableFields.password], 8);

        const user = await User.create({
            ...data,
            [TableFields.password]: hashedPassword,
            tokens: [],
        });

        return user;
    };

    static findByEmail = (email) =>
        new ProjectionBuilder(async () => {
            return await User.findOne({ where: { email: email.toLowerCase() } });
        });

    static authToken = async (user) => {
        const secret = process.env.JWT_SECRET || "default_secret_key_change_me";
        const token = jwt.sign({ id: user.id }, secret);

        const tokens = Array.isArray(user.tokens) ? user.tokens : [];
        tokens.push({ token });
        user.tokens = tokens;
        await user.save();

        return token;
    };

    static findByCredentials = (email, password) =>
        new ProjectionBuilder(async () => {
            const user = await User.findOne({ where: { email: email.toLowerCase() } });
            if (!user) throw new Error("Unable to login");

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) throw new Error("Unable to login");

            return user;
        });

    static getUserById = (id) =>
        new ProjectionBuilder(async () => {
            return await User.findByPk(id);
        });

    static generateResetToken = async (email) => {
        const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
        if (!user) throw new Error("User not found");

        const token = require("crypto").randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        return token;
    };

    static resetUserPassword = async (token, newPassword) => {
        const { Op } = require("sequelize");
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) throw new Error("Password reset token is invalid or has expired");

        if (newPassword.length < 7)
            throw new ValidationError("Password too short");

        user.password = await bcrypt.hash(newPassword, 8);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.tokens = []; // Clear tokens for security
        await user.save();

        return user;
    };
}

/**
 * ProjectionBuilder – kept for interface compatibility.
 * withBasicInfo() / withId() are no-ops on Sequelize (we return the full row;
 * the toJSON() stripping of password/tokens happens in the service/controller level).
 */
const ProjectionBuilder = class {
    constructor(methodToExecute) {
        this.withBasicInfo = () => this;
        this.withId = () => this;
        this.execute = async () => {
            const result = await methodToExecute();
            if (!result) return result;

            // Strip sensitive fields before returning
            if (Array.isArray(result)) {
                return result.map(u => {
                    const obj = u.toJSON ? u.toJSON() : { ...u };
                    delete obj.password;
                    delete obj.tokens;
                    return obj;
                });
            }
            const obj = result.toJSON ? result.toJSON() : { ...result };
            delete obj.password;
            delete obj.tokens;
            return obj;
        };
    }
};

module.exports = UserService;

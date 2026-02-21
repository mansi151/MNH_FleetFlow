const jwt = require("jsonwebtoken");
const User = require("../db/models/User");
const { ResponseStatus } = require("../utils/constants");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const secret = process.env.JWT_SECRET || "default_secret_key_change_me";
        const decoded = jwt.verify(token, secret);

        // Sequelize uses integer `id` as PK
        const user = await User.findOne({
            where: { id: decoded.id },
        });

        if (!user) throw new Error();

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(ResponseStatus.Unauthorized).send({ error: "Please authenticate." });
    }
};

module.exports = auth;

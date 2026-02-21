const mongoose = require("mongoose");
const chalk = require("chalk");

class MongoUtil {
    static newObjectId() {
        return new mongoose.Types.ObjectId();
    }

    static toObjectId(stringId) {
        return new mongoose.Types.ObjectId(stringId);
    }

    static isValidObjectID(id) {
        return mongoose.isValidObjectId(id);
    }
}

const initConnection = (callback) => {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/feetflow')
        .then(() => {
            console.log(chalk.blue.bold("Database Connection Established✅"));
            callback();
        })
        .catch(err => {
            console.log(chalk.bgRed.bold("⚠️ [Database ERROR]") + chalk.red(err));
            process.exit(1);
        });

    mongoose.connection.on("error", (error) => {
        console.log(chalk.bgRed.bold("⚠️ [Database ERROR]") + chalk.red(error));
    });
};

module.exports = {
    initConnection,
    mongoose,
    MongoUtil,
};

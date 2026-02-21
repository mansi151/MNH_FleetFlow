const fs = require("fs");

class Util {
    static getErrorMessage(error) {
        if (error.name === "ValidationError") {
            return { error: error.message };
        }
        if (error.errors) {
            const firstKey = Object.keys(error.errors)[0];
            return { error: error.errors[firstKey].message };
        }
        return { error: error.message };
    }

    static getErrorMessageFromString(message) {
        return { error: message };
    }

    static getBaseURL() {
        return `http://localhost:${process.env.PORT || 3000}`;
    }
}
module.exports = Util;

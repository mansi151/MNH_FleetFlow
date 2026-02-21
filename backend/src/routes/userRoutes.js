const API = require("../utils/apiBuilder");
const AuthController = require("../controllers/users/AuthController");
const { TableFields } = require("../utils/constants");
const auth = require("../middleware/auth");

const router = API.configRoute("/user")
    .addPath("/register")
    .asPOST(AuthController.register)
    .build()

    .addPath("/login")
    .asPOST(AuthController.login)
    .build()

    .addPath("/logout")
    .asPOST(AuthController.logout)
    .userMiddlewares(auth)
    .build()
    .getRouter();

module.exports = router;

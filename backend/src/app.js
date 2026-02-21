const express = require("express");
const DBController = require("./db/sequelize");
const path = require("path");
const cors = require("cors");
const app = express();
const Util = require("./utils/util");
const morgan = require("morgan");
const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();

app.use(cors());
app.use(morgan("dev"));

app.use(
    express.urlencoded({
        extended: false,
        limit: "5gb",
        parameterLimit: 50000,
    }),
);
app.use(express.json({ limit: "5gb" }));

const routesPath = path.join(__dirname, "routes");
fs.readdirSync(routesPath).forEach((file) => {
    if (path.extname(file) === ".js") {
        app.use(require(path.join(routesPath, file)));
    }
});

app.get("/", (req, res) => {
    res.sendStatus(200);
});

DBController.initConnection(async () => {
    const httpServer = require("http").createServer(app);
    const port = process.env.PORT || 3000;

    httpServer.listen(port, async function () {
        console.log(`Server is running on ${chalk.cyan.italic.underline(Util.getBaseURL())}`);
    });
});

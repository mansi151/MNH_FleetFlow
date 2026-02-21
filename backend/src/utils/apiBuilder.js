const express = require("express");
const Util = require("../utils/util");
const ValidationError = require("../utils/ValidationError");
const { ResponseStatus } = require("../utils/constants");

class API {
    static configRoute(root) {
        const router = new express.Router();

        return new PathBuilder(root, router);
    }
}

const MethodBuilder = class {
    constructor(root, subPath, router) {
        this.asGET = function (methodToExecute) {
            return new Builder("get", root, subPath, methodToExecute, router);
        };

        this.asPOST = function (methodToExecute) {
            return new Builder("post", root, subPath, methodToExecute, router);
        };

        this.asDELETE = function (methodToExecute) {
            return new Builder("delete", root, subPath, methodToExecute, router);
        };

        this.asUPDATE = function (methodToExecute) {
            return new Builder("patch", root, subPath, methodToExecute, router);
        };
    }
};

const PathBuilder = class {
    constructor(root, router) {
        this.addPath = function (subPath) {
            return new MethodBuilder(root, subPath, router);
        };
        this.getRouter = () => router;
    }
};

const Builder = class {
    constructor(
        methodType,
        root,
        subPath,
        executer,
        router,
        useAuthMiddleware,
        duplicateErrorHandler,
        middlewaresList = [],
    ) {
         this.userMiddlewares = (...middlewares) => {
            middlewaresList = [...middlewares];

            return new Builder(
                methodType,
                root,
                subPath,
                executer,
                router,
                useAuthMiddleware,
                duplicateErrorHandler,
                middlewaresList,
            );
        };

        this.build = () => {
            const controller = async (req, res) => {
                try {
                    const response = await executer(req, res);

                    res.status(ResponseStatus.Success).send(response);
                } catch (e) {
                    console.log(e);
                    if (e && e.name !== "ValidationError") {
                        console.log(e);
                    }
                    res.locals.errorMessage = e;
                    res.status(ResponseStatus.BadRequest).send(Util.getErrorMessage(e));
                }
            };

            const middlewares = [...middlewaresList];

            router[methodType](root + subPath, ...middlewares, controller);

            return new PathBuilder(root, router);
        };
    }
};

module.exports = API;

const express = require("express");

const testController = require("../controllers/testController");

testRouter = express.Router();

testRouter.post("/api-caching", testController.apiCaching);
testRouter.post("/rate-limiting", testController.rateLimiting);

module.exports = testRouter;
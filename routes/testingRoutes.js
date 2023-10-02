const express = require("express");

const testController = require("../controllers/testController");
const {rateLimiter} = require("../middlewares/rateLimiter");

testRouter = express.Router();

testRouter.get("/api-caching", (req,res) => {
    res.render("ApiCache");
});

testRouter.get("/login-page", (req,res) => {
    res.render("loginPage");
});

testRouter.post("/api-caching", testController.apiCaching);
testRouter.post("/login-page", rateLimiter, testController.loginPage);

module.exports = testRouter;
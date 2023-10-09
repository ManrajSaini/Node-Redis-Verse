const express = require("express");

const testController = require("../controllers/testController");
const {rateLimiter} = require("../middlewares/rateLimiter");

testRouter = express.Router();

// *************API Caching*******************
testRouter.get("/api-caching", (req,res) => {
    res.render("ApiCache");
});

testRouter.post("/api-caching", testController.apiCaching);



// ***************Rate Limiting******************* 
testRouter.get("/login-page", (req,res) => {
    res.render("loginPage");
});

testRouter.post("/login-page", rateLimiter, testController.loginPage);



// ***************Real Time LeaderBoard******************* 
testRouter.get("/leader-board", testController.getLeaderBoard);

testRouter.post("/leader-board", testController.updateLeaderBoard);



// ***************Redis Server Sessions********************
testRouter.get("/register-user", (req,res) => {
    res.render("RegisterUser", {data: {success: true}});
});

testRouter.get("/login-user", (req,res) => {
    if (req.session.loggedIn) {
        res.redirect('success-user');
    } else {
        res.render('LoginUser', {data: {success: true}});
    }
});

testRouter.get('/success-user', (req, res) => {
    if (req.session.loggedIn) {
        res.render('SuccessUser', { 
            email: req.session.email, 
            password: req.session.password 
        });
    } else {
        res.redirect('login-user');
    }
});

testRouter.get('/logout-user', (req, res) => {
    req.session.destroy(() => {
        res.redirect('register-user');
    });
});

testRouter.post("/register-user", testController.registerUser);
testRouter.post("/login-user", testController.loginUser);



// ******************** Geo-Spatial Index's ********************
testRouter.get("/get-places", (req,res) => {
    res.render("Map");
});

testRouter.post("/get-places", testController.findPlaces);


module.exports = testRouter;
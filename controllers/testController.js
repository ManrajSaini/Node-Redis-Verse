const redis = require("../config/connectDB");
const axios = require("axios");

const apiCaching = async(req,res) => {
    try{
        let startTime, endTime, timeRet, ttl;

        const repo = req.body.query;

        if(!repo){
            const response = {
                "success": false,
                "error_code": 500,
                "message": "Enter a valid Repository name",
                "data": null
            };

            return res.send({data: response}).render("ApiCache");
        }

        startTime = Date.now();
        const value = await redis.get(repo);

        if(value){
            endTime = Date.now();
            timeRet = endTime - startTime;
            
            ttl = await redis.ttl(repo);
            
            const response = {
                "success": true,
                "error_code": 200,
                "message": "Redis",
                "data": {
                    "stars": value, 
                    "retrivalTime": timeRet,
                    "ttl": ttl
                }
            };

            return res.send({data: response}).render("ApiCache");
        }

        startTime = Date.now();

        console.log(`https://api.github.com/repos/${repo}`);
        const githubResponse = await axios.get(`https://api.github.com/repos/${repo}`);
        
        endTime = Date.now();

        if(!githubResponse){
            const response = {
                "success": false,
                "error_code": 401,
                "message": "Unable to fetch Repository OR Wrong Repository name",
                "data": null
            };

            return res.send({data: response}).render("ApiCache");
        }

        const stars = githubResponse.data.stargazers_count;

        timeRet = endTime - startTime;
        
        await redis.setex(repo, 30, stars);

        ttl = await redis.ttl(repo);

        const response = {
            "success": true,
            "error_code": 200,
            "message": "Remote",
            "data": {
                "stars": stars, 
                "retrivalTime": timeRet,
                "ttl": ttl
            }
        };

        return res.send({data: response}).render("ApiCache");

    } catch(err){
        const response = {
            "success": false,
            "error_code": 500,
            "message": "Unable to fetch Repository OR Wrong Repository name",
            "data": null
        };

        return res.send({data: response}).render("ApiCache");
    }
};


const loginPage = async(req,res) => {

    const userIp = req.userIp;
    const requests = req.requests;

    const email = req.body.email.toString();
    const password = req.body.password.toString();

    if(!email || !password){

        const ttl = await redis.ttl(userIp);

        const response = {
            "success": false,
            "error_code": 500,
            "message": "Please provide email and Password",
            "blocked": false,
            "data": {
                requests: requests,
                ttl: ttl
            }
        };

        return res.send({data: response}).render("loginPage");
    }

    if(email.toLowerCase() !== 'admin@gmail.com'){

        const ttl = await redis.ttl(userIp);

        const response = {
            "success": false,
            "error_code": 500,
            "message": "Email provided is Incorrect",
            "blocked": false,
            "data": {
                requests: requests,
                ttl: ttl
            }
        };

        return res.send({data: response}).render("loginPage");
    }

    if(password !== 'admin'){

        const ttl = await redis.ttl(userIp);
 
        const response = {
            "success": false,
            "error_code": 500,
            "message": "Password provided is Incorrect",
            "blocked": false,
            "data": {
                requests: requests,
                ttl: ttl
            }
        };

        return res.send({data: response}).render("loginPage");
    }

    await redis.setex(userIp, 120, 0);

    const response = {
        "success": true,
        "error_code": 200,
        "message": "Login Successful",
        "data": {
            "email": email,
            "password": password
        }
    };

    return res.send({ data: response }).render("loginPage");
};


const getLeaderBoard = async(req,res) => {
    redis.zrevrange('leaderboard', 0, -1, 'WITHSCORES', (err, reply) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        } 
        
        else {
            const leaderboard = [];

            for (let i = 0; i < reply.length; i += 2) {
                leaderboard.push({
                    username: reply[i],
                    score: parseInt(reply[i + 1]),
                });
            }

            res.render('Leaderboard', { leaderboard });
        }
    }); 
};


const updateLeaderBoard = async(req,res) => {
    const { username } = req.body;

    redis.zincrby('leaderboard', 10, username, (err, reply) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
        else {
            res.redirect('leader-board');
        }
    });
};

const registerUser = async(req,res) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    if(!email || !password){
        const response = {
            "success": false,
            "error_code": 500,
            "message": "Please provide email and Password",
            "data": null
        };

        return res.render("RegisterUser", { data: response });
    }

    if(email === req.session.email && password !== req.session.password){

        const response = {
            "success": false,
            "error_code": 500,
            "message": "Email already registered, Provide correct Password",
            "data": null
        };

        return res.render("RegisterUser", { data: response });
    }

    if(email === req.session.email && password === req.session.password){

        req.session.loggedIn = true;
        return res.redirect('login-user')
    }

    req.session.loggedIn = false;
    req.session.email = email;
    req.session.password = password;

    res.redirect('login-user');
};


const loginUser = async(req,res) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    if(!email || !password){
        const response = {
            "success": false,
            "error_code": 500,
            "message": "Please provide email and Password",
            "data": null
        };

        return res.render("LoginUser", {data: response});
    }

    if(email !== req.session.email){
        const response = {
            "success": false,
            "error_code": 500,
            "message": "Please provide correct email or Your session was Expired",
            "data": null
        };

        return res.render("LoginUser", {data: response});
    }

    if(password !== req.session.password){
        const response = {
            "success": false,
            "error_code": 500,
            "message": "Please provide correct password or Your session was Expired",
            "data": null
        };

        return res.render("LoginUser", {data: response});
    }

    req.session.loggedIn = true;
    req.session.email = email;
    req.session.password = password;

    res.redirect('success-user');
};


const findPlaces = async(req,res) => {
    let { lat, lon, radius } = req.body;

    const locations = await redis.geosearch('places', 'FROMLONLAT', lon, lat, 'BYRADIUS', radius, 'km', 'ASC', 'WITHDIST');

    res.render('LocResult', { locations });
};

module.exports = {
    apiCaching,
    loginPage,
    getLeaderBoard,
    updateLeaderBoard,
    registerUser,
    loginUser,
    findPlaces
}
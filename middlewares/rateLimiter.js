const redis = require("../config/connectDB");
const axios = require("axios");

const rateLimiter = async(req,res,next) => {
    try{
        const value = await axios.get('https://api64.ipify.org?format=json');
        const userIp = value.data.ip;

        const requests = await redis.incr(userIp);

        if(requests == 1){
            await redis.expire(userIp, 120);
            ttl = 120;
        }
        else{
            ttl = await redis.ttl(userIp);
        }

        if(requests > 5){

            const response = {
                "success": false,
                "error_code": 403,
                "message": "Wait for some time to Login In again",
                "blocked": true,
                "data": {
                    requests: requests,
                    ttl: ttl
                }
            };

            return res.send({data: response}).render("loginPage");
        }

        req.userIp = userIp;
        req.requests = requests;
        next();
       
    }

    catch(err){
        const response = {
            "success": false,
            "error_code": 500,
            "message": err.message,
            "data": null
        };

        return res.send({data: response}).render("loginPage");
    }
};

module.exports = {rateLimiter};
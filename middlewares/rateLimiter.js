const redis = require("../config/connectDB");
const axios = require("axios");

const rateLimiting = async(req,res,next) => {
    try{
        const value = await axios.get('https://api64.ipify.org?format=json');
        const userIp = value.data.ip;

        const requests = await redis.incr(userIp);
        let ttl;

        if(requests == 1){
            await redis.expire(userIp, 60);
            ttl = 60;
        }
        else{
            ttl = await redis.ttl(userIp);
        }

        if(requests > 5){
            return res.json({
                "success": false,
                "error_code": 503,
                "message": "Maximum 5 requests in one minute",
                "data": {
                    "calls": requests,
                    "ttl": ttl
                }
            });
        }

        return res.json({
            "success": true,
            "error_code": 200,
            "message": "Successfully made the request",
            "data": {
                "calls": requests,
                "ttl": ttl
            }
        });
    } 
    catch(err){
        return res.json({
            "success": true,
            "error_code": 200,
            "message": "Successfully made the request",
            "data": {
                "calls": requests,
                "ttl": ttl
            }
        });
    }
};
const redis = require("../config/connectDB");
const axios = require("axios");

const apiCaching = async(req,res) => {
    try{
        let startTime, endTime, timeRet;

        const repo = req.body.repo;

        startTime = Date.now();
        const value = await redis.get(repo);

        if(value){
            endTime = Date.now();
            timeRet = endTime - startTime;

            return res.json({
                "success": true,
                "error_code": 200,
                "message": "Successfully fetched the repository from Redis",
                "data": {
                    "stars": value, 
                    "retrivalTime": timeRet
                }
            });
        }

        startTime = Date.now();

        const response = await axios.get(`https://api.github.com/repos/${repo}`);
        const stars = response.data.stargazers_count;

        endTime = Date.now();
        timeRet = endTime - startTime;
        
        if(stars){
            await redis.setex(repo, 30, stars);
        }

        return res.json({
            "success": true,
            "error_code": 200,
            "message": "Successfully fetched the repository from Remote",
            "data": {
                "stars": stars, 
                "retrivalTime": timeRet
            }
        });

    } catch(err){
        return res.json({
            "success": false,
            "error_code": 500,
            "message": err.message,
            "data": null
        });
    }
};

const rateLimiting = async(req,res) => {
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
};

module.exports = {
    apiCaching,
    rateLimiting
}
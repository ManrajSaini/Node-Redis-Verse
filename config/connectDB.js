const dotenv = require("dotenv");
const Redis = require("ioredis");

dotenv.config();

const redis = new Redis(process.env.REDIS_URL);

if(redis){
    console.log("Connected to Redis DB");
} else{
    console.log("unable to connect to Redis DB");
}

module.exports = redis;
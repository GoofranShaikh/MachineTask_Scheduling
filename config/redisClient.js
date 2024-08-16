const redis = require('redis');

const redisClient = redis.createClient()

async function startRedis(){
    await redisClient.connect();
    console.log('Connected to Redis...')
}

startRedis();

module.exports = redisClient
const { createClient } =require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-18354.c212.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 18354
    }
});
redisClient.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});



module.exports=redisClient;
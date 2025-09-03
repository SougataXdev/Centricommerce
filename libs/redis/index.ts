import Redis from "ioredis";

// For Upstash Redis, use the full connection URL
const redisUrl = process.env.REDIS_URL;

// If REDIS_URL is not available, construct from individual components
let redisConfig: string | Redis.RedisOptions;

if (redisUrl) {
    redisConfig = redisUrl;
} else {
    // Fallback to individual components
    const host = process.env.REDIS_HOST || '127.0.0.1';
    const port = parseInt(process.env.REDIS_PORT || '6379');
    const password = process.env.REDIS_PASSWORD;

    redisConfig = {
        host,
        port,
        password,
        tls: host.includes('upstash.io') ? {} : undefined, 
    };
}

const redis = new Redis(redisConfig, {
    lazyConnect: false,  
    maxRetriesPerRequest: 3,
    enableOfflineQueue: true,  
    connectTimeout: 60000,  
    commandTimeout: 5000,   
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('ready', () => {
    console.log('Redis is ready to receive commands');
});

redis.on('close', () => {
    console.log('Redis connection closed');
});

redis.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

// If you want to test the connection, do it explicitly in your application code after importing this module.

export default redis;
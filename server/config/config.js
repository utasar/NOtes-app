require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwt: {
        secret: process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex'),
        expire: process.env.JWT_EXPIRE || '7d'
    },
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
    },
    cors: {
        allowedOrigins: process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',') 
            : ['http://localhost:3000', 'http://127.0.0.1:3000']
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
};

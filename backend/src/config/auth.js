require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-troque-em-producao';
const JWT_EXPIRES_IN = '12h';

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };

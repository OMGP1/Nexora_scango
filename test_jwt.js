const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 'guest', role: 'guest', store_id: 'STORE_001', type: 'guest' }, 'scango-dev-jwt-secret-change-in-production', { expiresIn: '1h' });
console.log(token);

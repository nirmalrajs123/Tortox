const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
const { initializeDatabase } = require('./backend/config/db');
initializeDatabase().then(() => {
    console.log('Database initialized successfully');
    process.exit(0);
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

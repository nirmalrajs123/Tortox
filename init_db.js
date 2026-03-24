const { initializeDatabase } = require('./backend/config/db');
initializeDatabase()
  .then(() => {
    console.log('Features Table Created');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

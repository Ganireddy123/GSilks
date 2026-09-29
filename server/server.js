const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`GSILKS API running on http://localhost:${PORT}`);
      console.log('Registered API endpoints:');
      for (const endpoint of app.apiEndpoints) {
        console.log(`  ${endpoint.method.padEnd(6)} http://localhost:${PORT}${endpoint.path}`);
      }
    });
  } catch (error) {
    console.error('Database connection failed. Please check MySQL configuration and ensure the database is running.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();

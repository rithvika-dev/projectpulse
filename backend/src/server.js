const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect Database
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('===============================================');
    console.log(`🚀 ProjectPulse REST API Server Running`);
    console.log(`📡 Port: ${PORT}`);
    console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
    console.log(`🛠️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('===============================================');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection Error]: ${err.message}`);
  });

  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception Error]: ${err.message}`);
  });
};

startServer();

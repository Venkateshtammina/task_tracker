const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/authroutes');
const projectRoutes = require('./routes/projectroutes');
const taskRoutes = require('./routes/taskroutes');

// Debug log for route registration
function logRouteRegistration(path, router) {
  console.log('Registering route:', path);
  app.use(path, router);
}

// API routes with debug logs
logRouteRegistration('/api/auth', authRoutes);
logRouteRegistration('/api/projects', projectRoutes);
logRouteRegistration('/api/tasks', taskRoutes);

// Serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // Base route for development only
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

console.log('All routes and middleware registered. Ready to start server.');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// server.js

// Import the Express framework
import express from 'express';
// Import the routes defined in routes/index.js
import routes from './routes';

// Create an Express application
const app = express();
// Define the port to listen on, using the environment variable PORT or defaulting to 5000
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Use the routes defined in routes/index.js for handling incoming requests
app.use(routes);

// Start the Express server, listening on the specified port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

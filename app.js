const express = require('express');
const config = require('./config');

// Create an instance of the Express application
const app = express();

// Define routes
app.get('/', (req, res) => {
    res.send('Test');
});

// Start the server
app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
})
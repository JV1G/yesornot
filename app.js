const express = require('express');
const config = require('./config');
const path = require('path');

// Create an instance of the Express application
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));

// Define routes
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});

// Start the server
app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
})
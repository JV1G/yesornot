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
app.get('/rate-pill', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'rate-pill.html'));
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});
app.get('/make-pill', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'make-pill.html'));
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});
app.get('/browse-redpills', (req, res) => { 
    try {
        res.sendFile(path.join(__dirname, 'browse-redpills.html'));
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});
app.get('/help', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'help.html'));
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});
app.get('/help/:type', (req, res) => {
    try {
        const type = req.params.type;

        switch(type) {
            case 'how':
                res.sendFile(__dirname + '/help/how.html');
                break;
            case 'rules':
                res.sendFile(__dirname + '/help/rules.html');
                break;
            case 'support':
            res.sendFile(__dirname + '/help/support.html');
            break;
            case 'idea':
                res.sendFile(__dirname + '/help/idea.html');
                break;
            case 'bug':
                res.sendFile(__dirname + '/help/bug.html');
                break;
            default:
                res.sendFile(path.join(__dirname, '/help/other.html'));
        }
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});

// Start the server
app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
})
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const requestIp = require('request-ip');
const geoip2 = require('@maxmind/geoip2-node');
const multer = require('multer');

const config = require('./config');
const models = require('./models');

// Create an instance of the Express application
const app = express();

// Set up reader to read geo database
const Reader = require('@maxmind/geoip2-node').Reader;
let reader;
Reader.open('./GeoLite2-Country.mmdb').then(r => {
    reader = r;
});

// Connect to the database
const mongoURI = `${config.dbURL}/${config.dbName}`;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => { 
    console.log('MongoDB connected');
}).catch((error) => console.error('Error connecting to database:', error));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});

const upload = multer({ storage: storage });

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(requestIp.mw());

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
app.get('/random-pill', async (req, res) => {
    try {
        const randomPill = await models.Pill.aggregate([{ $sample: { size: 1 } }]);
        if (randomPill.length > 0) {
            res.json(randomPill[0]);
        } else {
            res.status(404).json({ message: 'No pills found' });
        }
    } catch (error) {
        console.log(`An error handling the /random-pill GET request: ${error.message}`);
        res.status(500).send(`An error occured: ${error.message}`);
    }
});

const generatePillId = () => {
    return Math.floor(Math.random() * (29999999 - 20000000 + 1) + 20000000);
};

app.post('/make-pill', upload.single('pill-image'), async (req, res) => {
    try {
        const pillTitle = req.body['pill-title'];
        const pillAuthor = req.body['pill-author'];
        const pillText = req.body['pill-text'];
        const pillImagePath = req.file.path;
        const myPillId = generatePillId();

        // Find out the country
        //const userIp = req.clientIp; // If app running on local machine = error
        const userIp = "8.8.8.8";  // Google's public DNS IP, just for testing
        // Look up the IP in the GeoLite2 database.
        let pillCountry;
        try {
            const lookup = reader.country(userIp);
            pillCountry = lookup.country.isoCode;
        } catch (err) {
            console.error(`Failed to lookup IP: ${err.message}`);
            pillCountry = "Unknown";
        }
        console.log(pillTitle);
        console.log(pillAuthor);
        console.log(pillText);
        console.log(pillCountry);
        console.log(pillImagePath);
        console.log(myPillId);

        // Store the country with the other form data in the database.
        // Create a new pill document
        const newPill = new models.Pill({
            title: pillTitle,
            author: pillAuthor,
            text: pillText,
            country: pillCountry,
            pillId: myPillId,
            imagePath: pillImagePath
        });
        // Save the new pill document inside the pills collection
        await newPill.save();

        res.send("Form submitted!"); // Send response to client
    } catch (error) {
        console.log(`An error handling the /make-pill POST request: ${error.message}`);
        res.status(500).send(`An error occurred: ${error.message}`);
    }
});

// Start the server
app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
})
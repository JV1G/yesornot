const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const requestIp = require('request-ip');
const geoip2 = require('@maxmind/geoip2-node');
const multer = require('multer');
const sizeOf = require('image-size');

const config = require('./config');
const models = require('./models');

// Create an instance of the Express application
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');

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

// Helper functions
function formatDate(dateObj) {
    let day = dateObj.getDate().toString().padStart(2, '0');
    let month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); 
    let year = dateObj.getFullYear().toString().substr(-2); 
    let weekday = dateObj.toLocaleString('default', { weekday: 'short' });
    let hours = dateObj.getHours().toString().padStart(2, '0');
    let minutes = dateObj.getMinutes().toString().padStart(2, '0');
    let seconds = dateObj.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} (${weekday}) ${hours}:${minutes}:${seconds}`;
}
// Helper function to escape any special characters in the search term
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

// Define routes
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});
app.get('/pill-it', async (req, res) => {
    try {
        const count = await models.Pill.countDocuments();
        const random = Math.floor(Math.random() * count);
        const pill = await models.Pill.findOne().skip(random).exec();
        res.render('pill', { pill: pill, formatDate: formatDate });
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
        let excludeIds = req.query.excludeIds ? req.query.excludeIds.split(',').map(id => mongoose.Types.ObjectId(id)) : [];

        let randomPill = await models.Pill.aggregate([
            { $match: { _id: { $nin: excludeIds } } }, // Exclude pills by their ObjectIds
            { $sample: { size: 1 } }
        ]);

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
        let pillAuthor = req.body['pill-author'];
        const pillText = req.body['pill-text'];
        const pillImagePath = req.file.path;
        const myPillId = generatePillId();

        // Get image details
        const pillImageName = req.file.originalname;
        const pillImageSizeInBytes = req.file.size;
        const pillImageDimensions = sizeOf(pillImagePath);

        // Find out the country
        //const userIp = req.clientIp; // If app running on local machine = error
        const userIp = "8.8.0.0";  // Google's public DNS IP, just for testing
        // Look up the IP in the GeoLite2 database.
        let pillCountry;
        try {
            const lookup = reader.country(userIp);
            pillCountry = lookup.country.isoCode;
        } catch (err) {
            console.error(`Failed to lookup IP: ${err.message}`);
            pillCountry = "Unknown";
        }

        // If author was not set a value, make author 'Anonymous'
        if(!pillAuthor.trim()) {
            pillAuthor = "Anonymous";
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
            imagePath: pillImagePath,
            imageName: pillImageName,
            imageSize: `${(pillImageSizeInBytes / 1024).toFixed(2)} KB`,
            imageResolution: `${pillImageDimensions.width}x${pillImageDimensions.height}`
        });
        // Save the new pill document inside the pills collection
        await newPill.save();

        res.send("Form submitted!"); // Send response to client
    } catch (error) {
        console.log(`An error handling the /make-pill POST request: ${error.message}`);
        res.status(500).send(`An error occurred: ${error.message}`);
    }
});

const generateCommentId = () => {
    return Math.floor(Math.random() * (29999999 - 20000000 + 1) + 20000000);
};

app.post('/pill-comment', upload.single('pill-comment-image'), async (req, res) => {
    // Check if the image was uploaded
    let commentImagePath, commentImageName, commentImageSizeInBytes, commentImageDimensions;

    if (req.file) {
        // Get image details
        commentImagePath = req.file.path;
        commentImageName = req.file.originalname;
        commentImageSizeInBytes = req.file.size;
        commentImageDimensions = sizeOf(commentImagePath);
    } else {
        commentImagePath = null;
        commentImageName = null;
        commentImageSizeInBytes = null;
        commentImageDimensions = null;
    }

    const pillId = parseInt(req.body['pill-id']);
    let commentAuthor = req.body['pill-comment-author'];
    const commentText = req.body['pill-comment-text'];
    const myCommentId = generateCommentId();

    // Find out the country
    //const userIp = req.clientIp; // If app running on local machine = error
    const userIp = "8.8.0.0";  // Google's public DNS IP, just for testing
    // Look up the IP in the GeoLite2 database.
    let commentCountry;
    try {
        const lookup = reader.country(userIp);
        commentCountry = lookup.country.isoCode;
    } catch (err) {
        console.error(`Failed to lookup IP: ${err.message}`);
        commentCountry = "Unknown";
    }

    // If author was not set a value, make author 'Anonymous'
    if(!commentAuthor.trim()) {
        commentAuthor = "Anonymous";
    }

    console.log(req.body['pill-id']);
    console.log(req.body['pill-comment-author']);
    console.log(req.body['pill-comment-text']);
    console.log(myCommentId);
    console.log(commentCountry);

    const comment = {
        author: commentAuthor,
        text: commentText,
        country: commentCountry,
        commentId: myCommentId,
        imagePath: commentImagePath,
        imageName: commentImageName,
        imageSize: commentImageSizeInBytes ? `${(commentImageSizeInBytes / 1024).toFixed(2)} KB` : null,
        imageResolution: commentImageDimensions ? `${commentImageDimensions.width}x${commentImageDimensions.height}` : null
    };

    try {
        const updatedPill = await models.Pill.findOneAndUpdate(
            { pillId: pillId }, 
            { $push: { comments: comment } }, 
            { new: true }
        );
        if(updatedPill) {
            res.json({ message: 'Comment added successfully', pill: updatedPill });
        } else {
            res.status(404).json({ message: 'Pill not found' });
        }
    } catch (error) {
        console.error(`Error adding the comment: ${error.message}`);
        res.status(500).send(`An error occurred: ${error.message}`);
    }
});

app.get('/Pill/:pillId', async (req, res) => {
    const pillId = req.params.pillId;
    
    try {
        const pill = await models.Pill.findOne({ pillId: pillId });
        console.log(pill);
        if(pill) {
            res.render('pill', { pill: pill, formatDate: formatDate });
        } else {
            res.status(404).send('Pill not found');
        }
    } catch(error) {
        console.error("Error fetching pill:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/pills', async (req, res) => { 
    try {
        const pills = await models.Pill.find({}).sort({ createdAt: -1 });

        // Sort the pills based on the most recent comment's createdAt timestamp and pill's own createdAt
        pills.sort((a, b) => {
            // Get the most recent comment for pill 'a'
            const aRecentComment = a.comments.reduce((recent, comment) => {
                return !recent || comment.createdAt > recent.createdAt ? comment : recent;
            }, null);

            // Get the most recent comment for pill 'b'
            const bRecentComment = b.comments.reduce((recent, comment) => {
                return !recent || comment.createdAt > recent.createdAt ? comment : recent;
            }, null);

            const aTimestamp = aRecentComment ? aRecentComment.createdAt : a.createdAt;
            const bTimestamp = bRecentComment ? bRecentComment.createdAt : b.createdAt;

            return bTimestamp - aTimestamp; // Sort based on the most recent of either comment timestamp or pill creation timestamp
        });
        res.render('pills', { pills, formatDate }); 

    } catch (error) {
        res.status(500).send(`An error occured: ${error.message}`);
    }
});
app.get('/pills/redpilled', async(req, res) => {
    try {
        const pills = await models.Pill.find({ $expr: { $gte: ["$redpilledCount", "$bluepilledCount"] } }).sort({ redpilledCount: -1 });
        res.render('pills', { pills, formatDate});
    } catch (error) {
        console.error("Error fetching redpilled pills", error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/pills/bluepilled', async(req, res) => {
    try {
        const pills = await models.Pill.find({ $expr: { $gte: ["$bluepilledCount", "$redpilledCount"] } }).sort({ bluepilledCount: -1 });
        res.render('pills', { pills, formatDate});
    } catch (error) {
        console.error("Error fetching redpilled pills", error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/pills/new', async(req, res) => {
    try {
        const pills = await models.Pill.find().sort({ _id: -1 });
        res.render('pills', { pills, formatDate});
    } catch (error) {
        console.error("Error fetching redpilled pills", error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/pills/search', async (req, res) => {
    try {
        const searchTerm = req.query.term;
        console.log(searchTerm);
        const regex = new RegExp(escapeRegex(searchTerm), 'i');
        const pills = await models.Pill.find({
            $or: [
                { title: regex },
                { author: regex }
            ]
        }).sort({ _id: -1 });
        res.render('pills', { pills, formatDate});
    } catch (error) {
        console.error("Error searching for pills", error);
        res.status(500).send('Internal Server Error');
    }
});



app.post('/redpill-pill', async (req, res) => {
    const pillId = req.body.pillId;

    try {
        await models.Pill.updateOne({ pillId: pillId }, { $inc: { redpilledCount: 1 } });
        res.json({ message: 'Redpill count updated' });
    } catch (error) {
        console.error("Error updating redpill count:", error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/bluepill-pill', async (req, res) => {
    const pillId = req.body.pillId;

    try {
        await models.Pill.updateOne({ pillId: pillId }, { $inc: { bluepilledCount: 1 } });
        res.json({ message: 'Bluepill count updated' });
    } catch (error) {
        console.error("Error updating bluepill count:", error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
})
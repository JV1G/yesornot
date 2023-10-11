const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: String
    },
    text: {
        type: String
    },
    country: {
        type: String
    },
    commentId: {
        type: Number
    },
    imagePath: { 
        type: String
    },
    imageName: {
        type: String
    },
    imageSize: {
        type: String
    },
    imageResolution: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = commentSchema;
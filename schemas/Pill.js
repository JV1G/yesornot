const mongoose = require('mongoose');
const commentSchema = require('./Comment');

const pillSchema = new mongoose.Schema({
    title: {
        type: String
    },
    author: {
        type: String
    },
    text: {
        type: String
    },
    country: {
        type: String
    },
    redpilledCount: {
        type: Number,
        default: 1
    },
    bluepilledCount: {
        type: Number,
        default: 1
    },
    pillId: {
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
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = pillSchema;
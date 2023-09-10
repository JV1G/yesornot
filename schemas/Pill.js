const mongoose = require('mongoose');

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
        default: 0
    },
    bluepilledCount: {
        type: Number,
        default: 0
    },
    pillId: {
        type: Number
    },
    imagePath: { 
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = pillSchema;
const mongoose = require('mongoose');
const pillSchema = require('./schemas/Pill');

const Pill = mongoose.model('Pill', pillSchema);

module.exports = { Pill }
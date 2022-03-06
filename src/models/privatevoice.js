const mongoose = require('mongoose');

module.exports = mongoose.model("privatevoice", mongoose.Schema({
    memberID: {type: String, default: null},
    channelID: {type: String, default: null},
}));
module.exports = mongoose.model("privatevoice", mongoose.Schema({
    memberID: {type: String, default: null},
    vchannelID: {type: String, default: null},
    tchannelID: {type: String, default: null},
    password: {type: String, default: null},
    leaveDate: {type: Number, default: Date.now()},
}));
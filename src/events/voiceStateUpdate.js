const privateVoiceDatabase = require('../models/privatevoice');

module.exports = {
    event: "voiceStateUpdate",
    oneTime: false,
    ws: false,
    run: async (oldState, enwState) => {
        let privateVoiceData = await privateVoiceDatabase.findOne({ memberID: oldState.id });
        if (privateVoiceData && (!oldState.channel || (oldState.channel && oldState.channel.id == privateVoiceData?.channelID))) {
            privateVoiceData.leaveDate = Date.now();
            await privateVoiceData.save();
        }
    },
};

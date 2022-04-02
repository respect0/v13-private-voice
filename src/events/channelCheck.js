const privateVoiceDatabase = require('../models/privatevoice');

module.exports = {
    event: "ready",
    oneTime: true,
    ws: false,
    run: async (client) => {
        let guild = client.guilds.cache.get(settings.guild.id);
        if (!guild) return;
        setInterval(async () => {
            await check(guild)
        }, 10000)
    },
};

async function check(guild) {
    let privateVoiceData = await privateVoiceDatabase.find();
    if (privateVoiceData.length <= 0) return;
    privateVoiceData.map(async (data, i) => {
        setTimeout(async () => {
            let date = Date.now() - data.leaveDate;
            let member = guild.members.cache.get(data.memberID);
            if (!member) return await privateVoiceDatabase.deleteOne({ memberID: data.memberID });
            if (date > 1000 * 60 * 5) { //5 dakika = 300.000 == 1000 * 60 * 5
                if (member.voice.channel && member.voice.channel.id == data.channelID) return;
                let channel = { v: guild.channels.cache.get(data.vchannelID), t: guild.channels.cache.get(data.tchannelID) }
                await privateVoiceDatabase.deleteOne({ memberID: data.memberID });
                await channel.v.delete().catch(() => { });
                await channel.t.delete().catch(() => { });
                if (client.findChannel(channels.private.log)) client.findChannel(channels.private.log).send({ content: `${member}, özel odasına 5 dakikadır giriş yapmadığı için odası silindi.` });
            }
        }, i * 550);
    });
}

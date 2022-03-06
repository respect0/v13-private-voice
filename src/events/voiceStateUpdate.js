const privateVoiceDatabase = require("../models/privatevoice");

const { Permissions } = require('discord.js');

module.exports = async (oldState, newState) => {
    let member = oldState.guild.members.cache.get(oldState.id);
    let guild = oldState.guild;
    if (!guild || !member || member.user.bot) return;

    let privateData = await privateVoiceDatabase.findOne({memberID: oldState.id});

    if (newState.channel && newState.channel.id == channels.private.channel) {
        if(!privateData) new privateVoiceDatabase({memberID: oldState.id}).save();
        let everyone =  guild.roles.everyone;
        await guild.channels.create(`🎙️ ${member.user.username}`, {
            type: 'GUILD_VOICE',
            parent: channels.private.parent,
            permissionOverwrites: [
                {
                    id: everyone.id,
                    deny: [Permissions.FLAGS.CONNECT],
                },
                {
                    id: oldState.id,
                    allow: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.MUTE_MEMBERS, Permissions.FLAGS.DEAFEN_MEMBERS, Permissions.FLAGS.STREAM]
                },
            ],
        }).then(async (chn) => {
            await privateVoiceDatabase.updateOne({memberID: oldState.id}, {$set: {channelID: chn.id}});
            await member.voice.setChannel(chn.id)
            if (client.findChannel(channels.private.log)) client.findChannel(channels.private.log).send({ content: `${member}, özel oda oluşturma kanalına giriş yaptığı için **${chn.name}** özel odasını oluşturdum.` });

        })
    } else if(!oldState.channel || (oldState.channel && oldState.channel.id == privateData?.channelID)) {
        let channel = guild.channels.cache.get(privateData.channelID);
        if (client.findChannel(channels.private.log)) client.findChannel(channels.private.log).send({ content: `${member}, **${channel.name}** özel odasından çıktığı için odayı sildim.` });
        await channel.delete().catch(() => { });
        await privateVoiceDatabase.deleteOne({memberID: oldState.id});
    }

}
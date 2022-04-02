const { SlashCommandBuilder } = require("@discordjs/builders");

const privateVoiceDatabase = require('../models/privatevoice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gir')
        .setDescription('Belirtilen kişinin kanalı bulunuyorsa ve şifresi bulunuyorsa odasına giriş izni verir.')
        .addUserOption(option => option.setName("üye").setDescription("Özel odasına giriş yapmak istediğiniz kişiyi belirtiniz.").setRequired(true))
        .addStringOption(option => option.setName("şifre").setDescription("Odasına giriş yapmak istediğiniz kullanıcının oda şifresi.").setRequired(true)),
    run: async (interaction) => {
        const member = interaction.options.getUser('üye')
        const password = interaction.options.getString('şifre');

        let privateVoiceData = await privateVoiceDatabase.findOne({ memberID: member.id });
        if (!privateVoiceData) return interaction.reply({ content: `Bu kullanıcının özel odası bulunmuyor.`, ephemeral: true });
        if (privateVoiceData?.password && privateVoiceData?.password == password) {
            let channel = { v: interaction.guild.channels.cache.get(privateVoiceData.vchannelID), t: interaction.guild.channels.cache.get(privateVoiceData.tchannelID) }
            if (!channel.v || !channel.t) {
                await privateVoiceDatabase.deleteOne({ memberID: member.id });
                interaction.reply({ content: `Bu kişinin girebileceğiniz bir odası mevcut değil.`, ephemeral: true })
            } else {
                await channel.v.permissionOverwrites.edit(interaction.member.id, { CONNECT: true }).catch(() => { })
                await channel.t.permissionOverwrites.edit(interaction.member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true }).catch(() => { })
                interaction.reply({ content: `${member}, adlı kişinin **${channel.v}/${channel.t}** ismine sahip odasına giriş/görüntüleme izni kazandın.`, ephemeral: true })
            }
        } else {
            interaction.reply({ content: `Bu odanın şifresi yok veya yanlış şifre girdin.`, ephemeral: true });
        }
    },
};

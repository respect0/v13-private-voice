const Modal = require('../functions/Modal');
const privateVoiceDatabase = require('../models/privatevoice');

module.exports = {
    event: "interactionCreate",
    oneTime: false,
    ws: false,
    run: async (interaction) => {
        if (interaction.isButton()) {
            let ids = ["btnKanaliSil","btnKullaniciEkle","btnKullaniciKaldir"];
            if(!ids.includes(interaction.customId)) return;
            let guild = client.guilds.cache.get(settings.guild.id);
            let member = await guild.members.cache.get(interaction.member.user.id);
            let privateVoiceData = await privateVoiceDatabase.findOne({ memberID: member.id });
            if (!privateVoiceData) return;
            if(privateVoiceData?.tchannelID != interaction.channel.id) return interaction.reply({content: `Özel oda sana ait değil!`, ephemeral: true});
            if (interaction.customId == "btnKullaniciEkle") {
                const text = [{
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'kullaniciEkle',
                            label: 'Kullanıcı id',
                            placeholder: 'Kullanıcı id giriniz',
                            style: 1,
                            required: true
                        },
                    ],
                },]
                new Modal(interaction, "Kullanıcı ekle", "kullaniciEkle", text);
            } else if (interaction.customId == "btnKullaniciKaldir") {
                const text = [{
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: 'kullaniciKaldir',
                            label: 'Kullanıcı id',
                            placeholder: 'Kullanıcı id giriniz',
                            style: 1,
                            required: true
                        },
                    ],
                },]
                new Modal(interaction, "Kullanıcı kaldır", "kullaniciKaldir", text);
            } else if (interaction.customId == "btnKanaliSil") {
                let channel = { v: guild.channels.cache.get(privateVoiceData.vchannelID), t: guild.channels.cache.get(privateVoiceData.tchannelID) }
                interaction.reply({ content: `Odanız **3** saniye içerisinde silinecektir.`, ephemeral: true }).then(() => {
                    setTimeout(async () => {
                        await privateVoiceDatabase.deleteOne({ memberID: member.id });
                        await channel.v.delete().catch(() => { });
                        await channel.t.delete().catch(() => { });
                    }, 3000)
                    if (client.findChannel(channels.private.log)) client.findChannel(channels.private.log).send({ content: `${member}, oluşturduğu özel odasını sildi.` });
                })
            }
        }
    },
};
const { Permissions, MessageActionRow, MessageButton } = require('discord.js');
const privateVoiceDatabase = require('../models/privatevoice');

module.exports = {
    event: "INTERACTION_CREATE",
    ws: true,
    run: async (i) => {
        const ids = ['odaOlustur', 'odaDuzenle', 'odaSil', 'kullaniciKaldir', 'kullaniciEkle'];
        if (!ids.includes(i.data.custom_id)) return;
        let guild = client.guilds.cache.get(settings.guild.id);
        let everyone = guild.roles.everyone;
        let member = guild.members.cache.get(i.member.user.id);
        let text = `Bir sorun oluştu.`;
        let privateVoiceData = await privateVoiceDatabase.findOne({ memberID: member.id });
        let channel;
        if (privateVoiceData) {
            channel = { v: guild.channels.cache.get(privateVoiceData.vchannelID), t: guild.channels.cache.get(privateVoiceData.tchannelID) }
        }
        if (i.data.custom_id == 'odaOlustur') {
            await guild.channels.create(`${i.data.components[0].components[0].value}`, {
                userLimit: i.data.components[2].components[0].value || 0,
                type: 'GUILD_TEXT',
                parent: channels.private.tparent,
                permissionOverwrites: [
                    {
                        id: everyone.id,
                        deny: [Permissions.FLAGS.VIEW_CHANNEL],
                    },
                    {
                        id: member.id,
                        allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                    },
                ]
            }).then(async (tchn) => {
                await guild.channels.create(`${i.data.components[0].components[0].value}`, {
                    userLimit: i.data.components[2].components[0].value || 0,
                    type: 'GUILD_VOICE',
                    parent: channels.private.vparent,
                    permissionOverwrites: [
                        {
                            id: everyone.id,
                            deny: [Permissions.FLAGS.CONNECT],
                        },
                        {
                            id: member.id,
                            allow: [Permissions.FLAGS.CONNECT, Permissions.FLAGS.MUTE_MEMBERS, Permissions.FLAGS.DEAFEN_MEMBERS, Permissions.FLAGS.STREAM]
                        },
                    ]
                }).then(async (vchn) => {
                    new privateVoiceDatabase({
                        memberID: member.id,
                        tchannelID: tchn.id,
                        vchannelID: vchn.id,
                        password: i.data.components[1].components[0].value
                    }).save();
                    let row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setLabel("Kullanıcı ekle")
                                .setStyle("SECONDARY")
                                .setCustomId("btnKullaniciEkle"),
                            new MessageButton()
                                .setLabel("Kullanıcı kaldır")
                                .setStyle("SECONDARY")
                                .setCustomId("btnKullaniciKaldir"),
                            new MessageButton()
                                .setLabel("Kanalı sil")
                                .setStyle("DANGER")
                                .setCustomId("btnKanaliSil")
                        )
                    tchn.send({ content: `Aşağıdaki düğmeler ile odanı yönetebilirsin.`, components: [row] })
                    if (client.findChannel(channels.private.log)) client.findChannel(channels.private.log).send({ content: `${member}, **${i.data.components[0].components[0].value}** isminde sesli özel oda oluşturdu.` });
                    text = `**${i.data.components[0].components[0].value}** isminde odanız başarıyla oluşturuldu.`;
                })
            })
        } else if (i.data.custom_id == 'odaDuzenle') {
            if (!channel.v || !channel.t) {
                await channel.v.delete().catch(() => { });
                await channel.t.delete().catch(() => { });
                await privateVoiceDatabase.deleteOne({ memberID: member.id });
                return text = `Odanız bulunamadığı için oda veriniz silindi.`;
            }
            let degisiklikler = []
            i.data.components.map(async (x, i) => {
                if (x.components[0].custom_id == 'odaIsmi' && (x.components[0].value != channel.v.name)) {
                    let newObje = {
                        olay: "Oda ismi",
                        eskiVeri: channel.v.name,
                        yeniVeri: x.components[0].value,
                    };
                    degisiklikler.push(newObje);
                    setTimeout(async () => {
                        await channel.v.edit({ name: x.components[0].value });
                        //await channel.t.edit({ name: x.components[0].value }); Buna gerek yok istiyosan ekle
                    }, i * 500)
                } else if (x.components[0].custom_id == 'odaPass' && (x.components[0].value != privateVoiceData.password)) {
                    //if (!privateVoiceData.password || !x.components[0].value && (x.components[0].value.slice.join(' ').length < 0)) return;
                    //niye üst taraf acik degil
                    //burada niye böyle bir yazi var
                    let newObje = {
                        olay: "Oda şifresi",
                        eskiVeri: privateVoiceData.password,
                        yeniVeri: x.components[0].value || null
                    };
                    degisiklikler.push(newObje);
                    privateVoiceData.password = x.components[0].value || null;
                    await privateVoiceData.save();
                } else if (x.components[0].custom_id == 'odaLimit' && (x.components[0].value != channel.v.userLimit)) {
                    if (!isNaN(x.components[0].value)) return;
                    let newObje = {
                        olay: "Oda limiti",
                        eskiVeri: channel.v.userLimit,
                        yeniVeri: x.components[0].value || 0,
                    };
                    degisiklikler.push(newObje);
                    setTimeout(async () => {
                        await channel.v.edit({ userLimit: x.components[0].value || 0 })
                    }, i * 500)
                }
            })
            text = `Odanız başarıyla düzenlendi. Yapılan değişiklikler;\n\n${degisiklikler.length > 0 ? degisiklikler.map(x => `**${x.olay};**\n• Eski veri: \`${x.eskiVeri || "yok"}\`\n• Yeni veri: \`${x.yeniVeri || "yok"}\``).join('\n─────────────────\n') : `Her hangi bir değişiklik yapılmadı.`}`;
        } else if (i.data.custom_id == 'kullaniciEkle') {
            let member = guild.members.cache.get(i.data.components[0].components[0].value);
            if (!member) return text = `Böyle bir kullanıcı bulunamadı`;
            await channel.v.permissionOverwrites.edit(member.id, { CONNECT: true }).catch(() => { })
            await channel.t.permissionOverwrites.edit(member.id, { VIEW_CHANNEL: true, SEND_MESSAGES: true }).catch(() => { })
            text = `${member} adlı kişiye özel odanıza giriş/görme izni verildi.`;
        } else if (i.data.custom_id == 'kullaniciKaldir') {
            let member = guild.members.cache.get(i.data.components[0].components[0].value);
            if (!member) return text = `Böyle bir kullanıcı bulunamadı`;
            await channel.v.permissionOverwrites.delete(member.id).catch(() => { });
            await channel.t.permissionOverwrites.delete(member.id).catch(() => { });
            text = `${member} adlı kişiye verdiğiniz izin kaldırıldı.`;
        }
        client.api.interactions(i.id, i.token).callback.post({
            data: {
                type: 4,
                data: {
                    content: text,
                    flags: "64"
                }
            }
        })
    }
}

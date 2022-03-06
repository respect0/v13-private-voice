const { Permissions } = require("discord.js");
const privateVoiceDatabase = require("../../models/privatevoice");

module.exports.run = async (client, message, args, embed) => {
    let privateData = await privateVoiceDatabase.findOne({ memberID: message.author.id });
    if (message.member.voice.channel && (message.member.voice.channel.id == privateData.channelID)) {
        let vc = message.member.voice.channel;
        let secim = args[0];
        if (secim == "ekle") {
            let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!member) return message.reply({ content: `Odaya giriş izni vereceğin bir üye belirtmedin.` }).delete(20);
            await vc.permissionOverwrites.edit(member.id, { CONNECT: true });
            message.reply({ content: `${member} adlı kullanıcıya özel odanıza girebilmesi için izin verdin.` }).delete(20);
        } else if (secim == "kaldır") {
            let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
            if (!member) return message.reply({ content: `Odaya giriş iznini kaldıracağın bir üye belirtmedin.` }).delete(20);
            await vc.permissionOverwrites.delete(member.id).catch(() => { });
            message.reply({ content: `${member} adlı kullanıcı artık özel odanıza giriş yapamayacak.` }).delete(20);
        } else if (secim == "limit") {
            let limit = args[1];
            if (!limit) message.reply({ content: `Odanın limtini kaç olarak ayarlayacağımı belirtmedin.` }).delete(20);
            if (limit > 99) return message.reply({ content: `Oda limitin 99'dan fazla olamaz.` }).delete(20);
            if (limit <= 0) {
                await vc.edit({userLimit: 0})
                message.reply({ content: `Oda limiti \`sınırsız\` olarak ayarlandı.` }).delete(20);
            } else {
                await vc.edit({userLimit: limit})
                message.reply({ content: `Oda limiti \`${limit}\` olarak ayarlandı.` }).delete(20);
            }
        } else if (secim == "isim") {
            let isim = args.slice(1).join(' ');
            if (!isim) return message.reply({ content: `Değiştirilecek oda ismini belirtmedin.` }).delete(20);
            if (isim.length > 32) return message.reply({ content: `Belirttiğin isim \`32\` karakterden uzun olamaz.` }).delete(20);
            await vc.edit({ name: isim });
            message.reply({ content: `Özel odanızın ismi \`${isim}\` olarak ayarlandı.` }).delete(20);
        } else {
            message.reply({
                embeds: [
                    embed.setDescription(`
Geçerli bir kullanım belirtmediniz, yapabileceğiniz işlemler;

• \`${settings.bot.prefix}özeloda ekle <@respect/ID>\` Kanala girme izni verir.
• \`${settings.bot.prefix}özeloda kaldır <@respect/ID>\` Kanala girme izni varsa kaldırır.
• \`${settings.bot.prefix}özeloda limit <0-99>\` Oda limitinizi ayarlar.
• \`${settings.bot.prefix}özeloda isim <isim>\` Oda ismini değiştirir.
`)
                ]
            })
        }
    } else message.reply({ content: `Özel odaya bağlanılmamış.` }).delete(10);
};
exports.config = {
    category: "member",
    name: "özeloda",
    usage: `${settings.bot.prefix}özeloda`,
    guildOnly: true,
    aliases: ["secret"],
};

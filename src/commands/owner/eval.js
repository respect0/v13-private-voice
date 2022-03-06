module.exports.run = async (client, message, args, embed) => {
    if (!settings.bot.owners.includes(message.author.id)) return;
    if (!args[0]) return message.channel.send(`not content.`);
    let code = args.join(' ');
    function clean(text) {
        if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 })
        text = text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203))
        text = text.replaceAll(client.token, "bb");
        return text;
    };
    try {
        var evaled = clean(await eval(code));
        if (evaled.match(new RegExp(`${client.token}`, 'g')));
        message.channel.send({ embeds: [embed.setDescription(`\`\`\`js\n${evaled}\`\`\``)] });
    } catch (err) { message.channel.send({ embeds: [embed.setDescription(`\`\`\`js\n${err}\`\`\``)] }); };
};
exports.config = {
    category: "owner",
    name: "eval",
    usage: `${settings.bot.prefix}eval <code>`,
    guildOnly: true,
    aliases: ["eval"],
};

const { MessageEmbed } = require('discord.js');
const commandMap = new Map()

module.exports = async (message) => {
    let client = message.client;
    if (message.author.bot) return;
    if (!message.content.startsWith(settings.bot.prefix)) return;
    let command = message.content.split(' ')[0].slice(settings.bot.prefix.length);
    let params = message.content.split(' ').slice(1);
    let embed = new MessageEmbed().setColor('RANDOM').setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) }).setFooter({ text: `respect only? yum`, iconURL: message.author.avatarURL({ dynamic: true }) }).setTimestamp()
    let cmd;
    if (client.commands.has(command)) {
        cmd = client.commands.get(command);
    } else if (client.aliases.has(command)) {
        cmd = client.commands.get(client.aliases.get(command));
    };
    if (cmd) {
        if (!message.guild) {
            if (cmd.global.settings.guildOnly === true) {
                return;
            };
        };
        cmd.run(client, message, params, embed);
    };
};
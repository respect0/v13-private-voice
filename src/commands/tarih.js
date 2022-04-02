const { SlashCommandBuilder } = require("@discordjs/builders");
let moment = require('moment');
require('moment-duration-format');
moment.locale('tr');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tarih')
        .setDescription('tarih'),
    run: async (interaction) => {
        interaction.reply({content: `Sunucu tarihi : ${moment(interaction.guild.createdTimestamp).format("LLL")}`})
    },
};

const { SlashCommandBuilder } = require("@discordjs/builders");
const Modal = require('../functions/Modal');

const privateVoiceDatabase = require('../models/privatevoice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('özeloda')
    .setDescription('Özel oda oluşturmanızı sağlar. Eğer ki odanız varsa düzenleyebilirsiniz.')
    .addStringOption(option =>
      option.setName('tip')
        .setDescription('Özel odalar hakkında ne yapacağınızı belirtiniz.')
        .setRequired(true)
        .addChoice('Oluştur', 'olustur')
        .addChoice('Sil', 'sil')
        .addChoice('Düzenle', 'duzenle')),
  run: async (interaction) => {
    const type = interaction.options.getString("tip")
    let privateVoiceData = await privateVoiceDatabase.findOne({ memberID: interaction.member.id });
    if (type == "olustur") {
      if (privateVoiceData || privateVoiceData?.channelID) return interaction.reply({ content: `Yeni oda oluşturabilmek için önceki odanı silmelisin.`, ephemeral: true });
      const text = [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'odaIsmi',
              label: 'Oda isminiz',
              placeholder: '(4-28) karakter',
              style: 1,
              min_length: 4,
              max_length: 28,
              required: true
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'odaPass',
              label: 'Oda şifreniz',
              placeholder: '(4-28) karakter',
              style: 1,
              min_length: 4,
              max_length: 28,
              required: false
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'odaLimit',
              label: 'Oda limitiniz',
              value: '0',
              placeholder: '(0-99) aralığında',
              style: 1,
              max_length: 2,
              required: false
            },
          ],
        },
      ]
      new Modal(interaction, "Oda oluştur", "odaOlustur", text);
    } else if (type == "sil") {
      if (!privateVoiceData) return interaction.reply({ content: `Silebileceğin her hangi bir özel oda bulunmuyor.`, ephemeral: true });
      let channel = { v: guild.channels.cache.get(privateVoiceData.vchannelID), t: guild.channels.cache.get(privateVoiceData.tchannelID) }
      interaction.reply({ content: `Odanız **3** saniye içerisinde silinecektir.`, ephemeral: true }).then(async () => {
        setTimeout(async () => {
          await privateVoiceDatabase.deleteOne({ memberID: member.id });
          await channel.v.delete().catch(() => { });
          await channel.t.delete().catch(() => { });
        }, 3000)
        if (client.findChannel(channels.private.log)) client.findChannel(channels.private.log).send({ content: `${member}, oluşturduğu özel odasını sildi.` });
      });
    } else if (type == "duzenle") {
      if (!privateVoiceData) return interaction.reply({ content: `Düzenleyebileceğin her hangi bir özel oda bulunmuyor.`, ephemeral: true });
      let channel = {v: interaction.guild.channels.cache.get(privateVoiceData.vchannelID),t:interaction.guild.channels.cache.get(privateVoiceData.tchannelID)}
      const text = [
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'odaIsmi',
              label: 'Oda isminiz',
              value: channel.v.name,
              placeholder: 'Yeni oda isminiz',
              style: 1,
              min_length: 4,
              max_length: 28,
              required: true
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'odaPass',
              label: 'Oda şifreniz',
              placeholder: 'Yeni oda şifreniz',
              style: 1,
              min_length: 4,
              max_length: 28,
              required: false
            },
          ],
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              custom_id: 'odaLimit',
              label: 'Oda limitiniz',
              value: channel.v.userLimit,
              placeholder: 'Yeni oda limitiniz (0-99)',
              style: 1,
              max_length: 2,
              required: false
            },
          ],
        },
      ]
      new Modal(interaction, "Oda düzenle", "odaDuzenle", text);
    }
  },
};

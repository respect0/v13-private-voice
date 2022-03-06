module.exports = async client => {
  console.log(client.user.tag + ' ismiyle giriş yapıldı!')
  client.user.setPresence({ activities: [{ type: "PLAYING", name: settings.bot.activity }], status: 'dnd' })
};
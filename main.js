const { Collection, Client } = require("discord.js")
const client = (global.client = new Client({ intents: [32767] }));
const mongoose = require('mongoose');
const fs = require('fs');
require('./src/functions/functions.js');
require('./src/util/eventLoader.js')(client);

const settings = global.settings = require("./src/settings/settings.json");
const channels = global.channels = require("./src/settings/channels.json");


mongoose.connect(settings.bot.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
client.login(settings.bot.token).then(() => console.log("[!] Bağlantı kuruldu."));
client.commands = new Collection();
client.aliases = new Collection();

fs.readdir('./src/commands/', (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        fs.readdir("./src/commands/" + f, (err2, files2) => {
            files2.forEach(file => {
                let props = require(`./src/commands/${f}/` + file);
                console.log(`[+] ${props.config.name} komutu yüklendi!`);
                client.commands.set(props.config.name, props);
                props.config.aliases.forEach(alias => {
                    client.aliases.set(alias, props.config.name);
                });
            })
        })
    });
});



// Util
const { Client, Collection } = require('discord.js')
const mongoose = global.mongoose = require('mongoose');
const settings = global.settings = require('./src/settings/settings.json')
const channels = global.channels = require('./src/settings/channels.json')
const ora = global.ora = require('ora');

//Client
const client = (global.client = new Client({ intents: [32767] }))

//Functions
require('./src/functions/functions');

//Mongoose
mongoose.connect(settings.bot.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

// Slash Commands
require('./src/util/event').load(client);
const slash = require('./src/util/slash')

// Commands
client.commands = new Collection()

//Login
client.login(settings.bot.token)
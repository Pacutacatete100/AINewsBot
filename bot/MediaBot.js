var botLogin = require('../tsconfig.json');
let login = botLogin.token;

const Discord = require('discord.js');
const client = new Discord.Client();

const ScienceDaily = require('./ScienceDaily');
const dcommands = require('./commands');

client.login(login);

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('ready', async () => {
	console.log('bot is online');
	let channel = client.channels.find(channel => channel.id === '491806365413670918'); //test channel id: 491806365413670918

	dcommands.commands(channel);

	await delay(30000); //.5 minutes

	ScienceDaily.scrapeForLinkSD(channel);

	setInterval(() => {
		ScienceDaily.scrapeForLinkSD(channel);
	}, 86400000); //24 hours 86400000
});

client.on('message', async recievedMessage => {
	if (recievedMessage.author === client.user)
		//if message was sent by bot, return (otherwise could be infinite loop)
		return;
	if (recievedMessage.content.startsWith('!')) dcommands.processCommand(recievedMessage);
});

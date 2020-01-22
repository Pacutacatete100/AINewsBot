const ScienceDaily = require('./ScienceDaily');
const Discord = require('discord.js');

async function processCommand(recievedMessage) {
	let fullCommand = recievedMessage.content.substr(1);
	let splitCommand = fullCommand.split(' ');
	let primaryCommand = splitCommand[0];
	let args = splitCommand.slice(1);

	if (primaryCommand === 'multiply') multiplyCommand(args, recievedMessage);
	else if (primaryCommand === 'github') recievedMessage.channel.send('https://github.com/Pacutacatete100/AINewsBot');
	else if (primaryCommand === 'add') addCommand(args, recievedMessage);
	else if (primaryCommand === 'factorial') factorial(args, recievedMessage);
	else if (primaryCommand === 'search') ScienceDaily.searchSD(args, recievedMessage);
	else if (primaryCommand === 'help') commands(recievedMessage.channel);
}

function commands(channel) {
	let message =
		'**multiply**: _numbers you want me to multiply separated by spaces_\n' +
		'**add**: _numbers you want me to add separated by spaces_\n' +
		'**factorial**: _number you want me to find the factorial of_\n' +
		'**search**: _enter a search term (or many separated by commas) and I will find them in an article_\n';

	let embed = new Discord.RichEmbed()
		.setAuthor('Help')
		.setColor('#00bfff')
		.setTitle('**Possible Commands:**\n')
		.setDescription(message)
		.setTimestamp();
	channel.send(embed);
}

function multiplyCommand(args, recievedMessage) {
	let product = 1;

	args.forEach(value => {
		product = product * parseFloat(value);
	});

	recievedMessage.channel.send(product.toString());
}

function addCommand(args, recievedMessage) {
	let sum = 0;

	args.forEach(value => {
		sum += parseFloat(value);
	});

	recievedMessage.channel.send(sum.toString());
}

function factorial(args, recievedMessage) {
	var sum = 1;
	args.forEach(value => {
		for (var i = 1; i <= value; i++) {
			sum = sum * i;
		}
	});

	recievedMessage.channel.send(sum.toString());
}

module.exports = { processCommand, commands, multiplyCommand, addCommand, factorial };

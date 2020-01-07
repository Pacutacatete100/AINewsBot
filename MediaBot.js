var botLogin = require('./tsconfig.json');
let login = botLogin.token;

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const cheerio = require('cheerio');

client.login(login);

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('ready', async () => {
	let channel = client.channels.find(channel => channel.id === '491806365413670918'); //test channel id: 491806365413670918

	commands(channel);

	await delay(30000); //.5 minute

	scrapeForLinkSD(channel);

	setInterval(() => {
		scrapeForLinkSD(channel);
	}, 86400000); //24 hours 86400000
});

client.on('message', async recievedMessage => {
	if (recievedMessage.author === client.user)
		//if message was sent by bot, return (otherwise could be infinite loop)
		return;
	if (recievedMessage.content.startsWith('!')) processCommand(recievedMessage);
});

async function processCommand(recievedMessage) {
	let fullCommand = recievedMessage.content.substr(1);
	let splitCommand = fullCommand.split(' ');
	let primaryCommand = splitCommand[0];
	let args = splitCommand.slice(1);

	if (primaryCommand === 'multiply') multiplyCommand(args, recievedMessage);
	else if (primaryCommand === 'github')
		recievedMessage.channel.send('https://github.com/Pacutacatete100/AINewsBot/blob/master/MediaBot.js');
	else if (primaryCommand === 'add') addCommand(args, recievedMessage);
	else if (primaryCommand === 'factorial') factorial(args, recievedMessage);
	else if (primaryCommand === 'search') searchSD(args, recievedMessage);
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

/**------------------------------------------Science Daily-------------------------------------------------------------**/

async function scrapeForLinkSD(channel) {
	let link;
	let title;
	let scienceDailyURL = 'https://www.sciencedaily.com';

	let x = request(
		'https://www.sciencedaily.com/news/computers_math/artificial_intelligence/',
		async (error, response, html) => {
			let success = !error && response.statusCode === 200;
			if (success) {
				const $ = cheerio.load(html);
				let htmlElement = '#featured_tab_1';
				title = $(htmlElement)
					.find('.latest-head')
					.find('a')
					.text();
				link = $(htmlElement)
					.find('.latest-head')
					.find('a')
					.attr('href');
			}
			scrapeForSourceSD(scienceDailyURL + link, title, channel);

			//TODO: scrape for link every hour, if link is new, send, if not dont send
		}
	);
}

async function scrapeForSourceSD(link, title, channel) {
	let source;
	let summary;

	let x = request(link, (error, response, html) => {
		let success = !error && response.statusCode === 200;

		if (success) {
			const $ = cheerio.load(html);
			summary = $('#abstract').text();
			source = $('#story_source')
				.find('a')
				.attr('href');
		}
		sendSourceLinkSD(title, summary, source, channel);
	});
}

async function sendSourceLinkSD(title, summary, link, channel) {
	let embed = new Discord.RichEmbed()
		.setAuthor('Daily News')
		.setColor('#00bfff')
		.setTitle(title)
		.setDescription(summary)
		.addField('Link:', link)
		.setTimestamp();

	channel.send(embed);
}

async function searchSD(args, recievedMessage) {
	recievedMessage.channel.send('searching for ' + args + '...');
	let scienceDailyURL = 'https://www.sciencedaily.com';
	let titleArr = [];
	let link;
	let title;
	let refArr = [];
	let ref;
	let value;
	let endLink;
	let keyWordsArr = [];

	args.forEach(val => {
		keyWordsArr.push(val);
	});

	let x = request(
		'https://www.sciencedaily.com/news/computers_math/artificial_intelligence/',
		(error, response, html) => {
			let success = !error && response.statusCode === 200;

			if (success) {
				const $ = cheerio.load(html);
				$('#featured_shorts a').each((index, element) => {
					title = $(element).text();
					titleArr.push(title);
					ref = element.attribs.href;
					refArr.push(ref);
				});

				$('#summaries a').each((index, element) => {
					title = $(element).text();
					titleArr.push(title);
					ref = element.attribs.href;
					refArr.push(ref);
				});

				for (let i = 0; i < titleArr.length; i++) {
					value = titleArr[i];
					endLink = refArr[i];
					//value.toLowerCase().includes(args)
					if (keyWordsArr.every(item => value.toLowerCase().includes(item))) {
						link = scienceDailyURL + endLink;
						scrapeForSourceSD(link, value, recievedMessage.channel);
					}
				}
			}
		}
	);
}

// TODO: scrape for news from google news
//https://serpapi.com/playground?engine=google&q=coffee&google_domain=google.com
//https://serpapi.com/news-results
//https://www.google.com/search?q=ai&sxsrf=ACYBGNRKyZFRIOYcbq3N4DNWwU3_jNYc8A:1577605237369&source=lnms&tbm=nws&sa=X&ved=2ahUKEwijj5O-rdrmAhXFKH0KHblhB6MQ_AUoAXoECA0QAw&biw=1536&bih=722

// TODO: https://www.feedspot.com/infiniterss.php?followfeedid=4575139&q=site:https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DMachine%2BLearning%26hl%3Den-US%26gl%3DUS%26ceid%3DUS%253Aen%26x%3D1571747125.1658
//http://news.mit.edu/topic/artificial-intelligence2

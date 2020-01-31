const request = require('request');
const cheerio = require('cheerio');
const Discord = require('discord.js');

const delay = ms => new Promise(res => setTimeout(res, ms));

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
			scrapeForSourceSD(scienceDailyURL + link, title, channel, 1);

			//TODO: scrape for link every hour, if link is new, send, if not dont send
		}
	);
}

async function scrapeForSourceSD(link, title, channel, count) {
	let source;
	let summary;
	let sourceArr = [];

	let x = request(link, (error, response, html) => {
		let success = !error && response.statusCode === 200;

		if (success) {
			const $ = cheerio.load(html);
			summary = $('#abstract').text();
			source = $('#story_source')
				.find('a')
				.attr('href');
		}
		sourceArr.push(source);
		sendSourceLinkSD(title, summary, source, channel, count);
		//TODO:
		// if (count > 1) {
		// 	sendMultipleSourceLinkSD(title, sourceArr, channel);
		// } else {
		// 	sendSourceLinkSD(title, summary, source, channel, count);
		// }
	});
}
async function sendMultipleSourceLinkSD(title, sourceArr, channel) {
	//TODO git test
}

async function sendSourceLinkSD(title, summary, link, channel, count) {
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
				let finalTitleArr = [];
				let finalLinkArr = [];
				let count = 0;
				for (let i = 0; i < titleArr.length; i++) {
					value = titleArr[i];
					endLink = refArr[i];
					if (keyWordsArr.every(item => value.toLowerCase().includes(item))) {
						finalTitleArr.push(value);
						link = scienceDailyURL + endLink;
						finalLinkArr.push(link);
						count++;
					}
				}
				for (let i = 0; i < finalLinkArr.length; i++) {
					scrapeForSourceSD(finalLinkArr[i], finalTitleArr[i], recievedMessage.channel, count);
				}
			}
		}
	);
}

module.exports = { scrapeForLinkSD, scrapeForSourceSD, sendSourceLinkSD, searchSD };

// TODO: scrape for news from google news
//https://serpapi.com/playground?engine=google&q=coffee&google_domain=google.com
//https://serpapi.com/news-results
//https://www.google.com/search?q=ai&sxsrf=ACYBGNRKyZFRIOYcbq3N4DNWwU3_jNYc8A:1577605237369&source=lnms&tbm=nws&sa=X&ved=2ahUKEwijj5O-rdrmAhXFKH0KHblhB6MQ_AUoAXoECA0QAw&biw=1536&bih=722

// TODO: https://www.feedspot.com/infiniterss.php?followfeedid=4575139&q=site:https%3A%2F%2Fnews.google.com%2Frss%2Fsearch%3Fq%3DMachine%2BLearning%26hl%3Den-US%26gl%3DUS%26ceid%3DUS%253Aen%26x%3D1571747125.1658
//http://news.mit.edu/topic/artificial-intelligence2

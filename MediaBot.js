var botLogin = require("./tsconfig.json");
let login = botLogin.token;

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const cheerio = require('cheerio');

client.login(login);

client.on('ready', () =>{
    let channel = client.channels.find(channel => channel.id === '641670546127454208');
    channel.send("Bot is now online!");
    scrapeForLinkSD(channel);

    setInterval(() => {
        scrapeForLinkSD(channel)
    }, 86400000);//24 hours 86400000
});

client.on('message', (recievedMessage) => {
    if(recievedMessage.author === client.user)//if message was sent by bot, return (otherwise could be infinite loop)
        return;
    if(recievedMessage.content.startsWith("!"))
        processCommand(recievedMessage);
});

function processCommand(recievedMessage) {
    let fullCommand = recievedMessage.content.substr(1);
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0];
    let args = splitCommand.slice(1);

    if (primaryCommand === "multiply")
        multiplyCommand(args, recievedMessage);

    else if (primaryCommand === "github")
        recievedMessage.channel.send("https://github.com/Pacutacatete100/AINewsBot/blob/master/MediaBot.js");

    else if (primaryCommand === "add")
        addCommand(args, recievedMessage);

    else if(primaryCommand === "factorial")
        factorial(args, recievedMessage);

    else if (primaryCommand === "search")
        searchSD(args, recievedMessage);

}

function multiplyCommand(args, recievedMessage) {
    let product = 1;

    args.forEach((value) => {
        product = product * parseFloat(value)
    });

    recievedMessage.channel.send(product.toString())
}

function addCommand(args, recievedMessage) {
    let sum = 0;

    args.forEach((value) => {
        sum += parseFloat(value)
    });

    recievedMessage.channel.send(sum.toString())
}

function factorial(args, recievedMessage) {
    var sum = 1;
    args.forEach((value) => {
        for (var i = 1; i <= value; i++) {
            sum = sum * i;
        }
    });

    recievedMessage.channel.send(sum.toString())
}

/**------------------------------------------Science Daily-------------------------------------------------------------**/
function scrapeForLinkSD(channel) {
    let link;
    let title;
    let scienceDailyURL = "https://www.sciencedaily.com";

    let x = request("https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
        (error, response, html) => {
            let success = !error && response.statusCode === 200;
            if (success){
                const $ = cheerio.load(html);
                let htmlElement = '#featured_tab_1';
                title = $(htmlElement).find('.latest-head').find('a').text();
                link = $(htmlElement).find('.latest-head').find('a').attr('href');
            }
            scrapeForSourceSD((scienceDailyURL + link), title, channel);
        }
    );
}

function scrapeForSourceSD(link, title, channel) {

    let source;
    let summary;

    let x = request(link, (error, response, html) => {
        let success = !error && response.statusCode === 200;

        if (success) {
            const $ = cheerio.load(html);
            summary = $('#abstract').text();
            source = $('#story_source').find('a').attr('href');
        }
        sendSourceLinkSD(title, summary, source, channel);
    });
}

function sendSourceLinkSD(title, summary, link, channel) {
    let embed = new Discord.RichEmbed()
        .setAuthor('Daily News')
        .setColor('#00bfff')
        .setTitle(title)
        .setDescription(summary)
        .addField('Link:', link)
        .setTimestamp();

    channel.send(embed);
}

function searchSD(args, recievedMessage) {
    recievedMessage.channel.send("searching...");
    let scienceDailyURL = "https://www.sciencedaily.com";
    let titleArr = [];
    let link;
    let title;
    let refArr = [];
    let ref;
    let value;
    let endLink;

    let x = request("https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
        (error, response, html) => {
            let success = !error && response.statusCode === 200;

            if (success) {
                const $ = cheerio.load(html);
                $('#featured_shorts a').each((index, element) => {
                    title = $(element).text();
                    titleArr.push(title);
                    ref = element.attribs.href;
                    refArr.push(ref);
                    console.log(refArr);
                });
                for (let i = 0; i < titleArr.length; i++) {
                    value = titleArr[i];
                    endLink = refArr[i];
                    if (value.includes(args)) {
                        link = scienceDailyURL + endLink;
                        scrapeForSourceSD(link, value, recievedMessage.channel);
                    }
                }
            }
        }
    );
}

// TODO: scrape for news from google news
// TODO: scrape for news in these websites:
//www.aitrends.com/
//www.aitrends.com/category/ai-software/
//www.aitrends.com/category/deep-learning/
//www.aitrends.com/category/image-recognition/
//www.aitrends.com/category/machine-learning/
//www.aitrends.com/nlp-speech-recognition/
//www.aitrends.com/category/neural-networks/
//www.aitrends.com/category/predictive-analytics/
//www.aitrends.com/research-the-future-of-ai/
//www.aitrends.com/category/robotics/
// TODO: have a category command, user can choose from any category above
//http://news.mit.edu/topic/artificial-intelligence2



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

    setInterval(() => {
        scrapeForLink(channel)
    }, 86400000);//24 hours
});

client.on('message', (recievedMessage) =>{
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
        search(args, recievedMessage);

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

function scrapeForLink(channel) {
    let link;
    let title;
    let scienceDailyURL = "https://www.sciencedaily.com";

    let x = request("https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
        (error, response, html) => {
            let success = !error && response.statusCode === 200;
            if (success){
                const $ = cheerio.load(html);
                title = $('#featured_tab_1').find('.latest-head').find('a').text();
                link = $('#featured_tab_1').find('.latest-head').find('a').attr('href');
            }
            scrapeForSource((scienceDailyURL + link), title, channel);
        });
     //TODO: add search-ability, users can say key terms they want in a search and bot searches for key terms in summary or title

}

function scrapeForSource(link, title, channel) {

    let source;
    let summary;

    let x = request(link, (error, response, html) => {
        let success = !error && response.statusCode === 200;

        if (success) {
            const $ = cheerio.load(html);
            summary = $('#abstract').text();
            source = $('#story_source').find('a').attr('href');
        }
        sendSourceLink(title, summary, source, channel);
    });
}

function sendSourceLink(title, summary, link, channel) {
    let embed = new Discord.RichEmbed()
        .setAuthor('Daily News')
        .setColor('#00bfff')
        .setTitle(title)
        .setDescription(summary)
        .addField('link:', link)
        .setTimestamp();

    channel.send(embed);
}

function search(args, recievedMessage) {
    recievedMessage.channel.send("searching")
    //TODO: add search-ability, user can use command with key words to search for articles
}





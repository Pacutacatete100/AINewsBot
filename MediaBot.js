var botLogin = require("./tsconfig.json");
let login = botLogin.token;

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const cheerio = require('cheerio');

client.login(login);

const delay = ms => new Promise(res => setTimeout(res, ms));

client.on('ready', async () => {
    let channel = client.channels.find(channel => channel.id === '491806365413670918');//test channel id: 491806365413670918

    commands(channel);

    await delay(30000);//.5 minute

    scrapeForLinkSD(channel);

    setInterval(() => {
        scrapeForLinkSD(channel)
    }, 86400000);//24 hours 86400000

});

client.on('message', async (recievedMessage) => {
    if(recievedMessage.author === client.user)//if message was sent by bot, return (otherwise could be infinite loop)
        return;
    if(recievedMessage.content.startsWith("!"))
        processCommand(recievedMessage);
});

async function processCommand(recievedMessage) {
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

    else if (primaryCommand === "help")
        commands(recievedMessage.channel)

}

function commands(channel) {
    let message = "**multiply**: _numbers you want me to multiply separated by spaces_\n" +
        "**add**: _numbers you want me to add separated by spaces_\n" +
        "**factorial**: _number you want me to find the factorial of_\n" +
        "**search**: _enter a search term (or many separated by commas) and I will find them in an article_\n";

    let embed = new Discord.RichEmbed()
        .setAuthor('Help')
        .setColor('#00bfff')
        .setTitle('**Possible Commands:**\n')
        .setDescription(message)
        .setTimestamp();
    channel.send(embed)

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

/**------------------------------------------------------Science Daily--------------------------------------------------------------------**/

async function scrapeForLinkSD(channel) {
    let link;
    let title;
    let scienceDailyURL = "https://www.sciencedaily.com";

    let x = request("https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
        async (error, response, html) => {
            let success = !error && response.statusCode === 200;
            if (success){
                const $ = cheerio.load(html);
                let htmlElement = '#featured_tab_1';
                title = $(htmlElement).find('.latest-head').find('a').text();
                link = $(htmlElement).find('.latest-head').find('a').attr('href');
            }
            /**
            TODO: send message if no article with search words is found
            **/

            scrapeForSourceSD((scienceDailyURL + link), title, channel);
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
            source = $('#story_source').find('a').attr('href');
        }
        sendSourceLinkSD(title, summary, source, channel);

    });
}

async function sendSourceLinkSD(title, summary, link, channel) {

    let embed = new Discord.RichEmbed()
        .setAuthor('AI News')
        .setColor('#00bfff')
        .setTitle(title)
        .setDescription(summary)
        .addField('Link:', link)
        .setTimestamp();

    channel.send(embed);

}

async function searchSD(args, recievedMessage) {
    recievedMessage.channel.send("searching for " + args + "...");
    let scienceDailyURL = "https://www.sciencedaily.com";
    let titleArr = [];
    let link;
    let title;
    let referenceArr = [];
    let ref;
    let value;
    let endLink;
    let keyWordsArr = [];

    args.forEach((val) => {
        keyWordsArr.push(val)
    });

    let x = request("https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
        (error, response, html) => {
            let success = !error && response.statusCode === 200;

            if (success) {
                const $ = cheerio.load(html);
                $('#featured_shorts a').each((index, element) => {
                    title = $(element).text();
                    titleArr.push(title);
                    ref = element.attribs.href;
                    referenceArr.push(ref);
                });

                $('#summaries a').each((index, element) => {
                    title = $(element).text();
                    titleArr.push(title);
                    ref = element.attribs.href;
                    referenceArr.push(ref);
                });

                let linkCount = 0;
                let linkArray = [];
                let titleArrFinal = [];

                for (let i = 0; i < titleArr.length; i++) {
                    value = titleArr[i];
                    endLink = referenceArr[i];

                    if (keyWordsArr.every(item => value.toLowerCase().includes(item))) {
                        link = scienceDailyURL + endLink;
                        linkArray.push(link);
                        linkCount++
                        titleArrFinal.push(value)
                    }
                }
                promptChooseLinkToSend(linkCount, linkArray, recievedMessage.channel, args, titleArrFinal)
            }
        }
    );
}

async function promptChooseLinkToSend(count, linkArray, channel, args, titleArr) {
    if (count > 1) {
        channel.send("There are " + count + " articles with the word(s) " + args + ", choose which one you want to view: \n");
        await delay(1000);

        for (var i = 0; i < linkArray.length; i++) {
            channel.send(i + ": **" + titleArr[i] + "**");
            await delay(1000);
        }
    }
    if (count === 1 ) {
        scrapeForSourceSD(linkArray[0], title, channel);
    }

    client.on('message', async (choice) => {
        if(choice.author === client.user)//if message was sent by bot, return (otherwise could be infinite loop)
            return;

        let choiceNum = choice.content.toString()

        scrapeForSourceSD(linkArray[choiceNum], titleArr[choiceNum], choice.channel);

    });


}

/**---------------------------------------------------------------------------------------------------------------------------------------**/
// TODO: scrape for news from google news
//https://serpapi.com/playground?engine=google&q=coffee&google_domain=google.com
//https://serpapi.com/news-results
//https://www.google.com/search?q=ai&sxsrf=ACYBGNRKyZFRIOYcbq3N4DNWwU3_jNYc8A:1577605237369&source=lnms&tbm=nws&sa=X&ved=2ahUKEwijj5O-rdrmAhXFKH0KHblhB6MQ_AUoAXoECA0QAw&biw=1536&bih=722

//http://news.mit.edu/topic/artificial-intelligence2

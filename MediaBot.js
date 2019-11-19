
var botLogin = require("./tsconfig.json");
let login = botLogin.token;

const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const cheerio = require('cheerio');

client.login(login);

client.on('ready', () => { //when bot connects, do all below

    console.log("connected as " + client.user.tag);
    client.guilds.forEach((guild) =>{
        console.log(guild.name);
        guild.channels.forEach((channel) => {
            console.log(channel.name + " " + channel.type + " " + channel.id)
        })
    });
});

client.on('message', (recievedMessage) =>{
    if(recievedMessage.author === client.user){//if message was sent by bot, return (otherwise could be infinite loop)
        return
    }

    if(recievedMessage.content.startsWith("!")){
        processCommand(recievedMessage)
    }
});

function processCommand(recievedMessage) {
    let fullCommand = recievedMessage.content.substr(1);
    let splitCommand = fullCommand.split(" ");
    let primaryCommand = splitCommand[0];
    let args = splitCommand.slice(1);

    if (primaryCommand === "multiply") {
        multiplyCommand(args, recievedMessage)
    }
    else if (primaryCommand === "github"){
        recievedMessage.channel.send("https://github.com/Pacutacatete100/AINewsBot/blob/master/MediaBot.js")
    }
    else if (primaryCommand === "add") {
        addCommand(args, recievedMessage)
    }
    else if(primaryCommand === "factorial"){
        factorial(args, recievedMessage)
    }
    else  if (primaryCommand === "news"){
        scrapeForLink(recievedMessage)
    }
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

function getLink() {
    let linkArr = ["https://www.devdungeon.com/content/javascript-discord-bot-tutorial",
        "https://www.cmu.edu/",
        "http://www.mit.edu/",
        "https://blog.feedspot.com/ai_blogs/",
        "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/"];

    return linkArr[Math.floor(Math.random() * linkArr.length)]
}

function scrapeForLink(recievedMessage) {

    let titleArr = [];
    let linkArr = [];
    let scienceDailyURL = "https://www.sciencedaily.com";

    request("https://www.sciencedaily.com/news/computers_math/artificial_intelligence/",
    (error, response, html) => {
        let success = !error && response.statusCode === 200;

        if (success){
            const $ = cheerio.load(html);

            $('.latest-head').each((index, element)=>{
                const title = $(element)
                    .text();
                const link = $(element)
                    .find('a')
                    .attr('href');

                titleArr.push(title);
                linkArr.push(link);
            });

            recievedMessage.channel
                .send(titleArr[4] + ": " + scienceDailyURL + linkArr[4])
        }
        //TODO: make this initial link, then find the "story source" URL and send that
    })
}


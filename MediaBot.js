
const Discord = require('discord.js');
const client = new Discord.Client();
client.login("TOKEN");

client.on('ready', () => {//when bot connects, do all below

    console.log("connected as " + client.user.tag);
    client.guilds.forEach((guild) =>{
        console.log(guild.name);
        guild.channels.forEach((channel) => {
            console.log(channel.name + channel.type + channel.id)
        })
    });

    let generalChat = client.channels.get("641670546127454208");
    generalChat.send("Hello World")
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
    if (primaryCommand === "link") {
        sendLink(recievedMessage)
    }
}

function multiplyCommand(args, recievedMessage) {
    let product = 1;

    args.forEach((value) => {
        product = product * parseFloat(value)
    });

    recievedMessage.channel.send(product.toString())
}

function sendLink(recievedMessage) {
    let linkArr = ["https://www.devdungeon.com/content/javascript-discord-bot-tutorial",
        "https://www.cmu.edu/",
        "http://www.mit.edu/",
        "https://blog.feedspot.com/ai_blogs/",
        "https://www.sciencedaily.com/news/computers_math/artificial_intelligence/"];

    recievedMessage.channel.send(linkArr[Math.floor(Math.random() * linkArr.length)])
}
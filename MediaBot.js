
const Discord = require('discord.js');
const client = new Discord.Client();
client.login("NjQxNjY2NjgyMTc5NDIwMTc1.XcLs-A.BYw_SwxD0dIlpq3Eg5sIXOBfEHU");

client.on('ready', () => {//when bot connects, do all below

    console.log("connected as " + client.user.tag);
    client.guilds.forEach((guild) =>{
        console.log(guild.name);
        guild.channels.forEach((channel) => {
            console.log(channel.name + channel.type + channel.id)
        })
    });

    let generalChat = client.channels.get("491806365413670918");
    const attachment = new Discord.Attachment("https://www.youtube.com/watch?v=8o25pRbXdFw");//send link here
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
}

function multiplyCommand(args, recievedMessage) {
    let product = 1;

    args.forEach((value) => {
        product = product * parseFloat(value)
    });

    recievedMessage.channel.send(product.toString())
}
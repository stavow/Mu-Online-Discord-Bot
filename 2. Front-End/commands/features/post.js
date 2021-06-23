const commando = require('discord.js-commando')
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');
const { parse } = require('path');
var sqlite = require('sqlite3');
var essentials = require('../essentials');
class PostCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'post',
            group: 'features',
            memberName: 'post',
            description: 'Post a message on the game server'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("POSTCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMUNICATIONCHANNEL")) {message.delete();return message.channel.send(essentials.craftMessage("error", `Post commands are only allowed on <#${essentials.getInfo("COMMUNICATIONCHANNEL")}>`));}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("post"));

        let charsDB = new sqlite.Database('./db/mubotdata.db');
        var character = "";

        charsDB.all(`SELECT char FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            if(rows.length < 1) return message.channel.send(essentials.getDefaultMessage("noselectedcharacter"));
            character = rows[0].char;
            sendPost();
        });

 
        function sendPost(){
            const MAXMESSAGELENGTH = parseInt(essentials.getInfo("MAXMESSAGELENGTH"));
            if(args.length > MAXMESSAGELENGTH) return message.channel.send(essentials.craftMessage("error", `Message is too long. (Max Length - ${MAXMESSAGELENGTH})`));
            var client = new net.Socket();
            client.connect(PORT, IP, function() {
                console.log(`[${character}] Sending post to the game server...`);
                client.write(`${character};!post ${args}`, 'utf8');
                client.destroy();
            });
            message.delete();
            message.channel.send("```ini\n[Discord] " + character + " » " + args + "\n```")
            client.on('close', function() {
                console.log('Connection closed');
            });
            client.on('error', function(err) {
                console.log(err);
            });
        }
    }
}

module.exports = PostCommand;
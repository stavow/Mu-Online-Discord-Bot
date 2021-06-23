const commando = require('discord.js-commando')
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');
var sqlite = require('sqlite3');
var essentials = require('../essentials');

class NoticeCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'notice',
            group: 'admin',
            memberName: 'notice',
            description: 'notice a message on the game server'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("NOTICECOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMUNICATIONCHANNEL")) {message.delete();return message.author.send(essentials.craftMessage("error", `This command is only allowed on the admins command channel:\n**${message.content.replace(args, "")}**`));}

        var mod = 0;
        var modRoles = essentials.getHighMods();
        for(var i = 0; i < modRoles.length; i++){
            if(message.member.roles.some(role => role.name === modRoles[i])){
                i = modRoles.length + 1;
                mod = 1;
            }
       }
       if(!mod)
        return message.channel.send(essentials.getDefaultMessage("noperms"));

       if(args == "usage") return message.channel.send(essentials.getUsageInfo("notice"));

       let accDB = new sqlite.Database('./db/mubotdata.db');
       var character = "ADMIN";
        accDB.all(`SELECT * FROM charsel WHERE discord_id='${message.author.id}'`, [], (err,rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            if(rows.length > 0)
            {
                character = rows[0].char;
            }
        });

        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(character) || character == "" || character == undefined || character.length > 10 || character.length < 4) return message.channel.send(essentials.craftMessage("error", `Character name must be between 4-10 characters`));

       sendNotice();
        function sendNotice(){
            if(args.length > 90) return message.channel.send(essentials.craftMessage("error", `Message is too long. (Max Length - 90)`));
            var client = new net.Socket();
            client.connect(PORT, IP, function() {
                console.log(`[${character}] Sending notice to the game server...`);
                client.write(`${character};!notice ${args}`, 'utf8');
                client.destroy();
            });
            message.delete();
            message.channel.send("```ini\n[NOTICE]" + " » " + args + "\n```")
            client.on('close', function() {
                console.log('Connection closed');
            });
            client.on('error', function(err) {
                console.log(err);
            });
        }
    }
}

module.exports = NoticeCommand;
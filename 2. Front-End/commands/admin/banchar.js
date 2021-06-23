const commando = require('discord.js-commando');
var essentials = require('../essentials');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');
const DCCommand = require('./dc');

class BanCharCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'banchar',
            group: 'admin',
            memberName: 'banchar',
            description: 'Ban a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("BANCHARCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("ADMINCOMMANDSCHANNEL")) {message.delete();return message.author.send(essentials.craftMessage("error", `This command is only allowed on the admins command channel:\n**${message.content.replace(args, "")}**`));}

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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("banchar"));

        var char = "";
        var reason = "";

        if(args.indexOf(' ') != -1){
            char = args.split(' ')[0];
            reason = args.split(' ')[1];
        }
        else {
            char = args;
            reason = "No reason.";           
        }

        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(char) || char == "" || char == undefined || char.length > 10 || char.length < 4) return message.channel.send(essentials.craftMessage("error", `Character name must be between 4-10 characters.`));

        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${char}] Sending ban character request to the game server...`);
            client.write(`${char};!banchar ${char}`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[${char}] Connection closed`);
        });
        client.on('error', function(err) {
            return console.log(err);
        });

        essentials.switchCommand(char);

        message.channel.send(essentials.craftMessage("check", `Character ${char} has been banned.`));
    }
}

module.exports = BanCharCommand;
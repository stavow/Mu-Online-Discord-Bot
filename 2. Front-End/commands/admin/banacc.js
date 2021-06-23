const commando = require('discord.js-commando');
var essentials = require('../essentials');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');
const DCAccCommand = require('./dcacc');

class BanAccCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'banacc',
            group: 'admin',
            memberName: 'banacc',
            description: 'Ban an account'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("BANACCCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("banacc"));

        var acc = "";
        var reason = "";

        if(args.indexOf(' ') != -1){
            acc = args.split(' ')[0];
            reason = args.split(' ')[1];
        }
        else {
            acc = args;
            reason = "No reason.";           
        }

        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(acc) || acc == "" || acc == undefined || acc.length > 10 || acc.length < 4) return message.channel.send(essentials.getDefaultMessage("wrongusage"));

        essentials.disconnectAccountCommand(acc);
        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${acc}] Sending ban account request to the game server...`);
            client.write(`${acc};!banacc ${acc}`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[${acc}] Connection closed`);
        });
        client.on('error', function(err) {
            return console.log(err);
        });

        message.channel.send(essentials.craftMessage("check", `Account ${acc} has been banned.`));
    }
}

module.exports = BanAccCommand;
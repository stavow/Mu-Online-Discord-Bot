const commando = require('discord.js-commando')
var essentials = require('../essentials');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');

class UnBanCharCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'unbanchar',
            group: 'admin',
            memberName: 'unbanchar',
            description: 'Unban a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("UNBANCHARCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("ADMINCOMMANDSCHANNEL")) {message.delete();return message.author.send(`This command is only allowed on the admins command channel\n**${message.content}**`);}

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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("unbanchar"));

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
        if(!cond.test(char) || char == "" || char == undefined || char.length > 10 || char.length < 4) return message.channel.send(essentials.craftMessage("error", `Character name must be between 4-10 characters`));

        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${char}] Sending unban character request to the game server...`);
            client.write(`${char};!unbanchar ${char}`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[${char}] Connection closed`);
        });
        client.on('error', function(err) {
            return console.log(err);
        });

        message.channel.send(essentials.craftMessage("check", `Character ${char} has been unbanned.`));
    }
}

module.exports = UnBanCharCommand;
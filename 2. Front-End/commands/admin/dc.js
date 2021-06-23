const commando = require('discord.js-commando');
var essentials = require('../essentials');
const IP = "127.0.0.1";
const PORT = 59000;
var net = require('net');

class DCCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'dc',
            group: 'admin',
            memberName: 'dc',
            description: 'Disconnect a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("DCCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("dc"));

        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(args) || args == "" || args == undefined || args.length > 10 || args.length < 4) return message.channel.send(essentials.craftMessage("error", `Character name must be between 4-10 characters`));

        var client = new net.Socket();
        client.connect(PORT, IP, function() {
            console.log(`[${args}] Sending character disconnect request to the game server...`);
            client.write(`${args};!disconnect ${args} x`, 'utf8');
            client.destroy();
        });
        client.on('close', function() {
            console.log(`[${args}] Connection closed`);
        });
        client.on('error', function(err) {
            return console.log(err);
        });
        message.channel.send(essentials.craftMessage("check", `Successfully disconnected ${args}`));
    }
}

module.exports = DCCommand;
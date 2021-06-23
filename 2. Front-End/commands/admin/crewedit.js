const commando = require('discord.js-commando')
const sqlite = require('sqlite3');
var essentials = require('../essentials');
const { parse } = require('ini');
const Discord = require('discord.js');

class CrewEditCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'crewedit',
            group: 'admin',
            memberName: 'crewedit',
            description: 'Edit crew'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("CREWEDITCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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
        
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("crewedit"));

        var splittedArgs = args.split(', ');
        const mode = splittedArgs[0];
        const character = splittedArgs[1];
        const account = splittedArgs[2];
        const role = splittedArgs[3];
        const priority = splittedArgs[4];

        if(isNaN(mode)) return message.channel.send(essentials.craftMessage("error", `Wrong usage, type ![command] usage to get the correct usage.`));
        if(!isNaN(role)) return message.channel.send(essentials.craftMessage("error", `Wrong usage, type ![command] usage to get the correct usage.`));
        if(isNaN(priority)) return message.channel.send(essentials.craftMessage("error", `Wrong usage, type ![command] usage to get the correct usage.`));

        let crewDB = new sqlite.Database('./db/mubotdata.db');

        if(mode == 1){
            crewDB.all(`INSERT OR IGNORE INTO crew VALUES('${character}', '${account}', '${role}', ${priority})`, [], (err, rows) => {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            });
            return message.channel.send(essentials.craftMessage("check", `${character} has been added to the crew list.`));
        }
        else if (mode == 0){
            crewDB.all(`DELETE FROM crew WHERE character='${character}'`, [], (err, rows) => {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            });
            return message.channel.send(essentials.craftMessage("check", `${character} has been removed from the crew list.`));
        }
    }   

}

module.exports = CrewEditCommand;
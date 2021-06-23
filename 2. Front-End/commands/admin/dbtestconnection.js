const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class DBTestConnectionCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'dbtestconn',
            group: 'admin',
            memberName: 'dbtestconn',
            description: 'Tests the connection to the DB'
        });
    }

    async run(message, args)
    {
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



        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);

        conn.connect(function(err) {
            if(err) {conn.close();console.log(err); return message.channel.send(essentials.craftMessage("error", "Connection wasn't successful."));}
            message.channel.send(essentials.craftMessage("check", `Connection Successful.`));
            conn.close();
            return;
        });     
    }
}

module.exports = DBTestConnectionCommand;
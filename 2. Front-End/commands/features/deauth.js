const commando = require('discord.js-commando');
var sqlite = require('sqlite3');
const essentials = require('../essentials');

class DeAuthCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'deauth',
            group: 'features',
            memberName: 'deauth',
            description: 'Deauthenticate a user'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("DEAUTHCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("deauth"));

        //Variabels Declaration
        let accDB = new sqlite.Database('./db/mubotdata.db');

        accDB.all(`SELECT * FROM accauth WHERE discord_id='${message.author.id}'`, [], (err,rows) => {
            if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
            if(rows.length > 0) {
                accDB.all(`DELETE FROM accauth WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                    if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
                    accDB.all(`DELETE FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
                        if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        return message.channel.send(essentials.craftMessage("check", `Successfully Deauthenticated.`));
                    });
                });
            }
            else return message.channel.send(essentials.craftMessage("error", "You haven't authenticated an account yet."));
        });
    }
}

module.exports = DeAuthCommand;
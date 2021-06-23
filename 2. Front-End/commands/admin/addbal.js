const commando = require('discord.js-commando');
const sqlite = require('sqlite3');
var essentials = require('../essentials');
const { parse } = require('ini');
const Discord = require('discord.js');

class AddBalanceCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'addbal',
            group: 'admin',
            memberName: 'addbal',
            description: 'Adds to user balance'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("ADDBALANCECOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

       if(args == "usage") return message.channel.send(essentials.getUsageInfo("addbal"));
 
        let currDB = new sqlite.Database('./db/mubotdata.db');
        let user = message.mentions.users.first();
        if(user === undefined) return message.channel.send(essentials.craftMessage("error", `You have to mention the user that you want to set the balance to.`));
        if(isNaN(parseInt(args.split(' ')[1]))) return message.channel.send(essentials.craftMessage("error", `Balance given isn't a number`));

        let q = `SELECT * FROM currency WHERE id='${user.id}'`;
        currDB.all(q, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            let secondQuery = ``;
            if(rows.length < 1){
                secondQuery = `INSERT INTO currency VALUES('${user.id}', ${parseInt(args.split(' ')[1])})`
                currDB.all(secondQuery, [], (err, rows)=>{
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });
            }
            else{
                secondQuery = `UPDATE currency SET amount=amount + ${parseInt(args.split(' ')[1])} WHERE id='${user.id}'`;
                currDB.all(secondQuery, [], (err, rows)=>{
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });
            }         
            return message.channel.send(essentials.craftMessage("check", `Added ${args.split(' ')[1]} to the balance of <@${user.id}>`)); 
        });
    }   

}

module.exports = AddBalanceCommand;
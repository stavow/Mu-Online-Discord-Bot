const commando = require('discord.js-commando')
const sqlite = require('sqlite3');
var essentials = require('../essentials');

class BalanceCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'balance',
            aliases: ['bal'],
            group: 'features',
            memberName: 'balance',
            description: 'Shows the user balance'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("BALANCECOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("balance"));

        let currDB = new sqlite.Database('./db/mubotdata.db');

        let q = `SELECT * FROM currency WHERE id='${message.author.id}'`;
        currDB.all(q, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            
            if(rows.length < 1){
                let secondQuery = `INSERT INTO currency VALUES('${message.author.id}', 0)`
                currDB.all(secondQuery, [], (err, rows)=>{
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });
                return message.channel.send(essentials.craftMessage("info", `<@${message.author.id}> Your balance is: 0 ${essentials.getCurrency()}`));
            }
            else{
                return message.channel.send(essentials.craftMessage("info", `<@${message.author.id}> Your balance is: ${rows[0].amount} ${essentials.getCurrency()}`));
            }          
        });
    }   

}

module.exports = BalanceCommand;
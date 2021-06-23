const commando = require('discord.js-commando')
const sqlite = require('sqlite3');
var essentials = require('../essentials');

class PayCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'pay',
            group: 'features',
            memberName: 'pay',
            description: 'Pay another user'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("PAYCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("pay"));

        let currDB = new sqlite.Database('./db/mubotdata.db');
        let user = message.mentions.users.first();
        let amount = parseInt(args.split(' ')[1]);
        if(user === undefined) return message.channel.send(essentials.craftMessage("error", `You have to mention the user that you want to pay to.`));
        if(user.id === message.author.id) return message.channel.send(essentials.craftMessage(error, `You can't pay to yourself`));
        if(isNaN(amount) || amount <= 0) return message.channel.send(essentials.craftMessage("error", `Balance given isn't a number or less / equal or less than 0.`));

        let getAuthorInfo = `SELECT * FROM currency WHERE id='${message.author.id}'`;
        currDB.all(getAuthorInfo, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            let authorQuery = ``;
            if(rows.length < 1){
                authorQuery = `INSERT INTO currency VALUES('${message.author.id}', 0)`
                currDB.all(authorQuery, [], (err, rows)=>{
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    return message.channel.send(essentials.craftMessage("error", `You don't have enough ${essentials.getCurrency()}.`));
                });
            }
            else if (rows[0].amount < amount){
                return message.channel.send(essentials.craftMessage("error", `You don't have enough ${essentials.getCurrency()}.`));
            }
            else{
                authorQuery = `UPDATE currency SET amount=amount-${amount} WHERE id='${message.author.id}'`;
                currDB.all(authorQuery, [], (err, rows)=>{
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                    let getUserInfo = `SELECT * FROM currency WHERE id='${user.id}'`;
                    currDB.all(getUserInfo, [], (err, rows) => {
                        if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        let userQuery = ``;
                        if(rows.length < 1){
                            userQuery = `INSERT INTO currency VALUES('${user.id}', ${amount})`
                            currDB.all(userQuery, [], (err, rows)=>{
                                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                            });
                        }
                        else{
                            userQuery = `UPDATE currency SET amount=amount+${amount} WHERE id='${user.id}'`;
                            currDB.all(userQuery, [], (err, rows)=>{
                                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                            });
                        }
                        
                    });

                });
            }         
            return message.channel.send(essentials.craftMessage("check", `Paid ${amount} ${essentials.getCurrency()} to <@${user.id}>`)); 
        });
    }   

}

module.exports = PayCommand;
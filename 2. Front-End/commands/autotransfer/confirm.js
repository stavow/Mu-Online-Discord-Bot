const commando = require('discord.js-commando');
const Discord = require('discord.js');
var sql = require('mssql');
var fs = require('fs');
var ini = require('ini');
var essentials = require('../essentials');
var sqlite = require('sqlite3');

class ConfirmCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'confirm',
            group: 'autotransfer',
            memberName: 'confirm',
            description: 'Completes a transfer'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("CONFIRMCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("confirm"));
        if(!message.channel.name.includes("autotransfer-")) return message.delete();

        var config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
        const filter = m => m.content.includes('!accept confirm');
        const collector = message.channel.createMessageCollector(filter, {time: 30000});
        const caseFile = JSON.parse(fs.readFileSync(`autotransfer-cases\\${message.channel.name.replace('autotransfer-', '')}.json`))
        var pass = caseFile.pass;
        var email = caseFile.email;
        var acc = caseFile.account;
        var receiver_id = caseFile.receiver_id;
        let AccDB = new sqlite.Database('./db/mubotdata.db');
        const caseNum = message.channel.name.replace('autotransfer-', '');
        var active = 0;
        const DiscordBot = this.client;

        AccDB.all(`SELECT * FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            if(rows.length > 0) {
                active = 1;
                const caseStatus = parseInt(rows[0].mode);
                switch(caseStatus){
                    case 1:
                        return message.channel.send(essentials.craftMessage("error", `Can't perform this request, There's already an active cancelation request.`));
                    case 2:
                        return message.channel.send(essentials.craftMessage("error", `Can't perform this request, There's already an active approval request.`));
                }
            }
        });

        setTimeout(confirm, 500);

        function confirm(){
            if(active) return;

            AccDB.all(`INSERT INTO active_cases VALUES(${parseInt(caseNum)}, ${2})`, [], function(err, rows) {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            });
    
            //Fetching users
            var receiver = DiscordBot.users.get(caseFile.giver_id);
            var giver = DiscordBot.users.get(receiver_id);
    
            message.channel.send(`**[Confirm Request]** If the partner want to complete the transfer, type !accept confirm within 30 seconds.\nPlease read <#${config.Discord.AutoTransferInstructionsChannel}> before canceling to avoid scams.\n**WARNING** - If you are the Giver of the account, don't accept if you haven't got the items!`);
            collector.on('collect', m=>{
                if(m.author.id != message.author.id){
                    if(m.content == "!accept confirm"){
                        message.channel.send('**[Confirm Request]** Auto Transfer is Complete, channel will be deleted in 10 seconds.\nThe new generated account details will be sent to the Receiver.');
                        const result = new Discord.RichEmbed()
                        .setTitle(`Auto Transfer Account Details - Case Num.${message.channel.name.replace('autotransfer-', '')}`)
                        .addField("Account", acc)
                        .addField("Password", `||${pass}||`)
                        .addField("Email", `||${email}||`);
    
                        AccDB.all(`DELETE FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        });
                        
                        AccDB.all(`UPDATE accauth SET discord_id='${receiver_id}' WHERE member_id='${acc}'`, [], (err, rows) => {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        });
    
                        var recieverUserObject = message.guild.members.find(m => m.id === receiver_id);
    
                        recieverUserObject.send(result);
                        setTimeout(deleteChannel, 10000);
                    }
                }
            });
    
            collector.on('end', collected=>{
                if(collected.size == 0){
                    message.channel.send("**[Confirm Request]** Accept request didn't got accepted [30s passed]");
                    AccDB.all(`DELETE FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
                        if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    });
                    return;
                }
            });
    
            function deleteChannel(){
                message.channel.overwritePermissions(giver, {
                    SEND_MESSAGES: false,
                    READ_MESSAGES: false
                });
    
                message.channel.overwritePermissions(receiver, {
                    SEND_MESSAGES: false,
                    READ_MESSAGES: false
                });
                AccDB.all(`DELETE FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });

                AccDB.all(`DELETE FROM accauth WHERE member_id='${acc}'`, [], function(err, rows) {
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });
                return;
            }
        }
    }
}

module.exports = ConfirmCommand;
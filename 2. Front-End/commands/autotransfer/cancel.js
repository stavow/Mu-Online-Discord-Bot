const commando = require('discord.js-commando');
var fs = require('fs');
const Discord = require('discord.js');
var ini = require('ini');
var essentials = require('../essentials');
var sqlite = require('sqlite3');

class CancelCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'cancel',
            group: 'autotransfer',
            memberName: 'cancel',
            description: 'Cancel a transfer'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("CANCELCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("cancel"));

        if(!message.channel.name.includes("autotransfer-")) return message.delete();

        var config = ini.parse(fs.readFileSync('config.ini', 'utf-8'));
        const caseNum = message.channel.name.replace('autotransfer-', '');
        const caseFile = JSON.parse(fs.readFileSync(`autotransfer-cases\\${caseNum}.json`));
        var pass = caseFile.pass;
        var email = caseFile.email;
        var acc = caseFile.account;
        var cancelationId = caseFile.cancel_id;
        const filter = m => m.content.includes('!accept cancel') && m.author.id != message.author.id && !m.author.bot && m.channel.id == message.channel.id;
        const collector = message.channel.createMessageCollector(filter, {time: 30000});
        let casesDB = new sqlite.Database('./db/mubotdata.db');
        var active = 0;
        const DiscordBot = this.client;

        casesDB.all(`SELECT * FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
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

        setTimeout(cancel, 500);

        function cancel(){
            if(active) return;
            casesDB.all(`INSERT INTO active_cases VALUES(${parseInt(caseNum)}, ${1})`, [], function(err, rows) {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            });
    
            //Fetching users
            var receiver = DiscordBot.users.get(caseFile.receiver_id);
            var giver = DiscordBot.users.get(caseFile.giver_id);
    
            //Try - to fetch Mod Roles
            var modRoles;
            modRoles = essentials.getMods();
            message.channel.send(`**[Cancel Request]** If the partner want to cancel, type !accept cancel within 30 seconds.\nPlease read <#${config.Discord.AutoTransferInstructionsChannel}> before canceling to avoid scams.`);
            
            collector.on('collect', m=>{
                message.channel.send('**[Cancel Request]** Waiting 1 minute for a mod to finish the cancel request.');
                setTimeout(waitForMod, 1000);
            });
    
            collector.on('end', collected=>{
                if(collected.size == 0){
                    message.channel.send("**[Cancel Request]** Cancel request didn't got accepted [30s passed]");
                    casesDB.all(`DELETE FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
                        if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    });
                    return;
                }
            });

            function waitForMod(){
                const modFilter = m => m.content.includes(`!finish cancel ${cancelationId}`) & m.channel.id == message.channel.id;
                const modMessageCollector = message.channel.createMessageCollector(modFilter, {time: 60000});
    
                modMessageCollector.on('collect', m=>{
                   for(var i = 0; i < modRoles.length; i++){
                        if(m.member.roles.some(role => role.name === modRoles[i])){
                            i = modRoles.length + 1;
                            message.channel.send(`**[Cancel Request]** Auto Transfer is canceled, channel will be deleted in 10 seconds.`);
                            setTimeout(deleteChannel, 10000);
                        }
                   }
                });
    
                modMessageCollector.on('end', collected=>{
                    if(collected.size == 0){
                        message.channel.send("**[Cancel Request]** Sorry but no moderator answered in time, please try again later.");
                        casesDB.all(`DELETE FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
                            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        });
                        return;
                    }
                });
            }
    
            function deleteChannel(){
                message.channel.overwritePermissions(giver, {
                    SEND_MESSAGES: false,
                    READ_MESSAGES: false
                });
    
                message.channel.overwritePermissions(receiver, {
                    SEND_MESSAGES: false,
                    READ_MESSAGES: false
                });
    
                casesDB.all(`DELETE FROM active_cases WHERE case_id=${parseInt(caseNum)}`, [], function(err, rows) {
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });

                casesDB.all(`DELETE FROM accauth WHERE member_id='${acc}'`, [], function(err, rows) {
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                });

                const result = new Discord.RichEmbed()
                .setTitle(`Auto Transfer Account Details - Case Num.${message.channel.name.replace('autotransfer-', '')}`)
                .addField("Account", acc)
                .addField("Password", `||${pass}||`)
                .addField("Email", `||${email}||`);
                
                giver.send(result);
                return;
            }
        }
    }
}

module.exports = CancelCommand;
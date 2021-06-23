const commando = require('discord.js-commando');
const Discord = require('discord.js');
var essentials = require('../essentials');
const { getMathEvent } = require('../essentials');
const sqlite = require('sqlite3');

class ForceMathEventCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'math',
            group: 'events',
            memberName: 'math',
            description: 'Force Math Event'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("FORCEMATHEVENTCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));

        var mod = 0;
        var modRoles = essentials.getHighMods();
        for(var i = 0; i < modRoles.length; i++){
            if(message.member.roles.some(role => role.name === modRoles[i])){
                i = modRoles.length + 1;
                mod = 1;
            }
       }
       if(!mod)
        return message.channel.send(essentials.getDefaultMessage("noperms"))

        //Vars Declaration
        var mathEvent = getMathEvent();
        var currName = essentials.getCurrency();
        let filter = m => !m.author.bot;
        const collector = message.channel.createMessageCollector(filter, {time: 30000});
        var winner = 0;

       var question = new Discord.RichEmbed()
       .setAuthor(this.client.user.username, this.client.user.avatarURL)
       .setColor('D109CB')
       .setTitle("[Math Event]")
       .addField(`**Exercise: ${mathEvent[0]}**`,`First to answer within 30s will get **${mathEvent[2]}** ${currName}.`);
        message.channel.send(question);

        //SQL DEF
        let currDB = new sqlite.Database('./db/mubotdata.db');

        collector.on('collect', m=>{
            if(m.content == mathEvent[1] && winner == 0){
                winner = 1;
                let firstQuery = `SELECT * FROM currency WHERE id='${m.author.id}'`;
                currDB.all(firstQuery, [], (err, rows) => {
                    if (err) return console.log(err);
                                        
                    let secondQuery = `UPDATE currency SET amount=amount+${parseInt(mathEvent[2])} WHERE id='${m.author.id}'`;

                    if(rows.length < 1){
                        secondQuery = `INSERT INTO currency VALUES('${m.author.id}', ${parseInt(mathEvent[2])})`
                    }
                    
                    currDB.all(secondQuery, [], (err, rows) => {
                        if (err) return console.log(err);
                    });
                });

                
                var ended = new Discord.RichEmbed()
                .setAuthor(this.client.user.username, this.client.user.avatarURL)
                .setColor('D109CB')
                .setTitle("[Math Event Ended]")
                .setDescription(`**Winner: <@${m.author.id}>**`);
                message.channel.send(ended);
            }


        });

        collector.on('end', collected=>{
            if(collected.size == 0){
                var ended = new Discord.RichEmbed()
                .setAuthor(this.client.user.username, this.client.user.avatarURL)
                .setColor('D109CB')
                .setTitle("[Math Event Ended]")
                .setDescription(`**Winner wasn't found. [30s passed]**`);
                message.channel.send(ended);
            }
        });
    }
}

module.exports = ForceMathEventCommand;
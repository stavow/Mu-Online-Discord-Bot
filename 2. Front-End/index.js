const Commando = require('discord.js-commando');
const Discord = require("discord.js");
const sqlite = require('sqlite3');
var essentials = require('./commands/essentials.js');
const fs = require('fs');

const bot = new Commando.Client({
    commandPrefix: essentials.getInfo("PREFIX"),
    unknownCommandResponse: false,
    owner: '260132199129415680'
});
const TOKEN = "NjE2MjU3MjI4MzQwNzIzNzEy.XWZ8dA.dq-h_2Nd7yUk8ybItLLCMb6ILXM";

bot.registry
    .registerGroup('features', 'Features')
    .registerGroup('admin', 'Admin Commands')
    .registerGroup('music', 'Music Commands')
    .registerGroup('autotransfer', 'Auto Transfer Commands')
    .registerGroup('events', 'Event Commands')
    .registerCommandsIn(__dirname + '/commands');

global.dbConfig = {
    server: essentials.getInfo("SQLSERVER"),
    database: essentials.getInfo("SQLDATABASE"),
    user: essentials.getInfo("SQLUSER"),
    password: essentials.getInfo("SQLPASS"),
    port: parseInt(essentials.getInfo("SQLPORT"))
};

bot.once('ready', function(){
    console.log("Ready");
    bot.user.setActivity("!help");

    const eventsChannel = bot.channels.get(essentials.getEventsChannel());
    if(eventsChannel != undefined){
        setInterval (function() {
            autoMathEvent(eventsChannel)
        }, 3600000);
    }
})

bot.on('error', console.error);

bot.on('message', message =>{
    if(message.author.bot) return;

    try{
        //xp system
        let xpDB = new sqlite.Database('./db/mubotdata.db');
        let query = `SELECT * FROM xp WHERE id='${message.author.id}'`;
        let resultQuery = ``;
        const levelUpChannel = bot.channels.get(essentials.getInfo("LEVELUPCHANNEL"));
        if(levelUpChannel == undefined) return;
        
        xpDB.all(query, [], (err, rows) => {
            if(err) {console.log(err);}
            if(rows.length < 1){
                resultQuery = `INSERT INTO xp VALUES('${message.author.id}', ${essentials.generateXP()}, 0, ${Date.now()})`; 
            }
            else if(Date.now() - rows[0].last_message > 60000){
                let nextLvl = 5*Math.pow(rows[0].level,2)+50*rows[0].level+100;
                let nextSecondLvl = 5*Math.pow(rows[0].level + 1,2)+50*(1+rows[0].level)+100;
                if(nextLvl <= rows[0].xp){
                    const lvlup = new Discord.RichEmbed()
                        .setTitle("Level Up!")
                        .setColor('#57f542')
                        .setAuthor(message.author.username, message.author.avatarURL)
                        .setDescription(`${message.author.username} Just leveled up to level ${rows[0].level + 1}\nCongratulations!`)
                        .setFooter(`XP until next level: ${nextSecondLvl}`);
                        levelUpChannel.send(lvlup);
                    resultQuery = `UPDATE xp SET xp=${rows[0].xp + essentials.generateXP()}, level=${rows[0].level + 1}, last_message=${Date.now()} WHERE id='${message.author.id}'`;
                }
                else{
                    resultQuery = `UPDATE xp SET xp=${rows[0].xp + essentials.generateXP()}, last_message=${Date.now()} WHERE id='${message.author.id}'`;
                }
                xpDB.all(resultQuery, [], (err, rows2) =>{
                    if(err) {console.log(err); return levelUpChannel.send(essentials.getDefaultMessage("error"));}
                });
            }


        });
        xpDB.close();
        //end of xp system
    }
    catch(err)
    {
        console.log(err);
    }  
});

function autoMathEvent(channel){
    try{
        var mathEvent = essentials.getMathEvent();
        var currName = essentials.getCurrency();
        let filter = m => !m.author.bot;
        const collector = channel.createMessageCollector(filter, {time: 30000});
        var winner = 0;
    
       var question = new Discord.RichEmbed()
       .setAuthor(bot.user.username, bot.user.avatarURL)
       .setColor('D109CB')
       .setTitle("[Math Event]")
       .addField(`**Exercise: ${mathEvent[0]}**`,`First to answer within 30s will get **${mathEvent[2]}** ${currName}.`);
        channel.send(question);
    
        //SQL DEF
        let currDB = new sqlite.Database('./db/mubotdata.db');
    
        collector.on('collect', m=>{
            if(m.content == mathEvent[1] && winner == 0){
                winner = 1;
                let firstQuery = `SELECT * FROM currency WHERE id='${m.author.id}'`;
                currDB.all(firstQuery, [], (err, rows) => {
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    
                    let secondQuery = `UPDATE currency SET amount=amount+${parseInt(mathEvent[2])} WHERE id='${m.author.id}'`;
    
                    if(rows.length < 1){
                        secondQuery = `INSERT INTO currency VALUES('${m.author.id}', ${parseInt(mathEvent[2])})`
                    }
                    
                    currDB.all(secondQuery, [], (err, rows) => {
                        if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    });
                });
    
                
                var ended = new Discord.RichEmbed()
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setColor('D109CB')
                .setTitle("[Math Event Ended]")
                .setDescription(`**Winner: <@${m.author.id}>**`);
                channel.send(ended);
            }
    
    
        });
    
        collector.on('end', collected=>{
            if(collected.size == 0){
                var ended = new Discord.RichEmbed()
                .setAuthor(bot.user.username, bot.user.avatarURL)
                .setColor('D109CB')
                .setTitle("[Math Event Ended]")
                .setDescription(`**Winner wasn't found. [30s passed]**`);
                channel.send(ended);
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
    
}

bot.login(TOKEN);
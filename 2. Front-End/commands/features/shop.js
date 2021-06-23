const commando = require('discord.js-commando');
const Discord = require('discord.js');
var essentials = require('../essentials');
const sqlite = require('sqlite3');

class ShopCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'shop',
            group: 'features',
            memberName: 'shop',
            description: 'Shop'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SHOPCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("shop"));

        let categories = essentials.getCategories();
        var cateEmbed = "1. **" + categories[0] + `**`;
        for(var i = 1; i <= categories.length - 1; i++){
            cateEmbed += `\n${i + 1}. **` + categories[i] + `**`;
        }

        let itemsDB = new sqlite.Database('./db/mubotdata.db');

        if(args == ""){
            const serverLogo = new Discord.Attachment(essentials.getInfo("ServerLogo"), `logo.png`);
            let shopEmbed = new Discord.RichEmbed()
                .attachFile(serverLogo)
                .setAuthor(`${essentials.getInfo("ServerName")}'s Shop`, `attachment://logo.png`)
                .setColor("#0ac7db")
                .setThumbnail(`attachment://logo.png`)
                .setDescription(cateEmbed)
                .setTimestamp()
                .setFooter(`!shop [Num] to proceed`);
            message.channel.send(shopEmbed);
        }
        else if (parseInt(args) >= 1 && parseInt(args) <= categories.length){
            let query = `SELECT * FROM items WHERE category=${parseInt(args)} ORDER BY price ASC`;
            itemsDB.all(query, [], (err, rows) => {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                if(rows.length < 1) return message.channel.send(essentials.craftMessage("error", "This shop category don't have any items"));
                let pagesNum = parseInt(parseInt(rows.length) / 5);
                var itemsCounter = 0;
                var j = 0;
                var stopVar = 0;
                var itemShopPages = [];
                
               const serverImg = new Discord.Attachment(essentials.getInfo("ServerLogo"), "serverlogo.png");
                for(var i = 0; i <= pagesNum; i++){
                    stopVar = j + 5;
                    itemShopPages[i] = new Discord.RichEmbed();
                    itemShopPages[i].attachFile(serverImg);
                    itemShopPages[i].setThumbnail(`attachment://serverlogo.png`);
                    itemShopPages[i].setAuthor(`${essentials.getInfo("ServerName")}`, `attachment://serverlogo.png`);
                    itemShopPages[i].setTitle(`${categories[args - 1]} Shop`);
                    itemShopPages[i].setColor("#0ac7db");
                    itemShopPages[i].setFooter(`Page ${i + 1} of ${pagesNum + 1}`);
                    itemShopPages[i].setTimestamp();
                    for(j = j; j < stopVar && j < rows.length; j++){
                        itemsCounter++;
                        itemShopPages[i].addField(`${itemsCounter}. ${rows[j].name}`, `‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎ ‎‏‏‎‎‎Price: ${rows[j].price} | Item ID: ${rows[j].id} | Item Level: ${rows[j].item_level}`);
                        if((j + 1) < 5 && (j + 1) < rows.length){
                        }
                    }
                }
                let pageNum = 0;

                message.channel.send(itemShopPages[0]).then(msg =>{
                    msg.react('◀️').then(r => {
                        msg.react('▶️');
                        
                        const backwardsFilter = (reaction, user) => reaction.emoji.name === '◀️' && user.id === message.author.id;
                        const forwardsFilter = (reaction, user) => reaction.emoji.name === '▶️' && user.id === message.author.id;

                        const backwards = msg.createReactionCollector(backwardsFilter, {time: 60000});
                        const forwards = msg.createReactionCollector(forwardsFilter, {time: 60000});

                        forwards.on('collect', r => {
                            msg.reactions.array()[1].remove(message.author.id);
                            if(pageNum == pagesNum) return;
                            pageNum++;
                            itemShopPages[pageNum].setTimestamp();
                            msg.edit(itemShopPages[pageNum]);
                        });

                        backwards.on('collect', r => {
                            msg.reactions.first().remove(message.author.id);
                            if(pageNum == 0) return;
                            pageNum--;
                            itemShopPages[pageNum].setTimestamp();
                            msg.edit(itemShopPages[pageNum]);
                        });

                        backwards.on('end', collected =>{
                            msg.delete();
                        });
                    })
                });
            });

            
        }
    }

}

module.exports = ShopCommand;
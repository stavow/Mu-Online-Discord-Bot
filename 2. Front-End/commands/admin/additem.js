const commando = require('discord.js-commando')
var essentials = require('../essentials');
const Discord = require('discord.js');
const sqlite = require('sqlite3');

class AddItemCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'additem',
            group: 'admin',
            memberName: 'additem',
            description: 'Adds an item to the shop'
        });
    }

    async run(message, args)
    {
        var mod = 0;
        var modRoles = essentials.getHighMods();
        for(var i = 0; i < modRoles.length; i++){
            if(message.member.roles.some(role => role.name === modRoles[i])){
                i = modRoles.length + 1;
                mod = 1;
            }
       }
       if(!mod)
        return message.channel.send(":no_entry: Insufficient permissions.");

       if(args == "usage") return message.channel.send(essentials.getUsageInfo("additem"));

        let itemsDB = new sqlite.Database('./db/mubotdata.db');
        let image = ``;
        var parsedMsg = args.split(", ");
        let filter = m => !m.author.bot;
        const collector = message.channel.createMessageCollector(filter, {time: 60000});

        if(parsedMsg.length < 16){
            return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        }
        else if(parsedMsg.length == 17){
            image = './items/' + parsedMsg[16];
        }
        let query = ``;

        message.channel.send("**Item Preview:**");

        const attachment = new Discord.Attachment(image, 'item.jpg');

        if(parsedMsg.length == 17){
            query = `INSERT INTO items(category, name, price, item_group, item_index, item_level, skill, luck, option, exc, ancient, periodtime, socketslot, socketbonus, muunevoitemcat, muunevoitemindex, image) VALUES(${parsedMsg[0]}, '${parsedMsg[1]}', ${parsedMsg[2]}, ${parsedMsg[15]}, ${parsedMsg[14]}, ${parsedMsg[13]}, ${parsedMsg[12]}, ${parsedMsg[11]}, ${parsedMsg[10]}, ${parsedMsg[9]}, ${parsedMsg[8]}, ${parsedMsg[7]}, ${parsedMsg[6]}, ${parsedMsg[5]}, ${parsedMsg[4]}, ${parsedMsg[3]}, '${image}')`;
            let itemPreviewWithImage = new Discord.RichEmbed()
            .attachFile(attachment)
            .setTitle(parsedMsg[1])
            .setColor("#0ac7db")
            .setDescription(
                `
                **Category:** ${parsedMsg[0]}
                **Price:** ${parsedMsg[2]}
                **Item Group:** ${parsedMsg[15]}
                **Item Index:** ${parsedMsg[14]}
                **Item Level:** ${parsedMsg[13]}
                **Skill:** ${parsedMsg[12]}
                **Luck:** ${parsedMsg[11]}
                **Option:** ${parsedMsg[10]}
                **Exc:** ${parsedMsg[9]}
                **Ancient:** ${parsedMsg[8]}
                **Period Time:** ${parsedMsg[7]}s
                **Socket Slot:** ${parsedMsg[6]}
                **Socket Bonus:** ${parsedMsg[5]}
                **MuunEvolutionItemCat:** ${parsedMsg[4]}
                **MuunEvolutionItemIndex:** ${parsedMsg[3]}
                `
            )
            .setThumbnail('attachment://item.jpg');
            message.channel.send(itemPreviewWithImage);
        }
        else if(parsedMsg.length == 16){
            query = `INSERT INTO items(category, name, price, item_group, item_index, item_level, skill, luck, option, exc, ancient, periodtime, socketslot, socketbonus, muunevoitemcat, muunevoitemindex, image) VALUES(${parsedMsg[0]}, '${parsedMsg[1]}', ${parsedMsg[2]}, ${parsedMsg[15]}, ${parsedMsg[14]}, ${parsedMsg[13]}, ${parsedMsg[12]}, ${parsedMsg[11]}, ${parsedMsg[10]}, ${parsedMsg[9]}, ${parsedMsg[8]}, ${parsedMsg[7]}, ${parsedMsg[6]}, ${parsedMsg[5]}, ${parsedMsg[4]}, ${parsedMsg[3]}, '')`;
            let itemPreviewNoImage = new Discord.RichEmbed()
            .setTitle(parsedMsg[1])
            .setColor("#0ac7db")
            .setDescription(
                `
                **Category:** ${parsedMsg[0]}
                **Price:** ${parsedMsg[2]}
                **Item Group:** ${parsedMsg[15]}
                **Item Index:** ${parsedMsg[14]}
                **Item Level:** ${parsedMsg[13]}
                **Skill:** ${parsedMsg[12]}
                **Luck:** ${parsedMsg[11]}
                **Option:** ${parsedMsg[10]}
                **Exc:** ${parsedMsg[9]}
                **Ancient:** ${parsedMsg[8]}
                **Period Time:** ${parsedMsg[7]}s
                **Socket Slot:** ${parsedMsg[6]}
                **Socket Bonus:** ${parsedMsg[5]}
                **MuunEvolutionItemCat:** ${parsedMsg[4]}
                **MuunEvolutionItemIndex:** ${parsedMsg[3]}
                `
            )
            message.channel.send(itemPreviewNoImage);
        }

        setTimeout(function(){
            message.channel.send(":warning: Are you sure you want to add this item?\nType **!yes** for confirmation.");
        }, 1000);
        
        var alreadyAdded = 0;

        collector.on('collect', m=>{
            if(m.content == '!yes' && m.author.id == message.author.id && alreadyAdded == 0){
                alreadyAdded = 1;
                itemsDB.all(query, [], (err, rows)=>{
                    if(err) console.log(err);
                });
                return message.channel.send(`:white_check_mark: Item inserted successfully.`);
            }
        });

        collector.on('end', collected=>{
            if(collected.size == 0){
                return message.channel.send(`<@${message.author.id}> You didn't answer in 60s`);
            }
        });
    }
}

module.exports = AddItemCommand;
const commando = require('discord.js-commando')
var essentials = require('../essentials');
const Discord = require('discord.js');
const sqlite = require('sqlite3');

class ItemInfoCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'iteminfo',
            group: 'features',
            memberName: 'iteminfo',
            description: 'Gives information about an item'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("ITEMINFOCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("iteminfo"));

        let itemsDB = new sqlite.Database('./db/mubotdata.db');
        let categories = essentials.getCategories();
        
        if(isNaN(parseInt(args))) return message.channel.send(essentials.getDefaultMessage("wrongusage"));

        let query = `SELECT * FROM items WHERE id=${parseInt(args)}`
        itemsDB.all(query, [], (err, rows) =>{
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            
            if(rows.length < 1){
                return message.channel.send(essentials.craftMessage("error", `No item with given id was found.`));
            }

            if(rows[0].image != ''){
                const attachment = new Discord.Attachment(rows[0].image, 'item.jpg');
                let itemPreviewWithImage = new Discord.RichEmbed()
                .attachFile(attachment)
                .setTitle(rows[0].name)
                .setColor("#0ac7db")
                .setDescription(
                    `
                    **Item ID:** ${rows[0].id}
                    **Category:** ${categories[rows[0].category - 1]}
                    **Price:** ${rows[0].price}
                    **Item Group:** ${rows[0].item_group}
                    **Item Index:** ${rows[0].item_index}
                    **Item Level:** ${rows[0].item_level}
                    **Skill:** ${rows[0].skill}
                    **Luck:** ${rows[0].luck}
                    **Option:** ${rows[0].option * 4}
                    **Exc:** ${rows[0].exc}
                    **Ancient:** ${rows[0].ancient}
                    **Period Time:** ${rows[0].periodtime}s
                    **Socket Slot:** ${rows[0].socketslot}
                    **Socket Bonus:** ${rows[0].socketbonus}
                    **MuunEvolutionItemCat:** ${rows[0].muunevoitemcat}
                    **MuunEvolutionItemIndex:** ${rows[0].muunevoitemindex}
                    `
                )
                .setThumbnail('attachment://item.jpg');
                message.channel.send(itemPreviewWithImage);
            }
            else{
                let itemPreviewNoImage = new Discord.RichEmbed()
                .setTitle(rows[0].name)
                .setColor("#0ac7db")
                .setDescription(
                    `
                    **Item ID:** ${rows[0].id}
                    **Category:** ${categories[rows[0].category - 1]}
                    **Price:** ${rows[0].price}
                    **Item Group:** ${rows[0].item_group}
                    **Item Index:** ${rows[0].item_index}
                    **Item Level:** ${rows[0].item_level}
                    **Skill:** ${rows[0].skill}
                    **Luck:** ${rows[0].luck}
                    **Option:** ${rows[0].option * 4}
                    **Exc:** ${rows[0].exc}
                    **Ancient:** ${rows[0].ancient}
                    **Period Time:** ${rows[0].periodtime}s
                    **Socket Slot:** ${rows[0].socketslot}
                    **Socket Bonus:** ${rows[0].socketbonus}
                    **MuunEvolutionItemCat:** ${rows[0].muunevoitemcat}
                    **MuunEvolutionItemIndex:** ${rows[0].muunevoitemindex}
                    `
                )
                message.channel.send(itemPreviewNoImage);
            }
        });
    }
}

module.exports = ItemInfoCommand;
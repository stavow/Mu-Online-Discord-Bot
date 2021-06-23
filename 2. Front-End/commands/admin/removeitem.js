const commando = require('discord.js-commando')
var essentials = require('../essentials');
const Discord = require('discord.js');
const sqlite = require('sqlite3');

class RemoveItemCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'removeitem',
            group: 'admin',
            memberName: 'removeitem',
            description: 'Remove an existing item'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("REMOVEITEMCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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
        
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("removeitem"));

        let itemsDB = new sqlite.Database('./db/mubotdata.db');
        let filter = m => !m.author.bot;
        const collector = message.channel.createMessageCollector(filter, {time: 60000});

        if(isNaN(parseInt(args))) return message.channel.send(essentials.craftMessage("error", `ID Isn't a number`));

        let query = `SELECT * FROM items WHERE id=${parseInt(args)}`;
        itemsDB.all(query, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

            if(rows.length < 1) return message.channel.send(essentials.craftMessage("error", `Item ID Number ${args} Doesn't exist.`));
            
            if(rows[0].image != ''){
                const attachment = new Discord.Attachment(rows[0].image, 'item.jpg');
                let itemPreviewWithImage = new Discord.RichEmbed()
                .attachFile(attachment)
                .setTitle(rows[0].name)
                .setColor("#0ac7db")
                .setDescription(
                    `
                    **Item ID:** ${rows[0].id}
                    **Category:** ${rows[0].category}
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
                    **Category:** ${rows[0].category}
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

            setTimeout(function(){
                message.channel.send(essentials.craftMessage("warning", "Are you sure you want to remove this item?\nType **!yes** for confirmation."));
            }, 1000);

            query = `DELETE FROM items WHERE id=${parseInt(args)}`;
            let alreadyDeleted = 0;
            collector.on('collect', m=>{
                if(m.content == '!yes' && m.author.id == message.author.id && alreadyDeleted == 0){
                    alreadyDeleted = 1;
                    itemsDB.all(query, [], (err, rows)=>{
                        if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    });
                    return message.channel.send(essentials.craftMessage("check", `Item removed successfully.`));
                }
            });

            collector.on('end', collected=>{
                if(collected.size == 0){
                    return message.channel.send(essentials.craftMessage("error", `<@${message.author.id}> You didn't answer in 60s`));
                }
            });
        });
        
    }
}

module.exports = RemoveItemCommand;
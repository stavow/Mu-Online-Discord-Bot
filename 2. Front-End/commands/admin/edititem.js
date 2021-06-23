const commando = require('discord.js-commando')
var essentials = require('../essentials');
const sqlite = require('sqlite3');

class EditItemCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'edititem',
            group: 'admin',
            memberName: 'edititem',
            description: 'Edits and existing item'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("EDITITEMCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("edititem"));

        let itemsDB = new sqlite.Database('./db/mubotdata.db');

        if(args.indexOf(', ') == -1){
            return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        }
        else{
            let cols = args.split(', ');
            let query = `UPDATE items SET `;
            var resp = 0;
            var foundId = 0;
            var id = 0;
            for(var i = 0; i < cols.length; i++){
                resp = essentials.isValidColumn(cols[i].split('=')[0], cols[i].split('=')[1]);
                if(cols[i].split('=')[0] == 'id'){
                    foundId = 1;
                }   
                switch(resp[0]){
                    case 1:
                        if(resp[1] == 'number' && cols[i].split('=')[0] != 'id'){
                            query += `${cols[i].split('=')[0]}=${cols[i].split('=')[1]}`;
                            if(i + 1 < cols.length)
                                query += ',';
                        }
                        else if(resp[1] == 'string' && cols[i].split('=')[0] != 'id'){
                            query += `${cols[i].split('=')[0]}='${cols[i].split('=')[1]}'`;
                            if(i + 1 < cols.length)
                                query += ',';
                        }
                        else if (cols[i].split('=')[0] == 'id'){
                            id = cols[i].split('=')[1];
                        }
                        break;
                    case 2:
                        return message.channel.send(essentials.craftMessage("error", `Value for ${cols[i].split('=')[0]} should be a ${resp[1]}`));
                    case 3:
                        return message.channel.send(essentials.craftMessage("error", `Column ${cols[i].split('=')[0]} doesn't exist.`));
                }
            }

            if(!foundId) return message.channel.send(essentials.craftMessage("error", "No id column was given, item couldn't be found!"));
            query += ` WHERE id=${id}`;
            itemsDB.all(query, [], (err, rows) => {
                if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                else return message.channel.send(essentials.craftMessage("check", `Item ID: ${id} has been edited successfully.`));
            });
        }
    }
}

module.exports = EditItemCommand;
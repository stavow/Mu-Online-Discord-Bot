const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetResetsCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setresets',
            group: 'admin',
            memberName: 'setresets',
            description: 'Set resets for a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETRESETSCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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
        return message.channel.send(essentials.getDefaultMessage("noperms"))
        
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setresets"));

        //Vars Declaration
        var character = args.split(" ")[0];
        var resets = args.split(" ")[1];

        essentials.serverListCommand(character);

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        //Checking if stat type exist, if not exist, if it does get account id
        if(character=="" || character==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        if(isNaN(resets) || resets=="" || resets==undefined || parseInt(resets) < 0) return message.channel.send(essentials.getDefaultMessage("wrongusage")); 
        
        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL"), RESETSCOL = essentials.getInfo("RESETSCOL");
        

        setTimeout(setResets, 1000);
   
        function setResets()
        {
            conn.connect(function(err) {
                if(err) {conn.close();return console.log(err)};

                req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${RESETSCOL}=${resets} WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close();return console.log(err)};
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};

                    message.channel.send(essentials.craftMessage("check", `Character ${character} now has resets ${resets}`));
                    conn.close();
                });
            });        
        }
    }
}

module.exports = SetResetsCommand;
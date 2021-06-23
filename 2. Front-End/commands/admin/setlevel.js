const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetLevelCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setlevel',
            group: 'admin',
            memberName: 'setlevel',
            description: 'Set level for a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETLEVELCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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
        
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setlevel"));

        //Vars Declaration
        var character = args.split(" ")[0];
        var level = args.split(" ")[1];
        var maxLevel = 400;

        essentials.serverListCommand(character);

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        //Checking if stat type exist, if not exist, if it does get account id
        if(character=="" || character==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        if(isNaN(level) || level=="" || level==undefined || parseInt(level) > maxLevel || parseInt(level) <= 0) return message.channel.send(essentials.getDefaultMessage("wrongusage")); 
        
        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL"), LEVELCOL = essentials.getInfo("LEVELCOL");
        let q = `UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${LEVELCOL}=${level} WHERE ${NAMECOL}='${character}'`;
        
        setTimeout(setLevel, 1500);
      
        function setLevel()
        {
            conn.connect(function(err) {
                req.query(q, function(err, data){
                    if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) return message.channel.send(essentials.getDefaultMessage("characternoexist"));

                    message.channel.send(essentials.craftMessage("check", `Character ${character} is now level ${level}`));
                    conn.close();
                });
            });  
        }
    }
}

module.exports = SetLevelCommand;
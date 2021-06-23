const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetPointsCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setpoints',
            group: 'admin',
            memberName: 'setpoints',
            description: 'Set point for a specific stat.'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETPOINTSCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setpoints"));
        //Vars Declaration
        var character = args.split(" ")[0];
        var stat_type = args.split(" ")[1];
        var amount = parseInt(args.split(" ")[2]);
        var stat_type_db = "";


        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        essentials.switchCommand(character);

        let CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), SCHEMA = essentials.getInfo("SCHEMA"), NAMECOL = essentials.getInfo("NAMECOL"), STRCOL = essentials.getInfo("STRCOL"),
            DEXCOL = essentials.getInfo("DEXCOL"), VITCOL = essentials.getInfo("VITCOL"), ENECOL = essentials.getInfo("ENECOL"), COMCOL = essentials.getInfo("COMCOL");
            
        //Checking if stat type exist, if not exist, if it does get account id
        if(isNaN(amount)) return message.channel.send(essentials.craftMessage("error", `Amount given isn't a number`));

        switch(stat_type){
            case "str": stat_type_db=STRCOL;break;
            case "agi": stat_type_db=DEXCOL;break;
            case "vit": stat_type_db=VITCOL;break;
            case "ene": stat_type_db=ENECOL;break;
            case "cmd": stat_type_db=COMCOL;break;
            default: stat_type_db = "fallback";
        }
        
        if(stat_type_db == "fallback") return message.channel.send(essentials.craftMessage("error", "Stat type doesn't exist. Types: [str | agi | vit | ene | cmd]"));

        setTimeout(setPoints, 1000);

        function setPoints(){
            conn.connect(function(err) {
                if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET [${stat_type_db}] = ${amount} WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return essentials.getDefaultMessage("characternoexist");}
                    message.channel.send(essentials.craftMessage("check", `Set ${amount} to ${stat_type_db} for character ${character}`));

                    conn.close();
                });
            });          
        }      
    }
}

module.exports = SetPointsCommand;
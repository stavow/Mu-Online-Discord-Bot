const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetPKLevelCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setpklevel',
            group: 'admin',
            memberName: 'setpklevel',
            description: 'Set PK Level for a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETPKLEVELCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setpklevel"));

        //Vars Declaration
        var character = args.split(" ")[0];
        var pkLevel = parseInt(args.split(" ")[1]);

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        var pkTopHero = parseInt(essentials.getInfo("PKTOPHERO"));
        var pkTopMurderer = parseInt(essentials.getInfo("PKTOPMURDERER"));
        var pkCommoner = parseInt(parseInt(essentials.getInfo("PKFIRSTMURDERERLEVEL")) - 1);

        //Checking if stat type exist, if not exist, if it does get account id
        if(character=="" || character==undefined || character.length <= 4 || character < 0) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        if(!(!isNaN(pkLevel) && pkLevel >= pkTopHero && pkLevel <= pkTopMurderer)) return message.channel.send(essentials.craftMessage("error", `Pk level sould be between ${pkTopHero} and ${pkTopMurderer}.`)); 
        
        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL"), PKLEVELCOL = essentials.getInfo("PKLEVELCOL");

        essentials.switchCommand(character);

        setTimeout(setPKLevel, 1000);
   
        function setPKLevel()
        {
            conn.connect(function(err) {
                if(err) {conn.close();return console.log(err)};

                req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${PKLEVELCOL}=${pkLevel} WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close();return console.log(err)};
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};
    
                    var pkFormatted = "";
                    if(pkLevel < pkCommoner) pkFormatted = "Hero"
                    else if(pkLevel > pkCommoner) pkFormatted = "Murderer"
                    else pkFormatted = "Commmoner"
    
                    message.channel.send(essentials.craftMessage("check", `Character ${character} is now a ${pkFormatted}`));
                    conn.close();
                });
            });
        }
    }
}

module.exports = SetPKLevelCommand;
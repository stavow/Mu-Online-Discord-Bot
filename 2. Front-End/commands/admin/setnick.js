const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetNickCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setnick',
            group: 'admin',
            memberName: 'setnick',
            description: 'Set given nick for a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETNICKCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setnick"));

        //Vars Declaration
        var nick = "";
        var character = "";
        var cond = new RegExp("^[A-Za-z0-9]+$");

        character = args.split(" ")[0];
        nick = args.split(" ")[1];

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);   
        
        essentials.serverListCommand(character);

        //Checking if stat type exist, if not exist, if it does get account id
        if(character=="" || character==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        if(!cond.test(nick) || nick == "" || nick == undefined || nick.length > 10 || nick.length < 4) return message.channel.send(essentials.getDefaultMessage("wrongusage")); 
        
        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL");
        
        setTimeout(setNick, 1000);
   
        function setNick()
        {
            conn.connect(function(err){
                req.query(`BEGIN IF NOT EXISTS (SELECT * FROM [${SCHEMA}].[${CHARACTERTBL}] WHERE [${NAMECOL}]='${nick}') BEGIN UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET [${NAMECOL}]='${nick}' WHERE [${NAMECOL}]='${character}' UPDATE AccountCharacter SET GameID1='${nick}' WHERE GameID1='${character}' UPDATE AccountCharacter SET GameID2='${nick}' WHERE GameID2='${character}' UPDATE AccountCharacter SET GameID3='${nick}' WHERE GameID3='${character}'UPDATE AccountCharacter SET GameID4='${nick}' WHERE GameID4='${character}'UPDATE AccountCharacter SET GameID5='${nick}' WHERE GameID5='${character}' END END`, function(err, data){
                    //Error logging
                    if(err) {conn.close();return console.log(err)};
                    if(data.rowsAffected.length < 1) {return message.channel.send(essentials.getDefaultMessage("characternoexist"));}
                    else if(data.rowsAffected[0] == 0) {return message.channel.send(essentials.craftMessage("error", `Character with the nick already exists`));}

                    message.channel.send(essentials.craftMessage("check", `Character nick's changed successfully.`));
                    conn.close();
                });
            });
        }
    }
}

module.exports = SetNickCommand;
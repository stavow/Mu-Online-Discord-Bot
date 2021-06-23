const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetClassCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setclass',
            group: 'admin',
            memberName: 'setclass',
            description: 'Set Class of a Character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETCLASSCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setclass"));

        //Vars Declaration
        var character = args.split(" ")[0];
        var classname = args.split(" ")[1];
        var classname_formatted = "";
        var classcode = 0;

        //Get class code
        switch(classname){
            case "dk": classcode = 16;classname_formatted = "Dark Knight"; break;
            case "bk": classcode = 17;classname_formatted = "Blade Knight"; break;
            case "bm": classcode = 18;classname_formatted = "Blade Master"; break;
            case "dw": classcode = 0;classname_formatted = "Dark Wizard"; break;
            case "sm": classcode = 1;classname_formatted = "Soul Master"; break;
            case "gm": classcode = 2;classname_formatted = "Grand Master"; break;
            case "fe": classcode = 32;classname_formatted = "Fairy Elf"; break;
            case "me": classcode = 33;classname_formatted = "Muse Elf"; break;
            case "he": classcode = 34;classname_formatted = "High Elf"; break;
            case "mg": classcode = 48;classname_formatted = "Magic Gladiator"; break;
            case "dm": classcode = 50;classname_formatted = "Duel Master"; break;
            case "dl": classcode = 64;classname_formatted = "Dark Lord"; break;
            case "le": classcode = 65;classname_formatted = "Lord Emperor"; break;
            case "sr": classcode = 80;classname_formatted = "Summoner"; break;   
            case "bs": classcode = 81;classname_formatted = "Bloody Summoner"; break;   
            case "dr": classcode = 82;classname_formatted = "Dimension Master"; break; 
            case "rf": classcode = 96;classname_formatted = "Rage Fighter"; break; 
            case "fm": classcode = 98;classname_formatted = "Fist Master"; break;           
        }

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        essentials.serverListCommand(character);

        //Checking if stat type exist, if not exist, if it does get account id
        if(classname_formatted=="") return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        
        let SCHEMA = essentials.getInfo("SCHEMA"), CLASSCOL = essentials.getInfo("CLASSCOL"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"),
            NAMECOL = essentials.getInfo("NAMECOL");

        setTimeout(setClass, 1000);
   
        function setClass()
        {
            conn.connect(function(err) {
                if(err) {conn.close();return console.log(err)};

                req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${CLASSCOL}=${classcode} WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close();return console.log(err)};
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};
                    
                    message.channel.send(essentials.craftMessage("check", `Changed ${character} Class to ${classname_formatted} Successfully!`));
                });
            });         
        }
    }
}

module.exports = SetClassCommand;
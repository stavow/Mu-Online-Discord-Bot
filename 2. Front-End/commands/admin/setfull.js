const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetFullCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setfull',
            group: 'admin',
            memberName: 'setfull',
            description: 'Set a character full stats'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETFULLCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setfull"));

        //Vars Declaration
        var character = args.split(" ")[0];
        var isLord = args.split(" ")[1];
        var fullstat = parseInt(essentials.getInfo("FULLSTAT"));

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        essentials.switchCommand(character);

        //Checking if stat type exist, if not exist, if it does get account id
        if(character == "") return message.channel.send(essentials.getDefaultMessage("wrongusage"));

        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"), STRCOL = essentials.getInfo("STRCOL"), DEXCOL = essentials.getInfo("DEXCOL"),
            VITCOL = essentials.getInfo("VITCOL"), ENECOL = essentials.getInfo("ENECOL"), COMCOL = essentials.getInfo("COMCOL"), NAMECOL = essentials.getInfo("NAMECOL");

        setTimeout(setFull, 1000);
         
        function setFull()
        {
            conn.connect(function(err){
                if(err) {conn.close();return console.log(err)};

                if(isLord == "1"){
                    req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${STRCOL}=${fullstat}, ${DEXCOL}=${fullstat}, ${VITCOL}=${fullstat}, ${ENECOL}=${fullstat}, ${COMCOL}=${fullstat} WHERE ${NAMECOL}='${character}'`, function(err, data){
                        if(err) {conn.close();return console.log(err)};
                        if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};

                        message.channel.send(essentials.craftMessage("check", `Character ${character} now has full stats.`));
                        conn.close();
                    });
                }
                else{
                    req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${STRCOL}=${fullstat}, ${DEXCOL}=${fullstat}, ${VITCOL}=${fullstat}, ${ENECOL}=${fullstat} WHERE ${NAMECOL}='${character}'`, function(err, data){
                        if(err) {conn.close();return console.log(err)};
                        if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};

                        message.channel.send(essentials.craftMessage("check", `Character ${character} now has full stats.`));
                        conn.close();
                    });
                }
            });
        }
    }
}

module.exports = SetFullCommand;
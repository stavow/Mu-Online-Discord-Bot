const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class ForceMarryCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'forcemarry',
            group: 'admin',
            memberName: 'forcemarry',
            description: 'Set a marry to a person'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("FORCEMARRYCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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
        
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("forcemarry"));

       //Vars Declaration
        var character = args.split(" ")[0];
        var marry = args.split(" ")[1];

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);   
        
        essentials.switchCommand(character);
        essentials.switchCommand(marry);

        //Checking if stat type exist, if not exist, if it does get account id
        if(character=="" || character==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        if(marry=="" || marry==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        
        let MARRIEDCOL = essentials.getInfo("MARRIEDCOL"), SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTBL"),
            NAMECOL = essentials.getInfo("NAMECOL"), MARRYNAMECOL = essentials.getInfo("MARRYNAMECOL");

        setTimeout(forceMarry, 1000);
       
        function forceMarry()
        {
            conn.connect(function(err){
                if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                req.query(`IF (SELECT ${MARRIEDCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${character}') = 0 BEGIN IF(SELECT ${MARRIEDCOL} FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${marry}') = 0 BEGIN UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET ${MARRIEDCOL}=1, ${MARRYNAMECOL} = '${marry}' WHERE ${NAMECOL}='${character}'; UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET ${MARRIEDCOL}=1, ${MARRYNAMECOL}='${character}' WHERE ${MARRYNAMECOL}='${marry}' END END`, function(err, data){
                    //Error logging
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    if(data == undefined) {conn.close();return message.channel.send(essentials.getDefaultMessage("error"))}
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.craftMessage("error", `One or both of the characters are not exists or One of both of the characters are already married`));}

                    message.channel.send(essentials.craftMessage("check", `:bride_with_veil: :man_in_tuxedo: ${character} is now married to ${marry} , Congartulations :partying_face:!`));
                    //Success
                    conn.close();
                });
            });
        }
    }
}

module.exports = ForceMarryCommand;
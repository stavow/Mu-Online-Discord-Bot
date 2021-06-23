const commando = require('discord.js-commando')
var sql = require('mssql');
var essentials = require('../essentials');

class SetMoneyCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'setmoney',
            group: 'admin',
            memberName: 'setmoney',
            description: 'Set given money for a character'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("SETMONEYCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("setmoney"));

        //Vars Declaration
        var character = args.split(" ")[0];
        var money = args.split(" ")[1];
        var maxMoney = 2000000000;

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        essentials.switchCommand(character);

        //Checking if stat type exist, if not exist, if it does get account id
        if(character=="" || character==undefined) return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        if(isNaN(money) || money=="" || money==undefined || parseInt(money) > maxMoney || parseInt(money) < -1) return message.channel.send(essentials.getDefaultMessage("wrongusage")); 
        
        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERTBL = essentials.getInfo("CHARACTERSTABLE"),
            NAMECOL = essentials.getInfo("NAMECOL"), MONEYCOL = essentials.getInfo("MONEYCOL");


        setTimeout(setMoney, 1000);
   
        function setMoney()
        {
            conn.connect(function(err){
                if(money == -1){
                    req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${MONEYCOL}=${maxMoney} WHERE ${NAMECOL}='${character}'`, function(err, data){
                        if(err) {conn.close();return console.log(err)};
                        if (data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};

                        message.channel.send(essentials.craftMessage("check", `Character ${character} now got ${maxMoney} zen`));
                        conn.close();

                    });
                }
                else{
                    req.query(`UPDATE [${SCHEMA}].[${CHARACTERTBL}] SET ${MONEYCOL}=${money} WHERE ${NAMECOL}='${character}'`, function(err, data){
                        if(err) {conn.close();return console.log(err)};
                        if (data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close();return message.channel.send(essentials.getDefaultMessage("characternoexist"))};

                        message.channel.send(essentials.craftMessage("check", `Character ${character} now got ${money} zen`));
                        conn.close();

                    });
                }

            });
        }
    }
}

module.exports = SetMoneyCommand;
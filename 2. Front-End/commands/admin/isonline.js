const commando = require('discord.js-commando');
var essentials = require('../essentials');
const sql = require('mssql');

class IsOnlineCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'isonline',
            group: 'admin',
            memberName: 'isonline',
            description: 'Check if an nameount or character is online'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("ISONLINECOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
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

        if(args == "usage") return message.channel.send(essentials.getUsageInfo("isonline"));

        var mode = args.split(' ')[0];
        var name = args.split(' ')[1];
        var accname = "";
        if(mode == undefined || name == undefined || mode == "" || name == "")  return message.channel.send(essentials.getDefaultMessage("wrongusage"));

        var cond = new RegExp("^[A-Za-z0-9]+$");
        if(!cond.test(name) || name == "" || name == undefined || name.length > 10 || name.length < 4) return message.channel.send(essentials.getDefaultMessage("wrongusage"));

        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);

        let SCHEMA = essentials.getInfo("SCHEMA"), STATSTBL = essentials.getInfo("STATSTABLE"), MEMBERIDCOL = essentials.getInfo("MEMBERSIDCOL"), CONNECTSTATCOL = essentials.getInfo("CONNECTSTATCOL"), 
            CHARACTERSTABLE = essentials.getInfo("CHARACTERSTABLE"), ACCOUNTIDCOL = essentials.getInfo("ACCOUNTIDCOL"), NAMECOL = essentials.getInfo("NAMECOL");

        if(mode == "acc"){
            accname = name;
            isOnline();
        }
        else if(mode == "char"){
            getAccName();
        }
        else{
            return message.channel.send(essentials.getDefaultMessage("wrongusage"));
        }
        
        function getAccName(){
            conn.connect(function(err){
                req.query(`SELECT [${ACCOUNTIDCOL}] FROM [${SCHEMA}].[${CHARACTERSTABLE}] WHERE [${NAMECOL}]='${name}'`, function(err, data){
                    if(data == undefined || data.recordset == undefined){  
                        return message.channel.send(essentials.getDefaultMessage("error"));
                    }

                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        return message.channel.send(essentials.getDefaultMessage("characternoexist"));
                    }
                    else{
                        accname = data.recordset[0][ACCOUNTIDCOL];
                    }
                    conn.close();
                    setTimeout(isOnline, 200);
                });
            });
        }

        function isOnline(){
            conn.connect(function(err){
                req.query(`SELECT ${CONNECTSTATCOL} FROM [${SCHEMA}].[${STATSTBL}] WHERE ${MEMBERIDCOL}='${accname}'`, function(err, data){
                    if(data == undefined || data.recordset == undefined){  
                        return message.channel.send(essentials.getDefaultMessage("error"));
                    }
                    
                    if(data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        return message.channel.send(essentials.getDefaultMessage("characternoexist"));
                    }
    
                    if(data.recordset[0].ConnectStat == 1){
                        message.channel.send(essentials.craftMessage("info", `${name} is online.`));
                    }
                    else if (data.recordset[0].ConnectStat == 0){
                        message.channel.send(essentials.craftMessage("info", `${name} is offline.`));
                    }
                    conn.close();
                });
            });    
        }
    }
}

module.exports = IsOnlineCommand;
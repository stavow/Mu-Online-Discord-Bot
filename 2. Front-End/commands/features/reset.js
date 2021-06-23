const commando = require('discord.js-commando')
var sql = require('mssql');
const essentials = require('../essentials');
var sqlite = require('sqlite3');

class ResetCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'reset',
            group: 'features',
            memberName: 'reset',
            description: 'Reset'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("RESETCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("reset"));

        var character = "";
        let charsDB = new sqlite.Database('./db/mubotdata.db');
        const resetLevel = parseInt(essentials.getInfo("RESETLEVEL"));

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);

        charsDB.all(`SELECT char FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
            if(err) {console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
            if(rows.length < 1) return message.channel.send(essentials.getDefaultMessage("noselectedcharacter"));
            character = rows[0].char;
            essentials.serverListCommand(character);
        });

        let SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL"), 
            RESETSCOL = essentials.getInfo("RESETSCOL"), LEVELCOL = essentials.getInfo("LEVELCOL");
        

        setTimeout(checkEligble, 1000);
        function checkEligble()
        {
            
            conn.connect(function(err){
                req.query(`SELECT [${LEVELCOL}] FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0) {conn.close(); return essentials.getDefaultMessage("characternoexist");}
                    if(data.recordset[0][LEVELCOL] < resetLevel) {conn.close(); return message.channel.send(essentials.craftMessage("error", `You have to be level ${resetLevel} to reset your character!`));}
                
                    setTimeout(reset, 500);                
                    function reset(){
                        req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET [${RESETSCOL}] = [${RESETSCOL}] + 1 WHERE ${NAMECOL}='${character}'`, function(err, data){
                            if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
                        });
                        req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET [${LEVELCOL}] = 1 WHERE ${NAMECOL}='${character}'`, function(err, data){
                            if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}
        
                            message.channel.send(essentials.craftMessage("check", `${character} has been reset successfully!`)); 
                            conn.close();
                        });
                    }
                });
            });  
        }


    }

}

module.exports = ResetCommand;
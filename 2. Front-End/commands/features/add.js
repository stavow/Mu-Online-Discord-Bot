const commando = require('discord.js-commando')
var sql = require('mssql');
const essentials = require('../essentials');
var sqlite = require('sqlite3');

class AddCommand extends commando.Command
{
    constructor(client)
    {
        super(client,{
            name: 'add',
            group: 'features',
            memberName: 'add',
            description: 'Add to stats'
        });
    }

    async run(message, args)
    {
        if(await essentials.getInfo("ADDCOMMAND") == "1") return message.channel.send(essentials.getDefaultMessage("commanddisabled"));
        if(await message.channel.id != essentials.getInfo("COMMANDSCHANNEL")) {message.delete();return;}
        if(args == "usage") return message.channel.send(essentials.getUsageInfo("add"));
        //Vars Declaration
        var stat_type = args.split(" ")[0];
        var amount = args.split(" ")[1];
        var stat_type_db = "";
        var character = "";
        let charsDB = new sqlite.Database('./db/mubotdata.db');

        //Declaring SQL Connection Variables
        var conn = new sql.ConnectionPool(dbConfig);
        var req = new sql.Request(conn);    

        //Checking if stat type exist, if not exist, if it does get account id
        if(stat_type_db="") return message.channel.send(essentials.craftMessage("error", "Stat type doesn't exist. Types: [str | agi | vit | ene | cmd]"));

        charsDB.all(`SELECT char FROM charsel WHERE discord_id='${message.author.id}'`, [], (err, rows) => {
            if(err) {message.channel.send(essentials.getDefaultMessage("error"));return console.log(err)}
            if(rows.length < 1) return message.channel.send(essentials.getDefaultMessage("noselectedcharacter"));
            character = rows[0].char;
            essentials.switchCommand(character);
        });

        let LEVELUPPOINTCOL = essentials.getInfo("LEVELUPPOINTCOL"), SCHEMA = essentials.getInfo("SCHEMA"), CHARACTERSTBL = essentials.getInfo("CHARACTERSTABLE"), NAMECOL = essentials.getInfo("NAMECOL");

        setTimeout(getLevelUpPoints, 200);
   
        function getLevelUpPoints()
        {
            conn.connect(function(err){
                req.query(`SELECT [${LEVELUPPOINTCOL}] FROM [${SCHEMA}].[${CHARACTERSTBL}] WHERE ${NAMECOL}='${character}'`, function(err, data){
                    //Error logging
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                    
                    //Charcter isn't exist fallback
                    if(data == undefined || data.recordset == undefined || data.rowsAffected.length < 1 || data.rowsAffected[0] == 0){
                        message.channel.send(essentials.getDefaultMessage("characternoexist"));
                        conn.close();
                        return;
                    }

                    //Amount to add is higher than points the character has
                    if(data.recordset[0][LEVELUPPOINTCOL]< amount){
                        message.channel.send(essentials.craftMessage("error", "Given amount to add is higher than the amount of levelup points that Character has."));
                        conn.close();
                        return;
                    }

                    
                    conn.close();
                    setTimeout(Add, 500);
                });
            });
        }
        
        function Add(){
            switch(stat_type){
                case "str": stat_type_db=essentials.getInfo("STRCOL");break;
                case "agi": stat_type_db=essentials.getInfo("DEXCOL");break;
                case "vit": stat_type_db=essentials.getInfo("VITCOL");break;
                case "ene": stat_type_db=essentials.getInfo("ENECOL");break;
                case "cmd": stat_type_db=essentials.getInfo("CMDCOL");break;
            }
            conn.connect(function(err) {
                if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}


                req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET ${stat_type_db} = ${stat_type_db} + ${parseInt(amount)} WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                });
                req.query(`UPDATE [${SCHEMA}].[${CHARACTERSTBL}] SET [${LEVELUPPOINTCOL}] = [${LEVELUPPOINTCOL}] - ${amount} WHERE ${NAMECOL}='${character}'`, function(err, data){
                    if(err) {conn.close(); console.log(err); return message.channel.send(essentials.getDefaultMessage("error"));}

                    message.channel.send(essentials.craftMessage("check", `Added ${amount} to ${stat_type_db} on ${character}`));
                });
            });
        }
    }
}

module.exports = AddCommand;